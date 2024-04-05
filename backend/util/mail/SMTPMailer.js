const config = require('../../../config/config')
const mailConfig = config['mail']

const lodash = require('lodash')
lodash.templateSettings.interpolate = /\{\{=([\s\S]+?)\}\}/g

const nodemailer = require('nodemailer')

let transport = nodemailer.createTransport({
    host: mailConfig.smtp.host,
    port: 587,
    auth: {
        user: mailConfig.smtp.user,
        pass: mailConfig.smtp.password,
    }
})


module.exports = {

    sendTransactionMail: async function({to,template,params}) {

        if(template == null) {
            throw new Error(`Missing template`)
        }

        var mail = {
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

        let result = await transport.sendMail(mail)

        return result
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






