const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const Mailer = require('../../backend/util/mail/SMTPMailer')

const IMAPClient = require('../../backend/util/mail/IMAPClient')
const imapSession = IMAPClient.createSession()

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')


const FetchAPI = require('../FetchAPI')



const VVStore = require('../VVStore/VVStore')



async function main() {

    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    await imapSession.connect()
    console.log()

    const toStore = {
        GRCh37: [],
        GRCh38: [],
    }

    const res = await database.find('GRID_variants')

    for(let [i,dbVariant] of res.data.entries()) {

        toStore.GRCh37.push(dbVariant.GRCh37.gDNA)
        toStore.GRCh38.push(dbVariant.GRCh38.gDNA)
    }
    
    await VVStore.addToStore('HGQN_GRCh37_gDNA', 'GRCh37', toStore.GRCh37, 'mane_select', false)
    await VVStore.addToStore('HGQN_GRCh38_gDNA', 'GRCh38', toStore.GRCh38, 'mane_select', false)
    
    await database.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()


