const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const xlsx = require('xlsx')
xlsx.helper = require('../backend/util/xlsx-helper')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')



async function loadData() {

    let data = {
        db: {},
        excel: {}
    }

    // labs aus datenbank
    {
        const res = await database.find('STATIC_labs')
        data.db.labs = {
            all: res.data,
            byId: new Map()
        }
        for(let lab of res.data) {
            data.db.labs.byId.set(lab._id,lab)
        }
    }

    // user aus datenbank
    {
        const res = await database.find('CORE_users')
        data.db.users = {
            all: res.data,
            byId: new Map(),
            byEmail: new Map(),
            byUsername: new Map()
        }
        for(let user of res.data) {
            user.email = user.email.toLowerCase()
            data.db.users.byId.set(user._id,user)
            data.db.users.byEmail.set(user.email,user)
            data.db.users.byUsername.set(user.username,user)
        }
    }

    // hgqn labs aus dem zu importierenden excel file
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, 'HGQN Labs_260324.xlsx'), 'Sheet1', 1)
        data.excel.labs = {
            all: res.rows,
            byId: new Map(),
            byShortName: new Map()
        }
        for(let row of res.rows) {
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            data.excel.labs.byId.set(row['ID'].trim(),row)
            data.excel.labs.byShortName.set(row['Anzeigename'].trim(),row)
        }
    }

    // hgqn user mit lab zuordnung
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, 'HGQN Variantendatenbank_MG mit Zuordnung_gesamt.xlsx'), 'Tabelle1', 1)
        data.excel.usersMitLab = {
            all: res.rows,
            byEmail: new Map(),
        }
        for(let row of res.rows) {
            row['Email'].value = row['Email'].value.toLowerCase()
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            data.excel.usersMitLab.byEmail.set(row['Email'].trim(),row)
        }
    }
    
    // hgqn user ohne lab zuordnung
    {
        let res = xlsx.helper.parseRowsFromFile(path.join(__dirname, 'HGQN Variantendatenbank Verteiler_MG ohne Zuordnung.xlsx'), 'Tabelle2', 1)
        data.excel.usersOhneLab = {
            all: res.rows,
            byEmail: new Map(),
        }
        for(let row of res.rows) {
            row['Email'].value = row['Email'].value.toLowerCase()
            for(let propertyName of Object.getOwnPropertyNames(row)) {
                row[propertyName] = lodash.isString(row[propertyName].value) ? row[propertyName].value.trim() : row[propertyName].value
            }
            data.excel.usersOhneLab.byEmail.set(row['Email'].trim(),row)
        }
    }

    return data
}



async function importLabs(data) {

    let mappings = [
        { excel: 'Anzeigename', db: 'shortName' },
        { excel: 'Vollständiger Name', db: 'name' },
        { excel: 'Webseite', db: 'website' },
        { excel: 'Email', db: 'email' }
    ]

    const dbLabs = data.db.labs
    const importLabs = data.excel.labs

    let index = 0

    let countUpdated = 0
    let countUnchaged = 0
    let countAdded = 0

    for(let importLab of importLabs.all) {
        let id = importLab['ID']
        let dbLab = dbLabs.byId.get(id)
        if(dbLab != null) {
            // bereits in datenbank vorhanden
            let id = dbLab.id

            // checken ob lab in der datenbank geupdatet werden muss
            let needUpdate = false
            let update = {}

            for(let mapping of mappings) {
                let excelValue = importLab[mapping.excel] != null ? lodash.isString(importLab[mapping.excel]) ? importLab[mapping.excel].trim() : importLab[mapping.excel] : null
                let dbValue = dbLab[mapping.db] != null ? lodash.isString(dbLab[mapping.db]) ? dbLab[mapping.db].trim() : dbLab[mapping.db] : null
                if(excelValue !== dbValue) {
                    needUpdate = true
                    update[mapping.db] = excelValue
                    // console.log(mapping.db + ': ' + dbValue + ' --> ' + excelValue)
                }
            }

            if(needUpdate === true) {
                await database.findOneAndUpdate('STATIC_labs', { filter: { _id: dbLab._id} }, update)
                countUpdated++
            } else {
                countUnchaged++
            }

        } else {

            // TODO: ADDEN
            // checken ob es ein ab mit dem kurname oder voll name gibt
            // wenn nein, dann adden, wenn doch, kann man die ID setzen

            countAdded++
        }
        index++
    }

    console.log(`     updated: ${countUpdated}`)
    console.log(`     added: ${countAdded}`)
    console.log(`     unchanged: ${countUnchaged}`)
    console.log(`     total: ${index}`)

    // reload the updated labs from database
    {
        const res = await database.find('STATIC_labs')
        data.db.labs = {
            all: res.data,
            byId: new Map(),
            byName: new Map(),
            byShortName: new Map()
        }
        for(let lab of res.data) {
            data.db.labs.byId.set(lab._id,lab)
            data.db.labs.byName.set(lab.name,lab)
            data.db.labs.byShortName.set(lab.shortName,lab)
        }
    }

}



async function importUsersMitZuordnung(data) {

    // console.log(data.excel.usersMitLab.all)

    let index = 0
    let firstError = true

    let countErrors = 0
    let countUsersExisting = 0
    let countUsersAdded = 0
    let countActivationSent = 0

    for(let excelUser of data.excel.usersMitLab.all) {

        let excelLabShortName = excelUser['Anzeigename'] != null ? lodash.isString(excelUser['Anzeigename']) ? excelUser['Anzeigename'].trim() : excelUser['Anzeigename'] : null
        let excelLabName = excelUser['Vollständiger Name'] != null ? lodash.isString(excelUser['Vollständiger Name']) ? excelUser['Vollständiger Name'].trim() : excelUser['Vollständiger Name'] : null

        let excelEmail = excelUser['Email'] != null ? lodash.isString(excelUser['Email']) ? excelUser['Email'].trim() : excelUser['Email'] : null

        let excelName = excelUser['Name'] != null ? lodash.isString(excelUser['Name']) ? excelUser['Name'].trim() : excelUser['Name'] : null
        let username = excelName.toLowerCase().replaceAll(' ', '.')

        // identify user lab
        let dbLab = data.db.labs.byShortName.get(excelLabShortName)
        let dbLab2 = data.db.labs.byName.get(excelLabName)
        if(dbLab == null || dbLab2 == null || dbLab != dbLab2) {
            if(firstError) {
                firstError = false
                console.log()
            }

            let zeile = `   ZEILE ${index+2}: `
            console.log(`${zeile}FEHLER BEI USER MIT EMAIL '${excelEmail}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}DAS ZUGEORDNETE LAB KONNTE NICHT GEFUNDEN WERDEN`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}    Anzeigename: '${excelLabShortName}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}    Vollständiger Name: '${excelLabName}'`)
            console.log(`${(new Array(zeile.length)).fill(' ').join('')}DER USER WIRD AUSGELASSEN`)
            console.log()

            countErrors++
            index++
            continue
        }

        // checken ob es schon einen user mit dieser email gibt
        let dbUser = data.db.users.byEmail.get(excelEmail)
        if(dbUser == null) {
            // es gibt noch keinen user mit der emailadresse
            // jetzt noch checken ob der username schon existiert
            let check = data.db.users.byUsername.get(username)
            if(check != null) {
                // es gibt den usernam bereits. das kann passieren, wenn zwei verschiedene user den gleichen namen haben und deswegen den
                // gleichen username generiert bekommen. Oder aber weil der bereits in der datenbank existierende user eine falsche
                // email eingetragen hatte (in dem fall der HGQN Daten sind das emails mit umlauten oder 'ß')
                let emailKorrigiert = check.email.replaceAll('ö','oe').replaceAll('ö','ae').replaceAll('ü','ue').replaceAll('ß','ss')
                if(emailKorrigiert === excelEmail) {
                    // In diesem fall ist der gleiche user mit einer falschen emailadresse vorhanden.
                    // der alte user wird entfernt, dann kann der neue hinzugefügt werden
                    await database.deleteOne('CORE_users', {_id: check._id, username: check.username, email: check.email})
                } else {
                    // In diesem fall ist unklar, warum es eine kollision der usernames gibt (eventuell user mit dem gleichen Namen).
                    // die einfachste lösung ist, einfach auf einen anderen username auszuweichen (z.b. einfach die email)
                    username = excelEmail
                    console.log("username change")
                }
            }

            dbUser = await database.insert('CORE_users', {
                username: username,
                email: excelEmail,
                isSuperuser: false,
                lab: dbLab._id,
                state: { id: 'CREATED' }
            })

            // add user to mapped users
            data.db.users.byId.set(dbUser._id, dbUser)
            data.db.users.byEmail.set(dbUser.email, dbUser)
            data.db.users.byUsername.set(dbUser.username, dbUser)

            countUsersAdded++

        } else {

            countUsersExisting++

        }

        // user activation
        // unabhängig davon ob der user bereits in der datenbank war oder gerade neu hnzugefügt wurde, muss der user einen
        // registry link bekommen, solange das noch nicht passiert ist
        if(dbUser.state.id === 'CREATED') {
            // 
            console.log("aktivierung " + dbUser.email)


            /*
            todo: hier jetzt die aktivierungsschritte aus dem code holen
            token erstellen,
            email schicken,
            datenbank updaten mit token und state,
            BEIM EMAIL SCHICKEN ERSTMAL ALLE AN MEINE EIGENEN ADRESSE SCHICKEN UM ZU TESTEN, OB MAN MASSENHAFT EMAILS
            VERSCHICKEN DARF
            */

            countActivationSent++
        }

        index++
    }


    console.log(`   existing: ${countUsersExisting}`)
    console.log(`   added: ${countUsersAdded}`)
    console.log(`   errors: ${countErrors}`)
    console.log(`   total: ${index}`)
    console.log()
    console.log(`   new activations sent: ${countActivationSent}`)

}


async function importUsersOhneZuordnung(data) {
    
}


async function main() {

    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    console.log()

    // load data
    console.log('\n1. LOAD DATA')
    let data = await loadData()
    console.log()

    // synchronize labs between excel import and database
    console.log('\n2. IMPORT LABS')
    await importLabs(data)
    console.log()

    // NACHDEM DIE LABS SYNCHRONISIERT SIND, BRAUCHT MAN FÜR DIE ZUORDNUNG ZWEI WEITERE MAPS,
    // shortName nach db lab 
    // name nach db lab

    // process users "mit zuordnung"
    console.log('\n3. IMPORT USERS "mit Zuordnung"')
    await importUsersMitZuordnung(data)
    console.log()

    // process users "ohne zuordnung"
    console.log('\n4. IMPORT USERS "ohne Zuordnung"')
    await importUsersOhneZuordnung(data)
    console.log()

    /*
        TODO:
            1. email testen, gehen die emails in die outbox
            2. ein dry run, der jede email verschickt und zwar alles an mich (um zu schauen, ob beliebig viele emails gesendet werden können)
    */













    await database.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()
















