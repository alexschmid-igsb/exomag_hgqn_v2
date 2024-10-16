
const fs = require('fs')

const db = require('../database/connector').connector
const users = require('../users/manager')

const lodash = require('lodash')

const console = require('../util/PrettyfiedConsole')
const BackendError = require('../util/BackendError')
const StackTrace = require('stacktrace-js')

const xlsx = require('xlsx')
xlsx.helper = require('../util/xlsx-helper')

const ExcelProcessing = require('./excel_template/processing.js')
const GenericProcessing = require('./generic/processing.js')
const DatabaseImport = require('./DatabaseImport.js')

const Readable = require('node:stream').Readable
const { parse } = require('csv-parse')

const WorkerThreads = require('worker_threads')




async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}



async function getImportInstance(importId, userId, loadFileData = false) {
    try {
        let dbRes = await db.find('STATIC_imports', {
            fields: loadFileData === false ? '-uploadedFiles.data' : undefined,
            filter: { _id: importId, user: userId },
            populate: [{ path: 'user', select: '-password' }]
        })
        if (lodash.isArray(dbRes.data) === false) {
            throw new Error('database query result is not an array')
        }
        if (dbRes.data.length != 1) {
            throw new Error('database query does not return a single item')
        }
        return dbRes.data[0]
    } catch (err) {
        throw new BackendError(`Unexpected Error: Could not load import [importId: ${importId}, userId: ${userId}]`, 500, err)
    }
}


async function getUser(userId) {
    try {
        let dbRes = await db.find('CORE_users', {
            fields: '-password',
            filter: { _id: userId }
        })
        if (lodash.isArray(dbRes.data) === false) {
            throw new Error('database query result is not an array')
        }
        if (dbRes.data.length != 1) {
            throw new Error('database query does not return a single item')
        }
        return dbRes.data[0]
    } catch (err) {
        throw new BackendError(`Unexpected Error: Could not load user [userId: ${userId}]`, 500, err)
    }
}


async function updateImportInstance(importId, userId, update) {
    try {
        let dbRes = await db.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [{ path: 'user', select: '-password' }]
        }, update)
        if (lodash.isObject(dbRes.data) === false) {
            throw new Error('database query result is not an object')
        }
        return dbRes.data
    } catch (err) {
        throw new BackendError(`Unexpected Error: Could not update import [importId: ${importId}, userId: ${userId}]`, 500, err)
    }
}



async function loadExcelTemplateRowData(importId, userId) {

    // load import instance with file data
    let importInstance = await getImportInstance(importId, userId, true)
    // console.dir(importInstance, { depth: null })

    // check files
    if (lodash.isArray(importInstance.uploadedFiles) === false || importInstance.uploadedFiles.length !== 1) {
        throw new BackendError("Unexpected Error: Could not get uploaded files from import instance")
    }

    // get file
    const file = importInstance.uploadedFiles[0]
    if (file == null || file.data == null || lodash.isFunction(file.data.length) === false || file.size <= 0 || file.size !== file.data.length()) {
        throw new BackendError("Unexpected Error: File data missing or file size mismatch")
    }

    // get sheet name
    let sheetName = importInstance?.valueMapping?.excel?.dataSheet
    if (lodash.isString(sheetName) === false || sheetName.length <= 0) {
        throw new BackendError("Unexpected Error: Missing excel sheet name")
    }

    // load rows
    let excelData = xlsx.helper.parseRowsFromBuffer(file.data.buffer, sheetName, 1)
    if (excelData.rows.length <= 0) {
        throw new BackendError(`Error: Excel sheet "${sheetName}" has no rows`)
    }

    return excelData.rows
}



async function loadDataFromCSV(importId, userId) {

    // load import instance with file data
    let importInstance = await getImportInstance(importId, userId, true)
    // console.dir(importInstance, { depth: null })

    // check files
    if (lodash.isArray(importInstance.uploadedFiles) === false || importInstance.uploadedFiles.length !== 1) {
        throw new BackendError("Unexpected Error: Could not get uploaded files from import instance")
    }

    // get file
    const file = importInstance.uploadedFiles[0]
    if (file == null || file.data == null || lodash.isFunction(file.data.length) === false || file.size <= 0 || file.size !== file.data.length()) {
        throw new BackendError("Unexpected Error: File data missing or file size mismatch")
    }

    // load csv data from file buffer
    let rowData = await new Promise((resolve, reject) => {

        let inputStream = Readable.from(file.data.buffer)
        let records = []

        const parser = parse({
            columns: true,
            delimiter: importInstance.uploadFormatConfig.csv.field_delimiter,
            // record_delimiter:                            steht per default auf 'auto detect', das sollte man erstmal auch so lassen
            trim: true,
            skip_empty_lines: true
        })

        parser.on('readable', function () {
            let record
            while ((record = parser.read()) !== null) {
                records.push(record)
            }
        })

        parser.on('end', function () {
            resolve(records)
        })

        parser.on('error', function (err) {
            reject(new Error('could not parse csv stream', { cause: err }))
        })

        inputStream.pipe(parser)
    })

    console.log("CSV DATA")
    console.log(rowData)

    // transform csv data to mimic excel input
    for(let row of rowData) {
        for(let key in row) {
            if (row.hasOwnProperty(key)) {
                row[key] = { value: row[key] }
            }
        }
    }

    console.log("CSV DATA (excel style)")
    console.log(rowData)

    return rowData
}





async function executeValidation(importId, userId, rowData) {

    /*
    const user = await getUser(userId)
    const sequencingLab = user.lab
    if(sequencingLab == null) {
        throw new BackendError(`Unexpected Error: The user has no lab assigend`)
    }
    */

    const scheme = db.getScheme('GRID_cases')

    let importInstance = await getImportInstance(importId, userId)

    const sequencingLab = importInstance?.user?.lab
    if (sequencingLab == null) {
        throw new BackendError(`Unexpected Error: The user has no lab assigend`)
    }

    const excelProcessing = ExcelProcessing.createInstance({ mapping: importInstance?.valueMapping?.excel?.mapping })
    const genericProcessing = GenericProcessing.createInstance({ scheme: scheme, sequencingLab: sequencingLab })

    let entries = []

    let i = 0
    for (const excelRow of rowData) {

        console.log("WORKER: ITERATION #" + i)

        // get current import instance
        importInstance = await getImportInstance(importId, userId)

        // abort processing if state change from 'RUNNING' to something else (for example 'CANCELED' by api request by user through user interface)
        if (importInstance?.processing?.excel?.state !== 'RUNNING') {
            return {
                finished: false,
                entries: entries
            }
        }

        // create processing record
        let record = ExcelProcessing.createEmptyRecord()
        record.excel = excelRow

        // excel processing
        excelProcessing.process(record)

        // generic processing
        await genericProcessing.process(record)

        // add processed record to etries
        entries.push(record)

        // update importInstance
        importInstance = await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    progress: {
                        ...importInstance?.processing?.excel.progress,
                        processed: i + 1,
                    }
                }
            }
        })

        // await sleep(1500)

        i++
    }

    // console.log(JSON.stringify(entries,null,4))

    return {
        finished: true,
        entries: entries
    }
}



async function main() {

    await db.initPromise
    await users.initPromise

    const {
        importId,
        userId
    } = WorkerThreads.workerData

    let importInstance = await getImportInstance(importId, userId)

    try {

        if (importId == null) {
            // TODO: hier einen unexpected error in die db posten
            throw new Error('Unexpected Error: Missing importId in import worker thread')
        }

        if (userId == null) {
            // TODO: hier einen unexpected error in die db posten
            throw new Error('Unexpected Error: Missing importId in import worker thread')
        }

        // check import state
        if (importInstance?.processing?.excel?.state !== 'PENDING') {
            // do not start processing unless state is 'PENDING'
            return
        }

        // update import state to 'RUNNING' and update progress values
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'RUNNING',
                    progress: {
                        processed: 0,
                        total: 0,
                    }
                }
            }
        })


        // load the data from excel or csv
        let rowData = null
        try {

            if (importInstance?.uploadFormat === 'csv') {

                rowData = await loadDataFromCSV(importId, userId)

            } else if (importInstance?.uploadFormat === 'excel_template') {

                rowData = await loadExcelTemplateRowData(importId, userId)

            } else {
                throw new Error(`unsupported upload format in worker: ${importInstance?.uploadFormat}`)
            }

        } catch (err) {

            // post error in import instance and return
            await updateImportInstance(importId, userId, {
                processing: {
                    ...importInstance?.processing,
                    excel: {
                        ...importInstance?.processing?.excel,
                        state: 'ERROR',
                        progress: {
                            processed: 0,
                            total: 0,
                        },
                        error: {
                            message: "Unexpected Error: Could not load data from exel sheet",
                            cause: {
                                name: err.name,
                                message: err.message,
                                stackTrace: await StackTrace.fromError(err)
                            }
                        }
                    }
                }
            })

            return
        }


        // update the progress values and update import state to 'RUNNING'
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'RUNNING',
                    progress: {
                        processed: 0,
                        total: rowData.length,
                    }
                }
            }
        })


        // execute validation
        const result = await executeValidation(importId, userId, rowData)

        // process validation results
        if (result.finished === true) {
            // es wird nur weiterprozessiert, wenn der main loop wirklich komplett durchgelaufen ist

            // TODO: VORÜBERGEHDEN HIER IN DIE DATENBANK SCHREIGEN
            // später wird die validierung und das schreiben in die Datenbank als zwei getrennte aktionen durchgeführt
            const databaseImport = DatabaseImport.createInstance()
            await databaseImport.importRecords(result.entries)

            await updateImportInstance(importId, userId, {
                processing: {
                    ...importInstance?.processing,
                    excel: {
                        ...importInstance?.processing?.excel,
                        state: 'FINISHED',
                        progress: {
                            processed: rowData.length,
                            total: rowData.length,
                        }
                    },
                    processedEntries: result.entries
                }
            })

        } else {
            // dieser fall sollte eigentlich nur eintreten, wenn der validation loop vorzeitig endet z.b. durch CANCEL
            // unexpected errors gehen über den catch block
        }

        console.log("WORKER ENDED")

    } catch (err) {

        console.error(err)

        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'ERROR',
                    progress: {
                        processed: 0,
                        total: 0,
                    },
                    error: {
                        message: "Unexpected Error",
                        cause: {
                            name: err.name,
                            message: err.message,
                            stackTrace: await StackTrace.fromError(err)
                        }
                    }
                }
            }
        })


    }
}



// Hier sollten dann eigentlich nur noch die fehler ankommen, die im globalen catch block entstehen...

main().catch(err => console.error(err))












/*

// check if loop finished
if(processed.finished === true) {


    // ================================================================================================================
    // IMPORT IN DIE DATENBANK

    console.log("IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT IMPORT")
    console.log(importInstance?.uploadedFiles?.[0]?.name)

    if(importInstance?.uploadedFiles?.[0]?.name === 'exomag_testdaten.xlsx') {
        console.log("JA")

        // upload

            const variants = [
                {
                    "_id": "GRCh38-X-21978066-A-G",
                    "GRCh38": {
                        "gDNA": "NC_000023.11:g.21978066A>G",
                        "build": "GRCh38",
                        "chr": "X",
                        "pos": 21978066,
                        "ref": "A",
                        "alt": "G"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000023.10:g.21996184A>G",
                        "build": "GRCh37",
                        "chr": "X",
                        "pos": 21996184,
                        "ref": "A",
                        "alt": "G"
                    }
                },
                {
                    "_id": "GRCh38-6-7555825-G-A",
                    "GRCh38": {
                        "gDNA": "NC_000006.12:g.7555825G>A",
                        "build": "GRCh38",
                        "chr": "6",
                        "pos": 7555825,
                        "ref": "G",
                        "alt": "A"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000006.11:g.7556058G>A",
                        "build": "GRCh37",
                        "chr": "6",
                        "pos": 7556058,
                        "ref": "G",
                        "alt": "A"
                    }
                },
                {
                    "_id": "GRCh38-X-154030549-C-CTAGTGACG",
                    "GRCh37": {
                        "gDNA": "NC_000023.10:g.153296000_153296001insTAGTGACG",
                        "build": "GRCh37",
                        "chr": "X",
                        "pos": 153296000,
                        "ref": "C",
                        "alt": "CTAGTGACG"
                    },
                    "GRCh38": {
                        "gDNA": "NC_000023.11:g.154030549_154030550insTAGTGACG",
                        "build": "GRCh38",
                        "chr": "X",
                        "pos": 154030549,
                        "ref": "C",
                        "alt": "CTAGTGACG"
                    }
                },
                {
                    "_id": "GRCh38-17-2041587-G-:A",
                    "GRCh38": {
                        "gDNA": "NC_000017.11:g.2041587G>A",
                        "build": "GRCh38",
                        "chr": "17",
                        "pos": 2041587,
                        "ref": "G",
                        "alt": "A"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000017.10:g.1944881G>A",
                        "build": "GRCh37",
                        "chr": "17",
                        "pos": 1944881,
                        "ref": "G",
                        "alt": "A"
                    }
                },
                {
                    "_id": "GRCh38-17-2036585-C-T",
                    "GRCh38": {
                        "gDNA": "NC_000017.11:g.2036585C>T",
                        "build": "GRCh38",
                        "chr": "17",
                        "pos": 2036585,
                        "ref": "C",
                        "alt": "T"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000017.10:g.1939879C>T",
                        "build": "GRCh37",
                        "chr": "17",
                        "pos": 1939879,
                        "ref": "C",
                        "alt": "T"
                    }
                },
                {
                    "_id": "GRCh38-1-228097169-C-T",
                    "GRCh38": {
                        "gDNA": "NC_000001.11:g.228097169C>T",
                        "build": "GRCh38",
                        "chr": "1",
                        "pos": 228097169,
                        "ref": "C",
                        "alt": "T"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000001.10:g.228284870C>T",
                        "build": "GRCh37",
                        "chr": "1",
                        "pos": 228284870,
                        "ref": "C",
                        "alt": "T"
                    }
                },
                {
                    "_id": "GRCh38-20-63438711-C-T",
                    "GRCh38": {
                        "gDNA": "NC_000020.11:g.63438711C>T",
                        "build": "GRCh38",
                        "chr": "20",
                        "pos": 63438711,
                        "ref": "C",
                        "alt": "T"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000020.10:g.62070064C>T",
                        "build": "GRCh37",
                        "chr": "20",
                        "pos": 62070064,
                        "ref": "C",
                        "alt": "T"
                    }
                },
                {
                    "_id": "GRCh38-17-7222253-GAGA-G",
                    "GRCh38": {
                        "gDNA": "NC_000017.11:g.7222257_7222259del",
                        "build": "GRCh38",
                        "chr": "17",
                        "pos": 7222253,
                        "ref": "GAGA",
                        "alt": "G"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000017.10:g.7125576_7125578del",
                        "build": "GRCh37",
                        "chr": "17",
                        "pos": 7125572,
                        "ref": "GAGA",
                        "alt": "G"
                    }
                },
                {
                    "_id": "GRCh38-17-7224011-G-C",
                    "GRCh38": {
                        "gDNA": "NC_000017.11:g.7224011G>C",
                        "build": "GRCh38",
                        "chr": "17",
                        "pos": 7224011,
                        "ref": "G",
                        "alt": "C"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000017.10:g.7127330G>C",
                        "build": "GRCh37",
                        "chr": "17",
                        "pos": 7127330,
                        "ref": "G",
                        "alt": "C"
                    }
                },
                {
                    "_id": "GRCh38-X-65524082-T-C",
                    "GRCh38": {
                        "gDNA": "NC_000023.11:g.65524082T>C",
                        "build": "GRCh38",
                        "chr": "X",
                        "pos": 65524082,
                        "ref": "T",
                        "alt": "C"
                    },
                    "GRCh37": {
                        "gDNA": "NC_000023.10:g.64743962T>C",
                        "build": "GRCh37",
                        "chr": "X",
                        "pos": 64743962,
                        "ref": "T",
                        "alt": "C"
                    }
                }                        
            ]

            for(let item of variants) {
                try {
                    let dbRes = await db.find('GRID_variants', {
                        filter: { _id: item._id },
                    })
                    if(dbRes.data.length > 0) {
                        console.log("existiert: " + item._id)
                    } else {
                        await db.insert('GRID_variants',item)
                    }
                } catch(err) {
                    console.error(err)
                }
            }


            const cases = [
                {
                    "_id": "6a10dc2f-342b-48df-9d4b-be01cb667b3f",
                    "sequencingLab": "72d98c4a-5780-449b-b70a-849634deaa19",
                    "internalCaseId": "DE79NGSUKBD125229_87231",
                    "gestaltMatcherId": 7242,
                    "externalCaseId": "HWGU832",
                    "face2GeneId": 7201273,
                    "sex": "female",
                    "ageInMonths": 39,
                    "ageinYears": 3,
                    "prenatal": 12,
                    "dateOfBirth": "2019-08-18T22:00:00.000Z",
                    "startDerDiagnostik": "2022-06-30T22:00:00.000Z",
                    "befunddatum": "2022-08-31T22:00:00.000Z",
                    "diseaseCategory": "neurodevelopmental",
                    "caseStatus": "solved",
                    "hpoTerms":"HP:0001249;HP:0001999",
                    "singleDuoTrio":"trio",
                    "referringClinician":"Ibrahim",
                    "autozygosity":0.5,
                    "testConducted":"exome",
                    "changesInManagementOrTherapyAfterTest":"keine",
                    "secondaryOrIncidentalFindings":"nix",
                    "relevantFindingsForResearch":"bla",
                    "selektivvertrag":"ja",
                    "wetlabMetainfo":"was anderes",
                    "AutoCasc":"ca32",
                    "kommentar":"test case",
                    "variants": [
                        {
                            "variant": {
                                "reference": "GRCh38-X-21978066-A-G",
                                "transcript": "NM_004595.5:c.612A>G"
                            },
                            "gene":"SMS",
                            "variantSolvesCase":"primary",
                            "ifNewDiseaseGeneLevelOfEvidence":"Rgeg",
                            "acmg": {
                                "class": "likely pathogenic",
                                "criteria":"PM1,PM2,PP2,PP4,BP4"
                            },
                            "zygosity":"Hemizygous",
                            "segregationsanalyse":"transmitted from mother",
                            "modeOfInheritance":"X-linked",
                            "pubMedId":"23",
                            "clinvarAccessionId":"83738459"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-6-7555825-G-A",
                                "transcript": "NM_005270.4:c.1606G>T"
                            },
                            "gene":"NFKB1",
                            "variantSolvesCase":"primary",
                            "ifNewDiseaseGeneLevelOfEvidence":"wef",
                            "acmg": {
                                "class": "likely pathogenic",
                                "criteria": "PM1,PM2"
                            },
                            "zygosity":"homozygous ",
                            "segregationsanalyse":"de novo",
                            "modeOfInheritance":"recessive",
                            "pubMedId":"49",
                            "clinvarAccessionId":"2347"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-X-154030549-C-CTAGTGACG",
                                "transcript": "NM_002225.3:c.158G>A"
                            },
                            "gene":"DNMT3A",
                            "variantSolvesCase":"primary",
                            "ifNewDiseaseGeneLevelOfEvidence":"83jw",
                            "acmg": {
                                "class": "likely pathogenic",
                                "criteria": "PM2"
                            },
                            "zygosity":"hemi",
                            "segregationsanalyse":"de novo",
                            "modeOfInheritance":"recessive",
                            "pubMedId":"134",
                            "clinvarAccessionId":"3024"
                        }
                    ]
                },
                {
                    "_id": "909b1fb4-c307-40b7-8477-77a0e2fddae5",
                    "sequencingLab": "72d98c4a-5780-449b-b70a-849634deaa19",
                    "internalCaseId":"1003471-2003475",
                    "sex":"male",
                    "ageinYears":21,
                    "startDerDiagnostik":"2019-11-21T23:00:00.000Z",
                    "befunddatum":"2020-06-09T22:00:00.000Z",
                    "caseStatus":"unsolved",
                    "hpoTerms":"HP:0000708,HP:0000729,HP:0001249,HP:0001250,HP:0001252,HP:0001263,HP:0002133,HP:0002373,HP:0002376,HP:0010818,HP:0010864,HP:0011344,HP:0032794",
                    "singleDuoTrio":"single",
                    "referringClinician":"Rami",
                    "relevantFindingsForResearch":"PLXNA1",
                    "variants": [
                        {
                            "variant": {
                                "reference": "GRCh38-17-2041587-G-:A",
                                "transcript": "NM_001383.4:c.1208G>A"
                            },
                            "gene":"DPH1",
                            "acmg": {
                                "class": "VUS"
                            },
                            "zygosity":"comp het",
                            "segregationsanalyse":"Maternal",
                            "modeOfInheritance":"unknown"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-17-2036585-C-T",
                                "transcript": "NM_001383.4:c.472C>T"
                            },
                            "gene":"DPH1",
                            "acmg": {
                                "class": "VUS"
                            },
                            "zygosity":"comp het",
                            "segregationsanalyse":"paternal",
                            "modeOfInheritance":"unknown"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-1-228097169-C-T",
                                "transcript": "NM_001658.4:c.55C>T"
                            },
                            "gene":"ARF1",
                            "acmg": {
                                "class": "likely pathogenic"
                            },
                            "zygosity":"heterozygous",
                            "segregationsanalyse":"paternal",
                            "modeOfInheritance":"unknown"
                        }
                    ]
                },
                {
                    "_id": "083d7bd8-5237-4f4c-aec9-080057d72a8d",
                    "sequencingLab": "72d98c4a-5780-449b-b70a-849634deaa19",
                    "internalCaseId":134598,
                    "sex":"male",
                    "ageinYears":62,
                    "startDerDiagnostik":"2021-09-10T00:00:00.000Z",
                    "befunddatum":"2021-12-23T00:00:00.000Z",
                    "diseaseCategory":"Myopathy",
                    "caseStatus":"solved",
                    "hpoTerms":"HP:0003198 HP:0003236 HP:0000083 HP:0040319",
                    "singleDuoTrio":"single",
                    "referringClinician":"FBI",
                    "variants": [
                        {
                            "variant": {
                                "reference": "GRCh38-20-63438711-C-T",
                                "transcript": "NM_172108.5:c.937G>A"
                            },
                            "gene":"KCNQ2",
                            "acmg": {
                                "class": "pathogenic"
                            },
                            "zygosity":"heterozygous",
                            "segregationsanalyse":"de novo",
                            "modeOfInheritance":"Dominant"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-17-7222253-GAGA-G",
                                "transcript": "NM_000018.4:c.833_835del"
                            },
                            "gene":"ACADVL",
                            "acmg": {
                                "class": "pathogenic"
                            },
                            "zygosity":"comp het",
                            "segregationsanalyse":"de novo",
                            "modeOfInheritance":"Dominant"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-17-7224011-G-C",
                                "transcript": "NM_000018.4:c.1376G>C"
                            },
                            "gene":"ACADVL",
                            "acmg": {
                                "class": "VUS"
                            },
                            "zygosity":"comp het",
                            "modeOfInheritance":"recessive"
                        },
                        {
                            "variant": {
                                "reference": "GRCh38-X-65524082-T-C",
                                "transcript": "NM_031206.4:c.1274A>G"
                            },
                            "gene":"LAS1L",
                            "acmg": {
                                "class": "likely pathogenic"
                            },
                            "segregationsanalyse":"de novo",
                            "modeOfInheritance":"X-linked"
                        }
                    ]
                }
            ]

            for(let item of cases) {
                try {
                    let dbRes = await db.find('GRID_cases', {
                        filter: { _id: item._id },
                    })
                    if(dbRes.data.length > 0) {
                        console.log("existiert: " + item._id)
                    } else {
                        await db.insert('GRID_cases',item)
                    }
                } catch(err) {
                    console.error(err)
                }
            }



        // die drei datensätze gemäß Scheme hier anlegen inkl ID
        // dann hier einfach in die Datenbank schreiben, fehler ignorieren


        // set import state to 'FINISHED'
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'FINISHED',
                    progress: {
                        processed: rowData.length,
                        total: rowData.length,
                    }
                }
            }
        })


    } else {

        console.log("NEIN")

        // set import state to 'FINISHED'
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'ERROR',
                    progress: {
                        processed: rowData.length,
                        total: rowData.length,
                    }
                }
            }
        })

    }


                            
    
    // ================================================================================================================




}

*/











/*



NC_000023.10:g.21996184A>G / hg19:6:7556058:G:A / hg19:X:153296000:C:CTAGTGACG
NM_004595.5:c.612A>G / NM_005270.4:c.1606G>T / NM_002225.3:c.158G>A

{
  "_id": "GRCh38-X-21978066-A-G",
  "GRCh38": {
    "gDNA": "NC_000023.11:g.21978066A>G",
    "build": "GRCh38",
    "chr": "X",
    "pos": 21978066,
    "ref": "A",
    "alt": "G"
  },
  "GRCh37": {
    "gDNA": "NC_000023.10:g.21996184A>G",
    "build": "GRCh37",
    "chr": "X",
    "pos": 21996184,
    "ref": "A",
    "alt": "G"
  }
}

{
  "_id": "GRCh38-6-7555825-G-A",
  "GRCh38": {
    "gDNA": "NC_000006.12:g.7555825G>A",
    "build": "GRCh38",
    "chr": "6",
    "pos": 7555825,
    "ref": "G",
    "alt": "A"
  },
  "GRCh37": {
    "gDNA": "NC_000006.11:g.7556058G>A",
    "build": "GRCh37",
    "chr": "6",
    "pos": 7556058,
    "ref": "G",
    "alt": "A"
  }
}

{
  "_id": "GRCh38-X-154030549-C-CTAGTGACG",
  "GRCh37": {
    "gDNA": "NC_000023.10:g.153296000_153296001insTAGTGACG",
    "build": "GRCh37",
    "chr": "X",
    "pos": 153296000,
    "ref": "C",
    "alt": "CTAGTGACG"
  },
  "GRCh38": {
    "gDNA": "NC_000023.11:g.154030549_154030550insTAGTGACG",
    "build": "GRCh38",
    "chr": "X",
    "pos": 154030549,
    "ref": "C",
    "alt": "CTAGTGACG"
  }
}





























hg19:17:1944881:G:A ; hg19:17:1939879:C:T / NC_000001.10:g.228284870C>T
NM_001383.4:c.1208G>A ; NM_001383.4:c.472C>T / NM_001658.4:c.55C>T

{
  "_id": "GRCh38-17-2041587-G-:A",
  "GRCh38": {
    "gDNA": "NC_000017.11:g.2041587G>A",
    "build": "GRCh38",
    "chr": "17",
    "pos": 2041587,
    "ref": "G",
    "alt": "A"
  },
  "GRCh37": {
    "gDNA": "NC_000017.10:g.1944881G>A",
    "build": "GRCh37",
    "chr": "17",
    "pos": 1944881,
    "ref": "G",
    "alt": "A"
  }
}

{
  "_id": "GRCh38-17-2036585-C-T",
  "GRCh38": {
    "gDNA": "NC_000017.11:g.2036585C>T",
    "build": "GRCh38",
    "chr": "17",
    "pos": 2036585,
    "ref": "C",
    "alt": "T"
  },
  "GRCh37": {
    "gDNA": "NC_000017.10:g.1939879C>T",
    "build": "GRCh37",
    "chr": "17",
    "pos": 1939879,
    "ref": "C",
    "alt": "T"
  }
}

{
  "_id": "GRCh38-1-228097169-C-T",
  "GRCh38": {
    "gDNA": "NC_000001.11:g.228097169C>T",
    "build": "GRCh38",
    "chr": "1",
    "pos": 228097169,
    "ref": "C",
    "alt": "T"
  },
  "GRCh37": {
    "gDNA": "NC_000001.10:g.228284870C>T",
    "build": "GRCh37",
    "chr": "1",
    "pos": 228284870,
    "ref": "C",
    "alt": "T"
  }
}










NC_000020.10:g.62070064C>T / NC_000017.10:g.[7125573_7125575delAGA];[7127330G>C] / NC_000023.10:g.64743962T>C
NM_172108.5:c.937G>A / NM_000018.4:[c.833_835del];[1376G>C] / NM_031206.4:c.1274A>G

{
  "_id": "GRCh38-20-63438711-C-T",
  "GRCh38": {
    "gDNA": "NC_000020.11:g.63438711C>T",
    "build": "GRCh38",
    "chr": "20",
    "pos": 63438711,
    "ref": "C",
    "alt": "T"
  },
  "GRCh37": {
    "gDNA": "NC_000020.10:g.62070064C>T",
    "build": "GRCh37",
    "chr": "20",
    "pos": 62070064,
    "ref": "C",
    "alt": "T"
  }
}

{
  "_id": "GRCh38-17-7222253-GAGA-G",
  "GRCh38": {
    "gDNA": "NC_000017.11:g.7222257_7222259del",
    "build": "GRCh38",
    "chr": "17",
    "pos": 7222253,
    "ref": "GAGA",
    "alt": "G"
  },
  "GRCh37": {
    "gDNA": "NC_000017.10:g.7125576_7125578del",
    "build": "GRCh37",
    "chr": "17",
    "pos": 7125572,
    "ref": "GAGA",
    "alt": "G"
  }
}

{
  "_id": "GRCh38-17-7224011-G-C",
  "GRCh38": {
    "gDNA": "NC_000017.11:g.7224011G>C",
    "build": "GRCh38",
    "chr": "17",
    "pos": 7224011,
    "ref": "G",
    "alt": "C"
  },
  "GRCh37": {
    "gDNA": "NC_000017.10:g.7127330G>C",
    "build": "GRCh37",
    "chr": "17",
    "pos": 7127330,
    "ref": "G",
    "alt": "C"
  }
}

{
  "_id": "GRCh38-X-65524082-T-C",
  "GRCh38": {
    "gDNA": "NC_000023.11:g.65524082T>C",
    "build": "GRCh38",
    "chr": "X",
    "pos": 65524082,
    "ref": "T",
    "alt": "C"
  },
  "GRCh37": {
    "gDNA": "NC_000023.10:g.64743962T>C",
    "build": "GRCh37",
    "chr": "X",
    "pos": 64743962,
    "ref": "T",
    "alt": "C"
  }
}































{
  "_id": {
    "$binary": {
      "base64": "SzR81bZrRtqbAKXWSb9u6Q==",
      "subType": "04"
    }
  },
  "internalCaseId": "PIZ 37809977",
  "sequencingLab": {
    "$binary": {
      "base64": "bnCvD6BVRqGUngxBktU5FA==",
      "subType": "04"
    }
  },
  "sex": "female",
  "hpoTerms": [
    "HP:0000729",
    "HP:0001263"
  ],
  "singleDuoTrio": "single",
  "selektivvertrag": "ja",
  "diseaseCategory": "other",
  "referringClinician": "Janzarik",
  "ageinYears": 2,
  "variants": [
    {
      "gene": "DDX6",
      "acmg": {
        "class": "unclear",
        "criteria": []
      },
      "zygosity": "heterozygous",
      "segregationsanalyse": "not performed",
      "modeOfInheritance": "dominant",
      "variant": {
        "reference": "GRCh38-11-118759977-T-A",
        "transcript": "ENST00000534980.7:c.809A>T"
      },
      "_id": {
        "$oid": "659fc26af44fc610ab4498b5"
      }
    }
  ],
  "__v": 0
}



*/



















