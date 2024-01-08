const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const uuid = require('uuid')

const db = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')





// MANUELLE LISTE DER LABS AUS DER EXCEL LISTE, ERGÄNTZT DURCH ZUSÄTZLICHE EINTRÄGE

const labs = [

    {
        id: 'f1890404-990a-4278-b4cc-77f0f212536c',
        shortName: 'MH Hannover',
        name: 'Institut für Humangenetik, Medizinische Hochschule Hannover',
        website: 'https://www.mhh.de/humangenetik',
        email: 'auber.bernd@mh-hannover.de', 
        clinvarId: 508447,
        old: ['MHH, Hannover']
    },
    {
        id: 'b595aa4f-8aa6-436c-ae21-08cd799f6549',
        shortName: 'Uni Aachen',
        name: 'Institut für Humangenetik, Uni Aachen ',
        website: 'https://www.ukaachen.de/kliniken-institute/institut-fuer-humangenetik-und-genommedizin/',
        email: 'https://www.ukaachen.de/kliniken-institute/institut-fuer-humangenetik-und-genommedizin/', 
        clinvarId: 505336,
        old: ['UK Aachen','UK Aachen/Tübingen']
    },
    {
        id: '72d98c4a-5780-449b-b70a-849634deaa19',
        shortName: 'Uni Bonn',
        name: 'Institut für Humangenetik, Uni Bonn',
        website: 'https://www.humangenetics.uni-bonn.de/de',
        email: 'https://www.humangenetics.uni-bonn.de/de', 
        clinvarId: 508040,
        old: ['Bonn','IGSB']
    },
    {
        id: '8521a2a1-3fe6-4259-8b10-c54ddba4a233',
        shortName: 'Charité',
        name: 'Medizinische Genetik, Charité',
        website: 'https://genetik.charite.de/',
        email: 'manuel.holtgrewe@bihealth.de', 
        clinvarId: 505735,
        old: ['Berlin']
    },
    {
        id: '8fa2a3de-2963-447b-a57c-fac9afecfed1',
        shortName: 'Uni Köln',
        name: 'Institut für Humangenetik, Uni Köln',
        website: 'http://humangenetik.uk-koeln.de/',
        email: 'christian.netzer@uk-koeln.de', 
        clinvarId: 243629,
        old: ['Köln']
    },
    {
        id: '110e4abb-1fda-46e3-ba71-e89bfe7d2b22',
        shortName: 'Uni Düsseldorf',
        name: 'Institut für Humangenetik, UKD-HHU',
        website: 'https://www.uniklinik-duesseldorf.de/patienten-besucher/klinikeninstitutezentren/institut-fuer-humangenetik',
        email: 'sugirtahn.sivalingam@med.uni-duesseldorf.de', 
        clinvarId: 505956,
        old: ['Duesseldorf','IFH,Duesseldorf','IFH, Duesseldorf']
    },
    {
        id: 'f1868c80-872e-4048-bff0-9c878c1f8de7',
        shortName: 'Uni Erlangen',
        name: 'Institut für Humangenetik, Uni Erlangen',
        website: 'http://www.humangenetik.uk-erlangen.de/',
        email: 'Christian.Thiel@uk-erlangen.de', 
        clinvarId: 505150,
        old: ['Erlangen']
    },
    {
        id: '6e70af0f-a055-46a1-949e-0c4192d53914',
        shortName: 'Uni Freiburg',
        name: 'Institut für Humangenetik, Uni Freiburg',
        website: 'http://www.humangenetik.uniklinik-freiburg.de/',
        email: 'Katalin.komlosi@uniklinik-freiburg.de', 
        clinvarId: 21170,
        old: ['Institut für Medizinische Genetik und Angewandte Genomik Tübingen']
    },
    {
        id: 'f755b67d-04be-4c48-969d-310fc95b2a5b',
        shortName: 'Uni Heidelberg',
        name: 'Institut für Humangenetik, Uni Heidelberg',
        website: 'https://www.klinikum.uni-heidelberg.de/humangenetik',
        email: null, 
        clinvarId: 506821,
        old: ['UKHD']
    },
    {
        id: '3516b6fd-33d0-469e-87ab-a1a12d059c8c',
        shortName: 'Uniklinikum Essen',
        name: 'Institut für Humangenetik, Uniklinikum Essen',
        website: 'https://www.uk-essen.de/',
        email: 'christel.depienne@uni-due.de', 
        clinvarId: 507042,
        old: ['']
    },
    {
        id: '0674dfcd-ecd5-42c2-8e10-1a28d536e117',
        shortName: 'TU München',
        name: 'Institut für Humangenetik, TUM',
        website: 'https://www.mri.tum.de/humangenetik',
        email: 'riccardo.berutti@tum.de', 
        clinvarId: 500240,
        old: ['München','Muenchen']
    },
    {
        id: 'fde0c988-703d-411c-8a31-6306a264a57f',
        shortName: 'Uni Göttingen',
        name: 'Institut für Humangenetik, Uni Göttingen',
        website: 'https://www.humangenetik-umg.de/',
        email: 'arne.zibat@med.uni-goettingen.de', 
        clinvarId: 19886,
        old: ['Göttingen']
    },
    {
        id: '85c2e0e5-0e45-4a9d-bc4c-a34e7f3e7357',
        shortName: 'Uni Leipzig',
        name: 'Institut für Humangenetik, Uni Leipzig ',
        website: 'https://www.uniklinikum-leipzig.de/einrichtungen/humangenetik',
        email: 'clinical.genomics@medizin.uni-leipzig.de', 
        clinvarId: 506086,
        old: ['Leipzig']
    },
    {
        id: '088aab8f-2f8b-4c16-a1a1-2d27b4de9a38',
        shortName: 'Uni Tübingen',
        name: 'Institut für Humangenetik, Uni Tübingen',
        website: 'http://www.medgen-tuebingen.de/',
        email: 'medgen.bioinformatik@med.uni-tuebingen.de', 
        clinvarId: 506385,
        old: ['Tuebingen']
    },
    {
        id: '53fa6948-65b2-43e3-a10f-febe661e2f01',
        shortName: 'Uni Bochum',
        name: 'Institut für Humangenetik, Uni Bochum',
        website: 'https://www.ruhr-uni-bochum.de/mhg/',
        email: null, 
        clinvarId: 508444,
        old: ['']
    },
    {
        id: 'c6fc9e76-106e-48c0-ae90-ad265aab7f4f',
        shortName: 'Uni Münster',
        name: 'Institut für Humangenetik, Uni Münster',
        website: 'https://www.ukm.de/institute/humangenetik',
        email: 'christian.ruckert@ukmuenster.de', 
        clinvarId: 507439,
        old: ['']
    },
    {
        id: 'e891c7b5-1817-49ae-abbc-f5ce21efb178',
        shortName: 'LMU München',
        name: 'Institut für Humangenetik, Ludwig-Maximilians-Universität München',
        website: 'https://www.lmu-klinikum.de/humangenetik',
        email: null, 
        clinvarId: 507363,
        old: ['LMU Muenchen']
    },
    {
        id: 'e2f46f98-d38f-4cca-b6ad-0402ffb195c8',
        shortName: 'Uni Würzburg',
        name: 'Institut für Humangenetik, Uni Würzburg',
        website: 'https://www.biozentrum.uni-wuerzburg.de/humangenetik/',
        email: null, 
        clinvarId: 505911,
        old: ['']
    }
]




// kommentare zu den sequencing labs aus der alten datenbank

// 'MHH' => 9,                                                                  DAS SIND DUPLIKATE, SOLLEN NICHT ÜBERNOMMEN WERDEN
// 'Institut für Medizinische Genetik und Angewandte Genomik Tübingen'          DAS SIND FÄLLE AUS FREIBURG DIE ABER VON TÜBINGEN SEQUENZIERT WURDEN. ZUORDNUNG ABER ZU FREIBURG.
// 'UK Aachen/Tübingen' => 1,                                                   ANHAND DER internal case id kann man sagen, dass Fall zu zu Aachen gehören sollte






async function run() {

    await db.initPromise
    await users.initPromise

    const cases = require('./ExomAG_Daten_08.01.2024.json')

    // GET ALL OLD SEQUENCING LABS
    /*
    {
        const labs = new Map()
        for(let row of cases) {
            let name = row['sequencing lab']
            if(labs.has(name) === true) {
                labs.set(name,labs.get(name)+1)
            } else {
                labs.set(name,1)
            }
        }
        console.log(labs)
        // Für alle diese labs muss dann ein mapping erstellt werden
    }
    */



    // CREATE MAPPING FROM OLD LAB NAME TO NEW LAB ID
    {
        let oldLabs = new Set()
        for(let row of cases) {
            let name = row['sequencing lab']
            oldLabs.add(name)
        }
        oldLabs = [...oldLabs.values()]
        let mapping = {}
        for(let oldLab of oldLabs) {
            for(let lab of labs) {
                if(lab.old.includes(oldLab)) {
                    mapping[oldLab] = lab.id
                    break
                }
            }
        }
        fs.writeFileSync('./import_exomag_v1/old_lab_to_new_id.json', JSON.stringify(mapping,null,4))
    }




    // IMPORT LABS INTO DATABASE
    await db.deleteAll('STATIC_labs')
    for(let lab of labs) {
        const item = {
            _id: lab.id,
            // _id: uuid.parse(lab.id),
            shortName: lab.shortName,
            name: lab.name,
            website: lab.website,
            email: lab.email,
            clinvar: {
                organizationId: lab.clinvarId        
            }
        }
        // db.insertOne('STATIC_labs', item)        // DAS HIER HAT PROBLEME MIT DEM CASTEN DER UUID STRING NACH BINARY. uuid.parse geht auch nicht, ich weiß nicht, weleches UUID binary format erwartet wird von mongodb/mongoose
        db.insert('STATIC_labs', item)

        /*
        const bla = uuid.parse(lab.id)
        console.log(lab.id)
        console.log(bla)
        */
        

    }









    

    



    







    // try {

    // } catch (err) {
    //     console.log("ERROR")
    //     console.log(err)
    //     return
    // } finally {

    // }


}








( async () => {
    console.log("start")
    await run()
    console.log("finished")
})()





