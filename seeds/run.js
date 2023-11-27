#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')

const debug = true

console.log()
console.log('Seeding script')

async function execute(seeds) {

    // TODO: eine option um voher zu droppen (eigentlich sollte vorher immer gedropt werden, da sonst duplikate entstehen)

    await database.initPromise
    await users.initPromise

    console.log()
    
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

    await database.disconnect()
}

program
    .name('seed')
    .version('0.1.0')

let seeds = new Map()

fs.readdirSync(__dirname).forEach(file => {
    if(file.endsWith('.yml')) {
        let command = file.substring(file.indexOf('_')+1,file.length-4)
        let seed = yaml.load(fs.readFileSync(path.join(__dirname,file),'utf8'))

        /*
        if(debug) console.log("COMMAND:")
        if(debug) console.log(command)
        if(debug) console.log()

        if(debug) console.log("SEED:")
        if(debug) console.log(seed)
        if(debug) console.log()
        */

        seeds.set(command,seed)
        program
            .command(command)
            .summary(seed.summary)
            .description(seed.description)
            .action(async () => {
                await execute([seed])
            })
    }
})

program
    .command('all')
    .summary('Seed all')
    .description('executes all available seed tasks in order')
    .action(async () => {
        let keys = Array.from(seeds.keys()).sort()
        let arr = []
        for(let key of keys) {
            let item = seeds.get(key)
            arr.push(item)
        }
        await execute(arr)
    });

(async function () {
    await program.parseAsync(process.argv)
    process.exit(0)
})()






