#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')

async function execute() {

    // TODO: eine option um voher zu droppen (eigentlich sollte vorher immer gedropt werden, da sonst duplikate entstehen)

    await database.initPromise
    await users.initPromise
    
    console.log()   

    const layoutId = 'default'


    // INFOS:
    // https://mongoosejs.com/docs/populate.html
    // https://stackoverflow.com/questions/14594511/mongoose-populate-within-an-object?rq=1


    // let scheme = database.getScheme('GRID_cases')
    // console.log(scheme.mongooseSchemeDescription)

    // const res = await database.find('GRID_cases')




    // einzelner path
    // const res = await database.find('GRID_cases', { populate: 'sequencingLab' })
    // console.dir(res, {depth: null})


    // mehrere paths
    // const res = await database.find('GRID_cases', { populate: ['sequencingLab', 'variants.variant.reference'] })
    // console.dir(res, {depth: null})

    // mehrere paths mit field select syntax (siehe mongoose docs)
    const res = await database.find('GRID_cases', {
        populate: [
            {
                path: 'sequencingLab',
                select: '-shortName'
            },
            {
                path: 'variants.variant.reference',
                select: '-GRCh37 -GRCh38.gDNA'
            }
        ]}
    )
    console.dir(res, {depth: null})




    




    // 

    /*
    const res = await database.find('CORE_users', {
        // fields: '-uploadedFiles',
        // filter: { user: userId },
        // sort: { created: -1 },
        populate: ['lab']
    })
    */

    // 








    /*
    if(debug) console.log("START EXECUTE")
    if(debug) console.log()

    try {
        for(let seed of seeds) {

            if(debug) console.log(seed)
            if(debug) console.log()
        
            await database.deleteAll(seed.target)
            let model = await database.getModel(seed.target)
            await model.insertMany(seed.data)
        }
    } catch(error) {
        console.error(error)
        // throw new Error('could not complete seed operation', { cause: error })
    }
    */

    await database.disconnect()
}

(async function () {
    await execute()
    process.exit(0)
})()






