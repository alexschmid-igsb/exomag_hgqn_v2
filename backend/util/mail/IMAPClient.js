const config = require('../../../config/config')
const mailConfig = config['mail']

const { ImapFlow } = require('imapflow')

const lodash = require('lodash')

const client = new ImapFlow({
    host: mailConfig.smtp.host,
    port: 993,
    secure: true,
    auth: {
        user: mailConfig.smtp.user,
        pass: mailConfig.smtp.password,
    },
    logger: false
})




module.exports = {


    test: async function() {


        await client.connect()



        let result = await client.list({ messages: true, recent: true, uidNext: true, uidValidity: true, unseen: true, highestModseq: true} )
        console.log(result)

        // let result = await client.list()

        client.append('INBOX.Sent', null, [ '\\Seen' ], new Date())

        await client.logout()

        

    }




    // sendTransactionMail : async function({to,template,params}) {
    // }



}

