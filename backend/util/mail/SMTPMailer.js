const config = require('../../../config/config')
const mailConfig = config['mail']

const lodash = require('lodash')
lodash.templateSettings.interpolate = /\{\{=([\s\S]+?)\}\}/g

const nodemailer = require('nodemailer')
const MailComposer = require('nodemailer/lib/mail-composer')

let transport = nodemailer.createTransport({
    host: mailConfig.smtp.host,
    port: 587,
    auth: {
        user: mailConfig.smtp.user,
        pass: mailConfig.smtp.password,
    }
})

module.exports = {

    sendTransactionMail: async function({to,template,params,imapSession}) {

        if(template == null) {
            throw new Error(`Missing template`)
        }

        var mailOptions = {
            from: `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
            to: `${to.name} <${to.email}>`,
            subject: lodash.template(template.subject)(params),
            text: lodash.template(template.text)(params),
            html: lodash.template(template.html)(params)
        }

        let result = null
        try {
            result = await transport.sendMail(mailOptions)
            
            if(imapSession != null && imapSession.isAvailable() === true) {
                let rfc822_message = await (new MailComposer(mailOptions)).compile().build()
                await imapSession.appendMail({imapPath: 'INBOX.Sent', rfc822_message})
            }
        } catch(err) {
            throw err
        }

        return result
    },

}
