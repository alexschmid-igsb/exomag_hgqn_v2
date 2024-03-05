






/*

    Excel Daten lesen


    1. Labs 

    Labs durchgehen und prüen, ob schon vorhanden (über den anzeigename)
    Wenn nein, lab importieren
    map: anzeigename -> lab id


    2. User durchgehen
    Prüfen ob der user schon existiert. es muss ein user mit der email und/ODER dem username gaben
    wenn ja: skip
    wenn nein, den user anlegen (mit dem lab link)
    NUR WENN der user angelegt werden konnte: email verschicken


*/

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







    await database.disconnect()
}










(async function () {
    await execute()
    process.exit(0)
})()
















