
const db = require('../../database/connector').connector
const users = require('../../users/manager')

const lodash = require('lodash')

const console = require('../../util/PrettyfiedConsole')
const BackendError = require('../../util/BackendError')

// const { workerData, parentPort } = require('worker_threads')
const WorkerThreads = require('worker_threads')

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function getImportInstance(importId,userId) {
    try {
        let dbRes = await db.find('STATIC_imports', {
            fields: '-uploadedFiles.data',
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

async function main() {

    await db.initPromise
    await users.initPromise

    try {

        console.log(WorkerThreads.workerData)

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

        // TODO: read entries from excel file
        // wenn fehler, diesen posten

        // initialize the progress values and update import state to 'RUNNING'
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'RUNNING',
                    progress: {
                        processed: 0,
                        total: 30,         // das hier setzen gemäß der daten
                    }
                }
            }
        })

        // TODO: processing main loop 
        for(let i=0; i<30; i++) {

            // get current import instance
            importInstance = await getImportInstance(importId,userId)
            console.dir(importInstance.processing, { depth: null })

            // abort processing if state change to 'CANCELED'
            if(importInstance?.processing?.excel?.state === 'CANCELED') {
                return
            }
            
            // TODO: hier GENAU EINEN record prozessieren und ergebnisse in der datenbank updaten

            // FAKE PROCESSING
            await updateImportInstance(importId, userId, {
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
        }

        // set import state to 'FINISHED'
        await updateImportInstance(importId, userId, {
            processing: {
                ...importInstance?.processing,
                excel: {
                    ...importInstance?.processing?.excel,
                    state: 'FINISHED',
                }
            }
        })

        console.log("finish worker")

    } catch(err) {

        // TODO: fehler in die datenbank und state auf UNEXPECTED_ERROR

        // Diese Fehler sollen als unexpected errors in die Datenbank
        // wenn dabei ein fehler passiert, dann gibt es nur noch die möglichkeit über den catch weiter unten und die console

        console.error(err)
    }
}



// Hier sollten eigentlich nur noch fehler ankommen, die im catch block entstehen...

main().catch(err => console.error(err))





























