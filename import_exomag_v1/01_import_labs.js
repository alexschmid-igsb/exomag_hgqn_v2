const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')





// MANUELLE LISTE DER LABS AUS DER EXCEL LISTE, ERGÄNTZT DURCH ZUSÄTZLICHE EINTRÄGE

const labs = [

    {
        id: '',
        shortName: 'MH Hannover',
        name: 'Institut für Humangenetik, Medizinische Hochschule Hannover',
        website: 'https://www.mhh.de/humangenetik',
        email: 'auber.bernd@mh-hannover.de', 
        clinvarId: 508447,
        old: ['MHH, Hannover']
    },
    {
        id: '',
        shortName: 'Uni Aachen',
        name: 'Institut für Humangenetik, Uni Aacchen ',
        website: 'https://www.ukaachen.de/kliniken-institute/institut-fuer-humangenetik-und-genommedizin/',
        email: 'https://www.ukaachen.de/kliniken-institute/institut-fuer-humangenetik-und-genommedizin/', 
        clinvarId: 505336,
        old: ['UK Aachen','UK Aachen/Tübingen']
    },
    {
        id: '',
        shortName: 'Uni Bonn',
        name: 'Institut für Humangenetik, Uni Bonn',
        website: 'https://www.humangenetics.uni-bonn.de/de',
        email: 'https://www.humangenetics.uni-bonn.de/de', 
        clinvarId: 508040,
        old: ['Bonn','IGSB']
    },
    {
        id: '',
        shortName: 'Charité',
        name: 'Medizinische Genetik, Charité',
        website: 'https://genetik.charite.de/',
        email: 'manuel.holtgrewe@bihealth.de', 
        clinvarId: 505735,
        old: ['Berlin']
    },
    {
        id: '',
        shortName: 'Uni Köln',
        name: 'Institut für Humangenetik, Uni Köln',
        website: 'http://humangenetik.uk-koeln.de/',
        email: 'christian.netzer@uk-koeln.de', 
        clinvarId: 243629,
        old: ['Köln']
    },
    {
        id: '',
        shortName: 'Uni Düsseldorf',
        name: 'Institut für Humangenetik, UKD-HHU',
        website: 'https://www.uniklinik-duesseldorf.de/patienten-besucher/klinikeninstitutezentren/institut-fuer-humangenetik',
        email: 'sugirtahn.sivalingam@med.uni-duesseldorf.de', 
        clinvarId: 505956,
        old: ['Duesseldorf','IFH,Duesseldorf','IFH, Duesseldorf']
    },
    {
        id: '',
        shortName: 'Uni Erlangen',
        name: 'Institut für Humangenetik, Uni Erlangen',
        website: 'http://www.humangenetik.uk-erlangen.de/',
        email: 'Christian.Thiel@uk-erlangen.de', 
        clinvarId: 505150,
        old: ['Erlangen']
    },
    {
        id: '',
        shortName: 'Uni Freiburg',
        name: 'Institut für Humangenetik, Uni Freiburg',
        website: 'http://www.humangenetik.uniklinik-freiburg.de/',
        email: 'Katalin.komlosi@uniklinik-freiburg.de', 
        clinvarId: 21170,
        old: ['Institut für Medizinische Genetik und Angewandte Genomik Tübingen']
    },
    {
        id: '',
        shortName: 'Uni Heidelberg',
        name: 'Institut für Humangenetik, Uni Heidelberg',
        website: 'https://www.klinikum.uni-heidelberg.de/humangenetik',
        email: null, 
        clinvarId: 506821,
        old: ['UKHD']
    },
    {
        id: '',
        shortName: 'Uniklinikum Essen',
        name: 'Institut für Humangenetik, Uniklinikum Essen',
        website: 'https://www.uk-essen.de/',
        email: 'christel.depienne@uni-due.de', 
        clinvarId: 507042,
        old: ['']
    },
    {
        id: '',
        shortName: 'TU München',
        name: 'Institut für Humangenetik, TUM',
        website: 'https://www.mri.tum.de/humangenetik',
        email: 'riccardo.berutti@tum.de', 
        clinvarId: 500240,
        old: ['München','Muenchen']
    },
    {
        id: '',
        shortName: 'Uni Göttingen',
        name: 'Institut für Humangenetik, Uni Göttingen',
        website: 'https://www.humangenetik-umg.de/',
        email: 'arne.zibat@med.uni-goettingen.de', 
        clinvarId: 19886,
        old: ['Göttingen']
    },
    {
        id: '',
        shortName: 'Uni Leipzig',
        name: 'Institut für Humangenetik, Uni Leipzig ',
        website: 'https://www.uniklinikum-leipzig.de/einrichtungen/humangenetik',
        email: 'clinical.genomics@medizin.uni-leipzig.de', 
        clinvarId: 506086,
        old: ['Leipzig']
    },
    {
        id: '',
        shortName: 'Uni Tübingen',
        name: 'Institut für Humangenetik, Uni Tübingen',
        website: 'http://www.medgen-tuebingen.de/',
        email: 'medgen.bioinformatik@med.uni-tuebingen.de', 
        clinvarId: 506385,
        old: ['Tuebingen']
    },
    {
        id: '',
        shortName: 'Uni Bochum',
        name: 'Institut für Humangenetik, Uni Bochum',
        website: 'https://www.ruhr-uni-bochum.de/mhg/',
        email: null, 
        clinvarId: 508444,
        old: ['']
    },
    {
        id: '',
        shortName: 'Uni Münster',
        name: 'Institut für Humangenetik, Uni Münster',
        website: 'https://www.ukm.de/institute/humangenetik',
        email: 'christian.ruckert@ukmuenster.de', 
        clinvarId: 507439,
        old: ['']
    },
    {
        id: '',
        shortName: 'LMU München',
        name: 'Institut für Humangenetik, Ludwig-Maximilians-Universität München',
        website: 'https://www.lmu-klinikum.de/humangenetik',
        email: null, 
        clinvarId: 507363,
        old: ['LMU Muenchen']
    }
]




// übrige sequencing labs aus der alten datenbank
// 'MHH' => 9,                 DUPLIKATE: DIESE SOLLEN NICHT ÜBERNOMMEN WERDEN
// 'Institut für Medizinische Genetik und Angewandte Genomik Tübingen'          DAS SIND FÄLLTE AUS FREIBURG DIE ABER VON TÜBINGEN SEQUENZIERT WURDEN. ZUORDNUNG ZU FREIBURG.
// 'UK Aachen/Tübingen' => 1,   DER EINE FALL GEHÖRT ZU AACHEN





    /*
    - _id: 0b557542-658d-4242-83ad-9f33ce99592b
    shortName: MVZ diagnosticum Frankfurt
    name: MVZ diagnosticum Frankfurt - Zentrum für Humangenetik
    website: https://genetik.diagnosticum.eu/
    email: info@genetik.diagnosticum.eu
  - _id: b1857977-5af1-4a44-a159-8901d8085d3a
    shortName: Humangenetik Stuttgart
    name: Praxis für Humangenetik und Prävention Stuttgart
    website: https://www.humangenetik-stuttgart.de/
    email: hering@humangenetik-stuttgart.de
    */





async function run() {

    await database.initPromise
    await users.initPromise


    const cases = require('./ExomAG_Daten_08.01.2024.json')





    // GET ALL OLD SEQUENCING LABS
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





