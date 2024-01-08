const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')





// MANUELLE LISTE DER LABS AUS DER EXCEL LISTE, ERGÄNTZT DURCH ZUSÄTZLICHE EINTRÄGE

const labs = [
   


]







async function run() {

    await database.initPromise
    await users.initPromise


    const cases = require('./ExomAG_Daten_08.01.2024.json')





    // GET ALL OLD SEQUENCING LABS
    {
        const labs = new Set()
        for(let row of cases) {
            console.log(row['sequencing lab'])
            labs.add(row['sequencing lab'])
        }
        console.log(labs)
        // Für alle diese labs muss dann ein mapping erstellt werden
    }





    // try {

    // } catch (err) {
    //     console.log("ERROR")
    //     console.log(err)
    //     return
    // } finally {

    // }


}








( async () => {
    console.log("start")
    await run()
    console.log("finished")
})()





