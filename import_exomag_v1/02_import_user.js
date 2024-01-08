const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const db = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')




// MANUELLE ZUORDNUNG DER EMAIL ADRESSEN ZU DEN LABS

const email_to_lab = {
    "nadja.ehmke@charite.de": "8521a2a1-3fe6-4259-8b10-c54ddba4a233",
    "magdalena.danyel@charite.de": "8521a2a1-3fe6-4259-8b10-c54ddba4a233",
    "lara.segebrecht@charite.de": "8521a2a1-3fe6-4259-8b10-c54ddba4a233",
    "alexschmid@gmx.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "riccardo.berutti@helmholtz-munich.de": "0674dfcd-ecd5-42c2-8e10-1a28d536e117",
    "brand@imbie.meb.uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "kirchhoff@imbie.uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "klinkhammer@imbie.uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "dagmar.wieczorek@med.uni-duesseldorf.de": "110e4abb-1fda-46e3-ba71-e89bfe7d2b22",
    "sugirtahn.sivalingam@med.uni-duesseldorf.de": "110e4abb-1fda-46e3-ba71-e89bfe7d2b22",
    "ariane.schmetz@med.uni-duesseldorf.de": "110e4abb-1fda-46e3-ba71-e89bfe7d2b22",
    "uwe.kornak@med.uni-goettingen.de": "fde0c988-703d-411c-8a31-6306a264a57f",
    "pamela.okun@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "Katrin.Hinderhofer@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "hannah.heinrich@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "maja.hempel@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "camila.gabriel@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "Heiko.Brennenstuhl@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "Daniela.Choukair@med.uni-heidelberg.de": "f755b67d-04be-4c48-969d-310fc95b2a5b",
    "Tobias.Haack@med.uni-tuebingen.de": "088aab8f-2f8b-4c16-a1a1-2d27b4de9a38",
    "Marc.Sturm@med.uni-tuebingen.de": "088aab8f-2f8b-4c16-a1a1-2d27b4de9a38",
    "Kathrin.Grundmann@med.uni-tuebingen.de": "088aab8f-2f8b-4c16-a1a1-2d27b4de9a38",
    "Robin-Tobias.Jauss@medizin.uni-leipzig.de": "85c2e0e5-0e45-4a9d-bc4c-a34e7f3e7357",
    "johannes.lemke@medizin.uni-leipzig.de": "85c2e0e5-0e45-4a9d-bc4c-a34e7f3e7357",
    "stephan.drukewitz@medizin.uni-leipzig.de": "85c2e0e5-0e45-4a9d-bc4c-a34e7f3e7357",
    "Rami.AbouJamra@medizin.uni-leipzig.de": "85c2e0e5-0e45-4a9d-bc4c-a34e7f3e7357",
    "Auber.Bernd@mh-hannover.de": "f1890404-990a-4278-b4cc-77f0f212536c",
    "Ripperger.Tim@MH-Hannover.de": "f1890404-990a-4278-b4cc-77f0f212536c",
    "Mohsen.Shakibafar@mri.tum.de": "0674dfcd-ecd5-42c2-8e10-1a28d536e117",
    "Matias.Wagner@mri.tum.de": "0674dfcd-ecd5-42c2-8e10-1a28d536e117",
    "Melanie.Brugger@mri.tum.de": "0674dfcd-ecd5-42c2-8e10-1a28d536e117",
    "Theresa.Brunet@mri.tum.de": "0674dfcd-ecd5-42c2-8e10-1a28d536e117",
    "krzysztof.lubieniecki@rub.de": "53fa6948-65b2-43e3-a10f-febe661e2f01",
    "Charlotte.hippert@rub.de": "53fa6948-65b2-43e3-a10f-febe661e2f01",
    "steffen.uebe@uk-erlangen.de": "f1868c80-872e-4048-bff0-9c878c1f8de7",
    "cornelia.kraus@uk-erlangen.de": "f1868c80-872e-4048-bff0-9c878c1f8de7",
    "arif.ekici@uk-erlangen.de": "f1868c80-872e-4048-bff0-9c878c1f8de7",
    "christian.thiel@uk-erlangen.de": "f1868c80-872e-4048-bff0-9c878c1f8de7",
    "Kevin.Luethy@uk-essen.de": "3516b6fd-33d0-469e-87ab-a1a12d059c8c",
    "Fabian.Kilpert@uk-essen.de": "3516b6fd-33d0-469e-87ab-a1a12d059c8c",
    "Harald.Surowy@uk-essen.de": "3516b6fd-33d0-469e-87ab-a1a12d059c8c",
    "florian.erger@uk-koeln.de": "8fa2a3de-2963-447b-a57c-fac9afecfed1",
    "jepantel@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "mbegemann@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "fkraft@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "mielbracht@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "cknopp@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "ikurth@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "dsuh@ukaachen.de": "b595aa4f-8aa6-436c-ae21-08cd799f6549",
    "sophia.peters@ukbonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "Axel.Schmidt@ukbonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "Sheetal.Kumar@ukbonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "christian.ruckert@ukmuenster.de": "c6fc9e76-106e-48c0-ae90-ad265aab7f4f",
    "judit.horvath@ukmuenster.de": "c6fc9e76-106e-48c0-ae90-ad265aab7f4f",
    "schmida@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "thsieh@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "Hartmut.Engels@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "lesmann@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "pkrawitz@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "meghna@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "knausa@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "annaarlt@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "atie.kashef@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "incardon@uni-bonn.de": "72d98c4a-5780-449b-b70a-849634deaa19",
    "eva.klopocki@uni-wuerzburg.de": "e2f46f98-d38f-4cca-b6ad-0402ffb195c8",
    "jan.philip.biermann@uniklinik-freiburg.de": "6e70af0f-a055-46a1-949e-0c4192d53914",
    "katalin.komlosi@uniklinik-freiburg.de": "6e70af0f-a055-46a1-949e-0c4192d53914",
    "janbernd.kirschner@uniklinik-freiburg.de": "6e70af0f-a055-46a1-949e-0c4192d53914",
    "miriam.schmidts@uniklinik-freiburg.de": "6e70af0f-a055-46a1-949e-0c4192d53914",
    "andreas.zimmer@uniklinik-freiburg.de": "6e70af0f-a055-46a1-949e-0c4192d53914",
}



async function run() {

    await db.initPromise
    await users.initPromise

    const oldUsers = require('./ExomAG_User_08.01.2024.json')



    // CREATE LIST FOR email_to_lab MAPPING
    // {
    //     const emails = []
    //     for(let oldUser of oldUsers) {
    //         emails.push(oldUser.email)
    //     }
    //     function cmp(a,b) {
    //         const a2 = a.substring(a.indexOf('@')+1).toLowerCase()
    //         const b2 = b.substring(b.indexOf('@')+1).toLowerCase()
    //         return a2.localeCompare(b2)
    //     }
    //     emails.sort(cmp)
    //     for(let email of emails) {
    //         console.log('"' + email + '": "",')
    //     }
    // }






    // IMPORT USER
    {
        await db.deleteAll('CORE_users')
        for(let oldUser of oldUsers) {

            let labId = email_to_lab[oldUser.email]
    
            if(labId == null) {
                console.log("ERROR: KEIN LAB FÜR " + oldUser.email)
                break;
            }
            
            let item = {
                _id: oldUser.id,
                username: oldUser.username,
                email: oldUser.email.toLowerCase(),
                firstname: oldUser.firstname,
                lastname: oldUser.lastname,
                role: oldUser.role,
                isSuperuser: oldUser.isAdmin,
                lab: labId
            }
    
            if(oldUser.password != null) {
                item.password = oldUser.password
                item.state = {
                    id: 'ACTIVE'
                }
    
            } else {
                item.state = {
                    id: 'CREATED'
                }
            }
            // db.insertOne('CORE_users', item)
            db.insert('CORE_users', item)
        }
    }




}








( async () => {
    console.log("start")
    await run()
    console.log("finished")
})()





