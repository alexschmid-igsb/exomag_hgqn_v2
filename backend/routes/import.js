var express = require('express')
var router = express.Router()

const fs = require('fs')
const multer = require('multer')
const decompress = require('decompress')
const md5 = require('md5')
const extract = require('../../shared/extract/extract.js')

const lodash = require('lodash')
const { Worker } = require("worker_threads")

const auth = require('../users/auth')
const isSuperuser = require('../users/isSuperuser')

const database = require('../database/connector.js').connector
const BackendError = require('../util/BackendError')

const xlsx = require('xlsx')
xlsx.helper = require('../util/xlsx-helper')




const debug = false



async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}





// get the imports (without the data) for the current user
router.get('/get-import-list', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    let dbRes = null
    try {
        dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles',
            filter: { user: userId },
            sort: { created: -1 },
            populate: [ { path: 'user', select: '-password' } ]
        })
    } catch (error) {
        throw new BackendError('could not get users imports', 500, error)
    }

    res.send(dbRes)
})


// get a single import by import id and current user
router.post('/get-import', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    let dbRes = null
    try {
        dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // await sleep(5000)

    res.send(dbRes)
})



// create new import for current user
router.post('/create', [auth], async function (req, res, next) {

    const name = req.body.name ? req.body.name.trim() : undefined
    if (name == null) {
        throw new BackendError('import name is missing')
    }

    // Der import wird per default mit uploadFormat: 'excel_template' angelegt. Die properties valueMapping und pocessing
    // werden passend dazu angelegt werden.
    let newImport = {
        name: name,
        progress: 'file_upload',
        uploadFormat: 'excel_template',
        user: req.auth.user._id,
        created: new Date(),
        uploadedFiles: [],
        valueMapping: {
            excel: {}
        },
        processing: {
            excel: {
                state: 'PENDING',
                progress: {
                    processed: 0,
                    total: 0,
                },
                // TODO: HIER DIE ARRAYS FÜR KORREKTE UND FEHLERHAFTE VORBEREITEN
            }
        }

        
    }

    try {
        database.insert('STATIC_imports', newImport)
    } catch (error) {
        throw new BackendError('could not insert', 500, error)
    }

    res.send({})
})




// set upload format for specific import
router.post('/set-upload-format', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    const uploadFormat = req.body.uploadFormat ? req.body.uploadFormat.trim() : undefined
    if (uploadFormat == null) {
        throw new BackendError('upload format is missing')
    }

    let update = {
        uploadFormat: uploadFormat,
        uploadedFiles: [],
    }

    // initialize value mapping and processing properties depending on the upload_format
    // TODO: hier auch die init für die anderen upload formate
    switch(uploadFormat) {
        case 'excel_template':
            update.valueMapping = {
                excel: {}
            }
            update.processing = {
                excel: {
                    state: 'PENDING',
                    progress: {
                        processed: 0,
                        total: 0,
                    },
                    // TODO: HIER DIE ARRAYS FÜR KORREKTE UND FEHLERHAFTE VORBEREITEN
                }
            }
            break
    }

    // console.log("EXECUTE UPATE")
    // console.log(update)

    // execute update
    let dbRes = null
    try {
        dbRes = await database.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    if (debug === true) {
        await sleep(2000)
    }

    res.send(dbRes)
})





router.post('/set-progress', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    const progress = req.body.progress ? req.body.progress.trim() : undefined
    if (progress == null) {
        throw new BackendError('progress is missing')
    }

    /*
    const progress = req.body.progress ? req.body.progress.trim() : undefined
    if (progress == null) {
        throw new BackendError('progress is missing')
    }
    */

    let update = {
        progress: progress
    }

    // console.log("PROGRESS")
    // console.log(update)

    // if(progress )

    let dbRes = null
    try {
        dbRes = await database.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // await sleep(1000)

    res.send(dbRes)
})










// upload files and store into the given import record

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 } }).fields([{ name: 'params', maxCount: 1 }, { name: 'files' }])

router.post('/upload-files', [auth, upload], async (req, res) => {

    console.log('UPLOAD FILE')
    console.log(req.body)
    console.log(req.files)

    const userId = req.auth.user._id

    // parse params
    let params = {}
    if (typeof req.body !== 'undefined' && typeof req.body.params === 'string') {
        try {
            params = JSON.parse(req.body.params)
        } catch (error) {
            throw new BackendError('Could not json parse parameter field: ' + req.body.params, 400)
        }
    }
    console.log('\n\nPARAMS')
    console.log(params)

    // check request parameter
    if (params.importId == null) {
        throw new BackendError('Could not get import from request', 400)
    }

    if (req.files === undefined || req.files.files === undefined || Array.isArray(req.files.files) == false || req.files.files.length <= 0) {
        throw new BackendError('Could not get upload files from request', 400)
    }

    // fetch request paramter
    let importId = params.importId
    const receivedFiles = req.files.files          // received files

    // get current import
    let importInstance = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        importInstance = dbRes.data[0]
        if (importInstance == null) {
            throw new BackendError('could not find import', 500, error)
        }
    } catch (error) {
        throw new BackendError('could not find import', 500, error)
    }
    console.log(importInstance)

    // uploadFormat
    const uploadFormat = importInstance.uploadFormat
    console.log("\n\nuploadFormat:")
    console.log(uploadFormat)


    // organize existing files by id
    const existingFiles = new Map()
    // const existingFilesOrder = []
    for (let existingFile of importInstance.uploadedFiles) {
        if (existingFile.id != null) {
            existingFiles.set(existingFile.id, existingFile)
            // existingFilesOrder.push(existingFile.id)
        }
    }
    console.log("\n\nexistingFiles:")
    console.log(existingFiles)


    // extract files from archives
    let acceptedFiles = []
    let rejectedFiles = []
    const newFiles = []
    for (let receivedFile of receivedFiles) {

        if (receivedFile.originalname == null || receivedFile.originalname.length <= 0) {
            continue
        }

        if (receivedFile.buffer instanceof Buffer == false || receivedFile.buffer.length <= 0) {
            rejectedFiles.push({
                name: receivedFile.originalname,
                size: receivedFile.size,
                type: 'uploaded',
                error: new Error('file has no data')
            })
        } else if (receivedFile.buffer instanceof Buffer && receivedFile.buffer.length > 0) {

            let archiveType =
                receivedFile.originalname.toLowerCase().endsWith('.zip') ? '.zip' :
                    receivedFile.originalname.toLowerCase().endsWith('.tar.gz') ? '.tar.gz' :
                        receivedFile.originalname.toLowerCase().endsWith('.tar.xz') ? '.tar.xz' :
                            null

            if (archiveType != null) {
                try {
                    let extractedFiles = await extract.extract(archiveType, receivedFile.buffer)
                    for (let extractedFile of extractedFiles) {
                        if (extractedFile.type === 'file' && extractedFile.data != null && extractedFile.data.length > 0) {
                            const start = performance.now()
                            let id = md5(extractedFile.data)
                            const end = performance.now()
                            console.log(`md5: ${id}`)
                            console.log(`${end - start} ms`)
                            if (existingFiles.get(id) == null) {
                                newFiles.push({
                                    id: id,
                                    name: extractedFile.name,
                                    size: extractedFile.size,
                                    data: extractedFile.data,
                                    source: receivedFile.originalname,
                                    type: 'extracted'
                                })
                            }
                        }
                    }
                } catch (error) {
                    rejectedFiles.push({
                        name: receivedFile.originalname,
                        size: receivedFile.size,
                        type: 'uploaded',
                        error: new Error('could not extract file', error)
                    })
                }
            } else {
                const start = performance.now()
                let id = md5(receivedFile.buffer)
                const end = performance.now()
                console.log(`md5: ${id}`)
                console.log(`${end - start} ms`)
                if (existingFiles.get(id) == null) {
                    newFiles.push({
                        id: id,
                        name: receivedFile.originalname,
                        size: receivedFile.size,
                        data: receivedFile.buffer,
                        type: 'uploaded'
                    })
                }
            }
        }
    }

    // handle files
    let isFirst = existingFiles.size > 0 ? false : true
    for (let newFile of newFiles) {

        let accept = true

        let entry = {
            id: newFile.id,
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            source: newFile.source,
            data: newFile.data
        }

        if (uploadFormat === 'excel_template' || uploadFormat === 'excel_clinvar') {
            if (entry.name.toLowerCase().endsWith('.xls') === false && entry.name.toLowerCase().endsWith('.xlsx') === false) {
                entry.message = 'no excel file',
                    entry.action = 'IGNORED'
                accept = false
            } else {
                if (isFirst === false) {
                    entry.message = 'multiple excel file'
                    entry.action = 'IGNORED'
                    accept = false
                } else {
                    accept = true
                }
            }
        }
        /*
        else if(uploadFormat === 'phenopackets') {
            // TODO
            // parsen und fehler in info hinzufügen
        }
        */

        if (accept) {
            acceptedFiles.push(entry)
        } else {
            rejectedFiles.push(entry)
        }

        if (isFirst && accept) {
            isFirst = false
        }
    }


    console.log("accceptedFields:")
    console.log(acceptedFiles)

    console.log("rejecteidFiles")
    console.log(rejectedFiles)


    // load excel sheets
    let excelSheets = undefined
    if (uploadFormat === 'excel_template' && acceptedFiles.length === 1) {

        // im upload modus 'excel_template' darf es nur genau ein akzeptiertes file (excel) geben
        // in diesem fall werden hier die excel sheets geladen um dem user im frontend beim value mapping das
        // sheet mit den daten wählen lassen zu können

        let file = acceptedFiles[0]
        console.log(file)
        let workbook = null
        try {
            workbook = xlsx.read(file.data)
        } catch (err) {
            throw new BackendError("Internal Error: Could not open excel file", 500, err)
        }

        if (Array.isArray(workbook['SheetNames'] == false) || workbook['SheetNames'].length <= 0) {
            throw new BackendError("Could not find any sheets in excel file", 500)
        }

        excelSheets = workbook['SheetNames']
    }

    // update
    let update = {
        uploadedFiles: [
            ...importInstance.uploadedFiles,
            ...acceptedFiles
        ],
        valueMapping: {
            excel: {
                sheets: excelSheets
            }
        }
    }


    let dbRes = null
    try {
        dbRes = await database.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }


    // response
    let response = {
        updatedImport: dbRes.data,
        rejectedFiles: rejectedFiles
    }

    if (debug === true) {
        await sleep(2000)
    }

    return res.send(response)

})








// set selected excel sheet for the given import (mode 'excel_template' only)
router.post('/excel-template-set-sheet', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    const excelSheet = req.body.excelSheet ? req.body.excelSheet.trim() : undefined
    if (excelSheet == null) {
        throw new BackendError('excel sheet is missing')
    }

    let current = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            // fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        current = dbRes.data[0]
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }


    // load excel columns
    let columnNames = null
    if (current.uploadFormat === 'excel_template' && current.uploadedFiles != null && current.uploadedFiles.length === 1 && excelSheet != null) {
        // hier die excel column names aus dem sheet laden und über in der importInstance
        // setzen um im frontend das value mapping machen zu können
        let file = current.uploadedFiles[0]
        /*
        let workbook = null
        try {
            workbook = xlsx.read(file.data.buffer)
        } catch(err) {
            throw new BackendError("Internal Error: Could not open excel file",500,err)
        }
        */
        try {
            columnNames = xlsx.helper.parseRowsFromBuffer(file.data.buffer, excelSheet, 1).columnNames
        } catch (err) {
            throw new BackendError("Internal Error: Could not load column names from excel", 500, err)
        }
    }



    const scheme = database.getScheme('GRID_cases')
    const dataDesc = {
        // bleibt erstmal leer, weil im frontend nicht gebraucht. Eventuell wird das später benötigt. Im naiven fall
        // kämen dann hier einfach die schemeDescription rein..
        fields: {}  
    }
    // scheme in ein format umbauen das für das frontend besser geeignet 
    // die idee hier ist, das scheme in eine form umzubauen, die für das frontend besser geeignet ist.
    // allerdings braucht man das im frontend gar nicht, da das value_mapping auf dem layout arbeitet und
    // nicht auf den scheme descriptions
    // es bleibt hier erstmal stehen, weil man eventuell für den eigentlich import ein ganze ähnliches
    // vorgehen gebrauchen könnte..
    /*
    const transform = (fields, base) => {

        for (let [id, field] of Object.entries(fields)) {
            let path = (base != null ? base + '.' : '') + id

            let isArrayType = false
            if (lodash.isArray(field) && field.length === 1) {
                isArrayType = true
                field = field[0]
            }

            if (lodash.isObject(field)) {
                if (field.type == null) {
                    transform(field, path)
                } else if (field.type != null) {
                    if (isArrayType) {
                        field.isArrayType = true
                    }
                    dataDesc.fields[path] = field
                }
            }
        }

    }
    transform(scheme.schemeDescription)
    */
    dataDesc.layout = scheme.layouts.default                    // sollte die wahl des layouts nicht felxibel anstatt hardgecoded sein?





    /*
    // test data
    let testData =
        [
            {
                _id: "8246ef45-4601-49f7-ae3f-fd347bbd2e90",
                internalCaseId: "X24A97HU3434E2",
                sequencingLab: "Bonn",
                externalCaseId: "MAT3_X892_82",
                gestaltMatcherId: "23048092",
                face2GeneId: "98384234",
                sex: "female",
                singleDuoTrio: "trio",
                caseStatus: "unsolved",
                testConducted: "Exome",
                selektivvertrag: "nein",
                diseaseCategory: "dings",
                referringClinician: "C. Müller",
                bisherigeDiagnostik: "none",
                wetlabMetainfo: "empty",
                AutoCasc: "wjfjwiefjoiwjf",
                prenatal: 12,
                ageInMonths: 34,
                ageinYears: 2,
                autozygosity: 1.4,
                variants: [
                    {
                        gene: "SOX9",
                        variantSolvesCase: "primary",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "pathogenic",
                            criteria: [
                                "PS1",
                                "PM4",
                                "PP3",
                                "BS2",
                                "BP3"
                            ]
                        },
                        zygosity: "heterozygous",
                        segregationsanalyse: "not performed",
                        modeOfInheritance: "dominant",
                        variant: {
                            reference: "GRCh38-7-73570818-C-T",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f0f"
                    }
                ],
            },
            {
                _id: "984be0d2-2938-4a96-810d-e39d92335641",
                internalCaseId: "HU7281931_AFH",
                sequencingLab: "München",
                externalCaseId: "xUI-29391-21",
                gestaltMatcherId: "109823",
                face2GeneId: "8889219",
                sex: "male",
                singleDuoTrio: "single",
                caseStatus: "solved",
                testConducted: "Panel",
                selektivvertrag: "ja",
                diseaseCategory: "organ abnormality",
                referringClinician: "M. Meier",
                bisherigeDiagnostik: "keine",
                wetlabMetainfo: "keine",
                AutoCasc: "id_3b2c5f33e",
                prenatal: 8,
                ageInMonths: 14,
                ageinYears: 1,
                autozygosity: 1.2,
                variants: [
                    {
                        gene: "MLH3",
                        variantSolvesCase: "candidate",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "likely pathogenic",
                            criteria: [
                                "PVS1",
                                "PS3",
                                "BP6",
                                "BP3"
                            ]
                        },
                        zygosity: "comp het",
                        segregationsanalyse: "de novo",
                        modeOfInheritance: "recessive",
                        variant: {
                            reference: "GRCh38-7-73570818-C-T",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f10"
                    },
                    {
                        gene: "TBL2",
                        variantSolvesCase: "incidental",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "unclear",
                            criteria: [
                                "BA1",
                                "PS3",
                                "BS4",
                                "BP3",
                                "PP3",
                                "BP4"
                            ]
                        },
                        zygosity: "homoplasmic",
                        segregationsanalyse: "transmitted from father",
                        modeOfInheritance: "mitochondrial",
                        variant: {
                            reference: "GRCh38-17-72121764-GACCAGTACC-G",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f11"
                    }
                ],
            },
            {
                _id: "ce28651c-bf57-4f77-8036-6c89027e9b1c",
                internalCaseId: "A7-95c-362",
                sequencingLab: "Berlin",
                externalCaseId: "AB_345",
                gestaltMatcherId: "239472743",
                face2GeneId: "7478234",
                sex: "female",
                singleDuoTrio: "duo",
                caseStatus: "unsolved",
                testConducted: "Genome",
                selektivvertrag: "nein",
                diseaseCategory: "neurodevelopmental",
                referringClinician: "X. Huber",
                bisherigeDiagnostik: "blabla",
                wetlabMetainfo: "nein",
                AutoCasc: "49234923",
                prenatal: 8,
                ageInMonths: 26,
                ageinYears: 5,
                autozygosity: 1.1,
                variants: [
                    {
                        gene: "PIGV",
                        variantSolvesCase: "primary",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "likely benign",
                            criteria: [
                                "BS2",
                                "PM4",
                                "PP2",
                                "BP6"
                            ]
                        },
                        zygosity: "homozygous",
                        segregationsanalyse: "not performed",
                        modeOfInheritance: "X-linked",
                        variant: {
                            reference: "GRCh38-7-73570818-C-T",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f12"
                    },
                    {
                        gene: "POR",
                        variantSolvesCase: "incidental",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "benign",
                            criteria: [
                                "PM1",
                                "PM5",
                                "PM6",
                                "PP3",
                                "BA1",
                                "BA1"
                            ]
                        },
                        zygosity: "heteroplasmic",
                        segregationsanalyse: "transmitted from mother",
                        modeOfInheritance: "unclear",
                        variant: {
                            reference: "GRCh38-14-75018816-G-C",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f13"
                    },
                    {
                        gene: "MLH3",
                        variantSolvesCase: "primary",
                        ifNewDiseaseGeneLevelOfEvidence: "bla",
                        acmg: {
                            class: "likely pathogenic",
                            criteria: [
                                "PVS1",
                                "PS1",
                                "PS2",
                                "PS3",
                                "PS4",
                                "PM1",
                                "PM2",
                                "PM3",
                                "PM4",
                                "PM5",
                                "PM6",
                                "PP1",
                                "PP2",
                                "PP3",
                                "PP4",
                                "PP5",
                                "BP1",
                                "BP2",
                                "BP3",
                                "BP4",
                                "BP5",
                                "BP6",
                                "BP7",
                                "BS1",
                                "BS2",
                                "BS3",
                                "BS4",
                                "BA1"
                            ]
                        },
                        zygosity: "hemi",
                        segregationsanalyse: "de novo",
                        modeOfInheritance: "X-linked",
                        variant: {
                            reference: "GRCh38-7-75980326-CCT-C",
                            transcript: "abcd"
                        },
                        _id: "6537c8e1fdcd74c709d11f14"
                    }
                ],
            }
        ]

        let casesScheme = database.getScheme('GRID_cases').schemeDescription
        let casesLayout = database.getScheme('GRID_cases').layouts['default']

        // console.log("HOIER :wefpj wfi wojfoi wjoifj woiejfoi wjefoi wjoij oiweif wij")
        console.log(casesLayout)
        console.log(casesScheme)

        */




    // das hier ist exemplarisch ein processing?
    /*
    let index = 1;
    for(let row of testData) {
    

        row['___validation___'] = {
            hasErrors: false
        }

        row['___index___'] = index


        for(let group of casesLayout.description) {
            // console.log(group.label)
            // console.log(group.type)
            if(group.type.id === 'primary') {

                for(let field of group.fields) {

                    // todo: auch hier muss man schauen, ob es ein array type ist

                    let value = lodash.get(row,field.id)
                    let valueValidated = {
                        value: value,
                        validation: {
                            isValid: true
                        }
                    }
                    lodash.set(row,field.id,valueValidated)
                }

            } else if(group.type.id === 'nested') {

                let type = casesScheme[group.type.root]

                if(lodash.isArray(type)) {

                    let rootType = type[0]

                    let rootData = lodash.get(row,group.type.root)

                    for(let rootEntry of rootData) {

                        for(let field of group.fields) {

                            // todo: hier MUSS der zugehörige type geholt werden, da arrays berücksichtigt werden müssen

                            // console.log(field)

                            let value = undefined
                            if(field.path != null) {
                                value = lodash.get(rootEntry,field.path)
                            } else {
                                value = lodash.get(rootEntry,field.id)
                            }

                            let valueValidated = {
                                value: value,
                                validation: {
                                    isValid: true
                                }
                            }

                            if(field.path != null) {
                                lodash.set(rootEntry,field.path,valueValidated)
                            } else {
                                lodash.set(rootEntry,field.id,valueValidated)
                            }

                        }

                    }

                } else {


                    let rootType = type

                    let rootEntry = lodash.get(row,group.type.root)

                    for(let field of group.fields) {

                        // todo: hier MUSS der zugehörige type geholt werden, da arrays berücksichtigt werden müssen

                        // console.log(field)

                        let value = undefined
                        if(field.path != null) {
                            value = lodash.get(rootEntry,field.path)
                        } else {
                            value = lodash.get(rootEntry,field.id)
                        }

                        let valueValidated = {
                            value: value,
                            validation: {
                                isValid: true
                            }
                        }

                        if(field.path != null) {
                            lodash.set(rootEntry,field.path,valueValidated)
                        } else {
                            lodash.set(rootEntry,field.id,valueValidated)
                        }

                    }


                }


            }
        }

        index++
    }
    console.log(testData)
    */


    // values to update
    let update = {
        valueMapping: {
            ...current.valueMapping,
            excel: {
                ...current.valueMapping.excel,
                dataSheet: excelSheet,
                columnNames: columnNames,
                dataDesc: dataDesc,
                mapping: [],
            }
        }
    }

    // execute update
    let dbRes = null
    try {
        dbRes = await database.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
    } catch (error) {
        throw new BackendError('could not update import', 500, error)
    }

    if (debug === true) {
        await sleep(2000)
    }

    res.send(dbRes)
})





// set value mapping for the given import (excel_template mode only)
router.post('/excel-template-set-mapping', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    const mapping = req.body.mapping ? req.body.mapping : undefined
    if (mapping == null) {
        throw new BackendError('mapping is missing')
    }

    let current = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        current = dbRes.data[0]
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // values to update
    let update = {
        valueMapping: {
            ...current.valueMapping,
            excel: {
                ...current.valueMapping.excel,
                mapping: mapping
            }
        }
    }

    // execute update
    let dbRes = null
    try {
        dbRes = await database.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
    } catch (error) {
        throw new BackendError('could not update import', 500, error)
    }

    if (debug === true) {
        // await sleep(2000)
    }

    res.send(dbRes)
})







// trigger processing for excel template import
router.post('/excel-template-trigger-processing', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    let current = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        current = dbRes.data[0]
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // current?.valueMapping?.excel?.dataSheet == null ||
    // lodash.isArray(current?.valueMapping?.excel?.columnNames) === false ||
    // current?.valueMapping?.excel?.columnNames.length <= 0 ||
    // lodash.isArray(current?.valueMapping?.excel?.mapping) === false ||
    // current?.valueMapping?.excel?.mapping.length <= 0 ) 
    
    // check preconditions
    if(current.uploadFormat !== 'excel_template' && current?.processing?.excel?.state !== 'PENDING') {
        throw new BackendError('Unexpected Error: Could not meet preconditions for processing of excel template import')
    }

    new Worker('./backend/import/worker.js', { workerData: { importId: importId, userId: userId } })

    res.send({})
})





// trigger processing for excel template import
router.post('/excel-template-cancel-processing', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    let current = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        current = dbRes.data[0]
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // console.log("CURRENT")
    // console.log(current)
    
    // check if canceling is allowed
    if(current.uploadFormat === 'excel_template' && current?.processing?.excel?.state === 'RUNNING') {

        // console.log("EXECUTE UPDATE")

        // update
        let update = {
            processing: {
                ...current?.processing,
                excel: {
                    ...current?.processing?.excel,
                    state: 'CANCELED',
                    progress: {
                        processed: 0,
                        total: 0,
                    }
                }
            }
        }

        // execute update
        let dbRes = null
        try {
            dbRes = await database.findOneAndUpdate('STATIC_imports', {
                fields: '-uploadedFiles.data',
                filter: { _id: importId, user: userId },
                populate: [ { path: 'user', select: '-password' } ]
            }, update)
        } catch (error) {
            throw new BackendError('could not update import', 500, error)
        }

        // Hier keine rückgabe der upgedateten importInstance, weil diese
        // periodisch übers frontend geholt wird, solange auf frontend seite der state
        // noch als RUNNING wahrgenommen wird. Vielleicht sollte man das ändern (d.h.
        // importInstance zurückschicken) wenn das ganze zu problemen führt.
    }

    res.send({})
})






// trigger processing for excel template import
router.post('/excel-template-clear-canceled', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if (importId == null) {
        throw new BackendError('import id is missing')
    }

    let current = null
    try {
        let dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        current = dbRes.data[0]
    } catch (error) {
        throw new BackendError('could not get import', 500, error)
    }

    // console.log("CURRENT")
    // console.log(current)
    
    // check if reset is allowed
    // if(current.uploadFormat === 'excel_template' && current?.processing?.excel?.state === 'CANCELED') {
        if(current.uploadFormat === 'excel_template' && (current?.processing?.excel?.state === 'CANCELED' || current?.processing?.excel?.state === 'FINISHED')) {

        // console.log("EXECUTE UPDATE")

        // update
        let update = {
            processing: {
                ...current?.processing,
                excel: {
                    ...current?.processing?.excel,
                    state: 'PENDING',
                    progress: {
                        processed: 0,
                        total: 0,
                    }
                }
            }
        }

        // execute update
        let dbRes = null
        try {
            dbRes = await database.findOneAndUpdate('STATIC_imports', {
                fields: '-uploadedFiles.data',
                filter: { _id: importId, user: userId },
                populate: [ { path: 'user', select: '-password' } ]
            }, update)
        } catch (error) {
            throw new BackendError('could not update import', 500, error)
        }

        res.send(dbRes)

    } else {

        res.send({
            data: current
        })

    }
})














// get a single import by import id and current user
/*
router.post('/parse-excel-template-columns', [auth], async function (req, res, next) {

    const userId = req.auth.user._id

    const importId = req.body.importId ? req.body.importId.trim() : undefined
    if(importId == null) {
        throw new BackendError('import id is missing')
    }

    if(uploadFormat !== 'excel_template') {
        throw new BackendError('this request is only valid for upload format excel_template', 400)
    }

    let dbRes = null
    try {
        dbRes = await database.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
    } catch(error) {
        throw new BackendError('could not get import', 500, error)
    }

    console.log("JETZ EWÖKJB KWJEB KJBEWKJR BEWKJRB KJEWBKJ BEWJFB EWJ")
    console.log(dbRes)
    
    res.send({})

})
*/



/*



router.post('/upload/sheet-columns', [auth], async function (req, res, next) {

    if(typeof req.body === 'undefined' || typeof req.body.uploadId === 'undefined' || req.body.uploadId.length <=0 ) {
        throw new BackendError('Could not get uploadId from request',400)
    }
    const uploadId = req.body.uploadId

    if(typeof req.body === 'undefined' || typeof req.body.gridId === 'undefined' || req.body.gridId.length <=0 ) {
        throw new BackendError("Missing gridId",400)
    }
    const gridId = req.body.gridId

    if(typeof req.body === 'undefined' || typeof req.body.sheetName === 'undefined' || req.body.sheetName.length <=0 ) {
        throw new BackendError("Missing sheetName",400)
    }
    const sheetName = req.body.sheetName

    let file = await knex('files').where({id: uploadId}).first()
    if(file == undefined) {
        throw new BackendError(`Could not find file for uploadId ${uploadId}`,400)
    }

    let workbook = null
    try {
        workbook = xlsx.read(file.buffer)
    } catch(err) {
        throw new BackendError("Internal Error: Could not open excel file",500,err)
    }

    let columnDefs = await loadColumnDefs(gridId)

    let excelData = xlsx.helper.parseRowsFromBuffer(file.buffer, sheetName, 1)

    res.send({
        gridColumns: columnDefs,
        excelColumns: excelData.columnNames
    })
})





*/


module.exports = router;















