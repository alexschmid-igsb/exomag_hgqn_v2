
const db = require('../../database/connector').connector
const users = require('../../users/manager')

const lodash = require('lodash')

const console = require('../../util/PrettyfiedConsole')
const BackendError = require('../../util/BackendError')
const StackTrace = require('stacktrace-js')

const xlsx = require('xlsx')
xlsx.helper = require('../../util/xlsx-helper')

const Processing = require('./processing.js')

const WorkerThreads = require('worker_threads')




async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}



async function getImportInstance(importId,userId,loadFileData=false) {
    try {
        let dbRes = await db.find('STATIC_imports', {
            fields: loadFileData === false ? '-uploadedFiles.data' : undefined,
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        })
        if(lodash.isArray(dbRes.data) === false) {
            throw new Error('database query result is not an array')
        }
        if(dbRes.data.length != 1) {
            throw new Error('database query does not return a single itme')
        }
        return dbRes.data[0]
    } catch(err) {
        throw new BackendError(`Unexpected Error: Could not load import [importId: ${importId}, userId: ${userId}]`,500,err)
    }
}



async function updateImportInstance(importId,userId,update) {
    try {
        let dbRes = await db.findOneAndUpdate('STATIC_imports', {
            fields: '-uploadedFiles.data',
            filter: { _id: importId, user: userId },
            populate: [ { path: 'user', select: '-password' } ]
        }, update)
        if(lodash.isObject(dbRes.data) === false) {
            throw new Error('database query result is not an object')
        }
        return dbRes.data
    } catch(err) {
        throw new BackendError(`Unexpected Error: Could not update import [importId: ${importId}, userId: ${userId}]`,500,err)
    }
}



async function loadExcelTemplateRowData(importId,userId) {


    // load import instance with file data
    let importInstance = await getImportInstance(importId,userId,true)
    // console.dir(importInstance, { depth: null })

    // check files
    if(lodash.isArray(importInstance.uploadedFiles) === false || importInstance.uploadedFiles.length !== 1) {
        throw new BackendError("Unexpected Error: Could not get uploaded files from import instance")
    }

    // get file
    const file = importInstance.uploadedFiles[0]
    if(file == null || file.data == null || lodash.isFunction(file.data.length) === false || file.size <= 0 || file.size !== file.data.length()) {
        throw new BackendError("Unexpected Error: File data missing or file size mismatch")
    }

    // get sheet name
    let sheetName = importInstance?.valueMapping?.excel?.dataSheet
    if(lodash.isString(sheetName) === false || sheetName.length <= 0) {
        throw new BackendError("Unexpected Error: Missing excel sheet name")
    }

    // load rows
    let excelData = xlsx.helper.parseRowsFromBuffer(file.data.buffer, sheetName, 1)
    if(excelData.rows.length <= 0) {
        throw new BackendError(`Error: Excel sheet "${sheetName}" has no rows`)
    }

    return excelData.rows
}



async function executeMainLoop(importId,userId,rowData) {

    let importInstance = await getImportInstance(importId, userId)

    const processing = Processing.createInstance({
        mapping: importInstance?.valueMapping?.excel?.mapping
    })

    let entries = []

    let i = 0
    for(const row of rowData) {

        console.log("WORKER: ITERATION #" + i)

        // get current import instance
        importInstance = await getImportInstance(importId, userId)
        
        // abort processing if state change from 'RUNNING' to something else (for example 'CANCELED' by
        // api request by user through user interface)
        if(importInstance?.processing?.excel?.state !== 'RUNNING') {
            return {
                finished: false,
                entries: entries
            }
        }

        // process row
        let entry = processing.process(row)
        entries.push(entry)

        /*
        die row wird in die pipeline geschickt
        die rückgabe ist IMMER ein entry case
        fehler werden annotiert
        das ganze geht dann je nach dem ob fehler flag gesetzt wurde in die liste
        der cases und somit ans frontend
        */


        // WORKLOAD
        // TODO: hier GENAU EINEN record prozessieren und ergebnisse in der datenbank updaten

        // FAKE PROCESSING
        importInstance = await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    progress: {
                        ...importInstance?.processing?.excel.progress,
                        processed: i+1,
                    }
                }
            }
        })

        await sleep(1000)       // WICHTIG: später rausnehmen
        
        i++
    }

    return {
        finished: true,
        entries: entries
    }
}



async function main() {

    await db.initPromise
    await users.initPromise

    try {

        // console.log(WorkerThreads.workerData)

        const {
            importId,
            userId
        } = WorkerThreads.workerData

        if(importId == null) {
            // TODO: hier einen unexpected error in die db posten
            throw new Error('Unexpected Error: Missing importId in import worker thread')
        }

        if(userId == null) {
            // TODO: hier einen unexpected error in die db posten
            throw new Error('Unexpected Error: Missing importId in import worker thread')
        }

        // check import state
        let importInstance = await getImportInstance(importId,userId)
        if(importInstance?.processing?.excel?.state !== 'PENDING') {
            // do not start processing unless state equals 'PENDING'
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


        // try to load load row data from uploaded excel file
        let rowData = null
        try {
            rowData = await loadExcelTemplateRowData(importId, userId)
        } catch(err) {
            // Post error to importInstance and return from worker
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


        // execute main loop        
        const processed = await executeMainLoop(importId,userId,rowData)

        // check if loop finished
        if(processed.finished === true) {
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
        }


        // TODO: hier müssen die entries in die import instance geschrieben werden
        console.log("WORKER: PROCESSED RESULT")
        console.log(processed.entries)

        console.log("worker ended")

    } catch(err) {

        // TODO: fehler in die datenbank und state auf ERROR

        // Diese Fehler sollen als unexpected errors in die Datenbank
        // wenn dabei ein fehler passiert, dann gibt es nur noch die möglichkeit über den catch weiter unten und die console

        console.error(err)
    }
}



// Hier sollten dann eigentlich nur noch die fehler ankommen, die im globalen catch block entstehen...

main().catch(err => console.error(err))





























