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

            // SMTP envelope is usually auto generated from from, to, cc and bcc fields in the message object but if for some reason you want to specify it yourself (custom envelopes are usually used for VERP addresses), you can do it with the envelope property in the message object.
            // envelope: {
            //     from: 'Daemon <deamon@nodemailer.com>',                          // used as MAIL FROM: address for SMTP
            //     to: 'mailer@nodemailer.com, Mailer <mailer2@nodemailer.com>'     // used as RCPT TO: address for SMTP
            // }

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
