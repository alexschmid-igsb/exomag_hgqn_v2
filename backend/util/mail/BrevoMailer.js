const config = require('../../../config/config')
const mailConfig = config['mail']

const lodash = require('lodash')
lodash.templateSettings.interpolate = /\{\{=([\s\S]+?)\}\}/g

const Brevo = require('@sendinblue/client')

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

        /*
        console.log("\n\n\n\n\n\n\n\n\nRENDERED MAIL")
        console.log(mail.subject)
        console.log(mail.htmlContent)
        console.log(mail.textContent)
        */
        
        mail.headers = { "Some-Custom-Name": "unique-id-1234" };
        mail.params = { "parameter": "My param value", "subject": "New Subject" };

        await api.sendTransacEmail(mail)

        console.log("MAIL SENT: " + mail.subject + " TO " + JSON.stringify(mail.to))

        /*
        api.sendTransacEmail(mail).then(function(data) {
            console.log('API called successfully. Returned data: ')
            console.dir(data, { depth: null })
        }, function (error) {
            console.error(error)
        })
        */

    }
}






