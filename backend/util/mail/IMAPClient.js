const config = require('../../../config/config')
const mailConfig = config['mail']

const { ImapFlow } = require('imapflow')

const lodash = require('lodash')
class Session {

    constructor() {
        this.imap = null
        if(mailConfig.imap != null) {
            this.imap = new ImapFlow({
                host: mailConfig.imap.host,
                port: 993,
                secure: true,
                auth: {
                    user: mailConfig.imap.user,
                    pass: mailConfig.imap.password,
                },
                logger: false
            })
        }
    }

    isAvailable() {
        return this.imap !== null
    }

    async connect() {
        if(this.imap == null) {
            return
        }
        await this.imap.connect()
    }

    async disconnect() {
        if(this.imap == null) {
            return
        }
        await this.imap.logout()
    }

    async appendMail({ imapPath, rfc822_message }) {
        // console.log("IMAP APPEND")

        if(this.imap == null) {
            return
        }

        // console.log(imapPath)
        // console.log(rfc822_message)

        let result = null
        try {
            result = await this.imap.append(imapPath, rfc822_message, [ '\\Seen' ], new Date())
            // console.log(result)
        } catch(err) {
            throw err
        }
        return result
    }

}

module.exports = {
    createSession: function() {
        return new Session()
    }
}

