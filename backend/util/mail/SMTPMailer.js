const config = require('../../../config/config')
const mailConfig = config['mail']

const lodash = require('lodash')
lodash.templateSettings.interpolate = /\{\{=([\s\S]+?)\}\}/g

const nodemailer = require('nodemailer')
const MailComposer = require('nodemailer/lib/mail-composer')

const { ImapFlow } = require('imapflow')

let transport = nodemailer.createTransport({
    host: mailConfig.smtp.host,
    port: 587,
    auth: {
        user: mailConfig.smtp.user,
        pass: mailConfig.smtp.password,
    }
})

let imap = null
if(mailConfig.imap != null) {
    imap = new ImapFlow({
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




module.exports = {

    sendTransactionMail: async function({to,template,params}) {

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

        let result = await transport.sendMail(mailOptions)

        return result
    },





    test: async function({to,template,params}) {

        var mailOptions = {
            from: `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
            to: `${to.name} <${to.email}>`,
            subject: lodash.template(template.subject)(params),
            text: lodash.template(template.text)(params),
            html: lodash.template(template.html)(params)
        }

        let mail = new MailComposer(mailOptions)
        console.log(mail)

        let message_rfc822 = await mail.compile().build()

        console.log(message_rfc822)
        




        jetzt: das wieder in imap kapseln und hier die imap bib verwenden, damit das senden automatisch nach imap schiebt, immer wenn imap vorhanden ist


        await imap.connect()

        let result = await imap.append('INBOX.Sent', message_rfc822, [ '\\Seen' ], new Date())
        console.log(result)

        await imap.logout()




    }


}










// let transporter = nodemailer.createTransport(options[, defaults])




/*

const api = new Brevo.TransactionalEmailsApi()
api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, mailConfig['BrevoAPIKey'])

module.exports = {

    sendTransactionMail : async function({to,template,params}) {

        if(template == null) {
            throw new Error(`Missing template`)
        }

        // console.log(template.html)

        let mail = new Brevo.SendSmtpEmail()

        // console.dir(params, {depth: null})

        mail.sender = mailConfig['from']
        mail.to = [to]

        // mail.replyTo = { "email": "replyto@domain.com", "name": "John Doe" };

        // mail.cc = [{"email":"example2@example2.com","name":"Janice Doe"}];
        // mail.bcc = [{"email":"John Doe","name":"example@example.com"}];

        mail.subject = lodash.template(template.subject)(params)
        mail.htmlContent = lodash.template(template.html)(params)
        mail.textContent = lodash.template(template.text)(params)

        
        mail.headers = { "Some-Custom-Name": "unique-id-1234" };
        mail.params = { "parameter": "My param value", "subject": "New Subject" };

        await api.sendTransacEmail(mail)

        console.log("MAIL SENT: " + mail.subject + " TO " + JSON.stringify(mail.to))

    }
}

*/






