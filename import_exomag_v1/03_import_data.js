const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { DateTime } = require("luxon")

const db = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')

const lodash = require('lodash')

const FetchAPI = require('./FetchAPI')



// const mode = "VV"
const mode = "IMPORT"



/*
    TODO

    Jedem einzelnen case muss einer der folgenden zustände zugewiesen werden:

        - FEHLERFREI: D.h. der import konnte ohne JEGLICHES Problem durchgeführt werden)

        - FELDER AUSGELASSEN: D.h. es gibt Felder die vorher vorhanden waren aber der Wert nicht übernommen werden konnte
          z.b. weil er wert nicht den vorgaben entspricht. Hier muss angegeben werden, um welches Feld es sich handelt)
        
        - FEHLERHAFTE MEHRFACHE VARIANTEN: Die mehrfach varianten konnte aufgrund der trennsyntax der feldern nicht richtig
          aufgeteilt werden. 

        - VV FEHLER: gDNA oder cDNA konnten nicht geparst werden oder sind inkonsistent miteinander oder jeder andere grund
          der dazu führt, dass keine variante angelegt bzw. gelinkt werden konnte obwohl gDNA und/oder cDNA im zu imortierenden
          case vorhanden sind.

    Ziel dieser Klassifiktation ist es, die Probleme genauer verstehen zu können und Listen mit Cases zu generieren, die per Hand
    nachkorrigiert werden müssen oder an die Labs übergeben werden sollen.

    

*/





async function vv_query(build,variant,transcripts = 'all') {
    // const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    // const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${build}/${variant}/${transcripts}`
    const url = `http://localhost:8000/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    // console.log(url)
    return FetchAPI.get(url)
}




async function run() {

    await db.initPromise
    await users.initPromise


    const oldCases = require('./ExomAG_Daten_08.01.2024.json')




    // HÄUFIGKEITEN DER IN DEN ALTEN DATEN VORHANDENEN FELDER ERMITTELN
    // {
    //     let keys = new Map()
    //     for(const row of oldCases) {
    //         for(let key of Object.keys(row)) {
    //             if(keys.has(key)) {
    //                 keys.set(key,keys.get(key)+1)
    //             } else {
    //                 keys.set(key,1)
    //             }
    //         }
    //     }
    //     console.log(keys)
    // }







    /*
        Ergebnis der Häufigkeiten in den alten Daten

        Map(31) {
            'sex' => 5313,
            'age in years' => 3452,
            'sequencing lab' => 5313,
            'internal case ID' => 5313,
            'single/duo/trio' => 5285,
            'Selektivvertrag' => 898,
            'disease category' => 2318,
            'Befunddatum' => 3726,
            'Start der Diagnostik' => 3702,
            'HPO terms' => 5267,
            'referring clinician' => 4117,
            'bisherige Diagnostik' => 452,
            'case solved/unsolved/unclear' => 5133,
            'Face2Gene ID' => 300,
            'external case ID' => 11,
            'GestaltMatcher ID' => 206,
            'autozygosity' => 1184
            'changes in management/therapy after test' => 66,
            'secondary/incidental findings' => 93,
            'relevant findings for research' => 400,
            

            potentiell multiple felder

            'mode of inheritance' => 1898,
            'ACMG class' => 2093,
            'de novo' => 942,
            'zygosity' => 1438,
            'HGVS_cDNA' => 2029,
            'HGVS_gDNA' => 1140,
            'gene' => 2044,
            'if new disease gene, level of evidence' => 15,
            'pmid' => 10,
            'ACMG evidences' => 25,
            'ClinVar Accession ID' => 190,
        }


        

        MAPPING VORHANDENEN FELDER IN DEN ALTEN DATEN
        WICHTIG: Wenn sich hier an den Daten nochmal was ändert, 

            'internal case ID' --> internalCaseId

            'sequencing lab' wird die lab id geholt unt dann --> sequencingLab

            'external case ID' --> externalCaseId

            'GestaltMatcher ID' --> gestaltMatcherId

            'Face2Gene ID' --> face2GeneId

            'sex' --> sex
            enum check und korrektur
            [male, female, ambigous]

            'HPO terms' -> hpoTerms
            array parsen und prüfen

            'single/duo/trio' --> singleDuoTrio
            enum check und korrektur?
            [single, duo, trio, '>3']

            'case solved/unsolved/unclear' --> caseStatus
            enum check und korrektur?
            [solved, partially solved, unclear, unsolved]

            'Selektivvertrag' --> selektivvertrag
            enum check und korrektur?
            [ja, nein, beantragt]

            'disease category' --> diseaseCategory:
            enum check und korrektur?
            [neurodevelopmental,neurological/neuromuscular,organ abnormality,haematopoiesis/immune system,endocrine,metabolic,mitochondrial nutritional,cardiovascular,other]

            'referring clinician' --> referringClinician

            'bisherige Diagnostik' --> bisherigeDiagnostik

            'age in years' --> ageinYears
            decimal check

            'autozygosity' --> autozygosity
            decimal check

            'Start der Diagnostik' --> startDerDiagnostik
            date type check

            'Befunddatum' --> befunddatum
            date type check

            'changes in management/therapy after test' --> changesInManagement_TherapyAfterTest

            'secondary/incidental findings' --> secondaryOrIncidentalFindings

            'relevant findings for research' --> relevantFindingsForResearch
            




            MAIN CASE FELDER OHNE EINTRÄGE IN DEN ALTEN DATEN
            
            testConducted:
                type: string
                enum:
                - Panel
                - Exome
                - Genome
                - array

            wetlabMetainfo:
                type: string

            AutoCasc:
                type: string

            prenatal:
                type: integer

            ageInMonths:
                type: decimal
            
            dateOfBirth:
                type: date

            kommentar:
                type: string




            MUTLIPLE FELDER IM PATH 'variants'

            variants:

              - gene:
                    type: string
                    required: true

                variantSolvesCase:
                    type: string
                    enum:
                    [primary, incidental, candidate]

                ifNewDiseaseGeneLevelOfEvidence:
                    type: string

                acmg:

                    class:
                        type: string
                        required: true
                        enum:
                        [pathogenic, likely pathogenic, unclear, likely benign, benign]

                    criteria:
                    - type: string
                        enum:
                        [PVS1,PS1,PS2,PS3,PS4,PM1,PM2,PM3,PM4,PM5,PM6,PP1,PP2,PP3,PP4,PP5,BA1,BS1,BS2,BS3,BS4,BP1,BP2,BP3,BP4,BP5,BP6,BP7]

                zygosity:
                    type: string
                    enum:
                    [heterozygous,homozygous,comp het,hemi,homoplasmic,heteroplasmic]

                segregationsanalyse:
                    type: string
                    enum:
                    [not performed,de novo,transmitted from father,transmitted from mother]

                modeOfInheritance:
                    type: string
                    enum:
                    [dominant,recessive,X-linked,mitochondrial,unclear]

                variant:
                    reference:
                        type: string
                        reference: GRID_variants
                        required: true
                    transcript:
                        type: string

    */



  
    const mainFieldMapping = [
        {
            source: 'internal case ID',
            target: 'internalCaseId',
            type: 'string'
        },
        {
            source: 'external case ID',
            target: 'externalCaseId',
            type: 'string'
        },
        {
            source: 'GestaltMatcher ID',
            target: 'gestaltMatcherId',
            type: 'string'
        },
        {
            source: 'Face2Gene ID',
            target: 'face2GeneId',
            type: 'string'
        },
        {
            source: 'sex',
            target: 'sex',
            type: 'string',
            enum: {
                values: ['male', 'female', 'ambigous'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'f':
                        case 'F':
                        case 'Female':
                            return 'female'
                        case 'm':
                        case 'M':
                        case 'Male':
                            return 'male'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'single/duo/trio',
            target: 'singleDuoTrio',
            type: 'string',
            enum: {
                values: ['single', 'duo', 'trio', '>3'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'Single':
                            return 'single'
                        case 'Duo':
                            return 'duo'
                        case 'Trio':
                            return 'trio'
                        case 'Quattro':
                        case 'quattro':
                        case 'Single & Trio (CeGaT)':
                        case 'Single + relative(s)':
                        case 'Trio + relative(s)':
                        case 'Quinto':
                            return '>3'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'case solved/unsolved/unclear',
            target: 'caseStatus',
            type: 'string',
            enum: {
                values: ['solved', 'partially solved', 'unclear', 'unsolved'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'no':
                        case 'Unsolved':
                            return 'unsolved'
                        case 'Solved':
                            return 'solved'
                        case 'probably solved':
                        case 'nicht ausgewertet':
                        case 'uncertain':
                        case 'unclear/unclear':
                            return 'unclear'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'Selektivvertrag',
            target: 'selektivvertrag',
            type: 'string',
            enum: {
                values: ['ja', 'nein', 'beantragt', 'unbekannt'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'yes':
                        case 'Yes':
                        case 'Ja':
                        case 'true':
                            return 'ja'
                        case 'unclear':
                            return 'unbekannt'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'disease category',
            target: 'diseaseCategory',
            type: 'string',
            enum: {
                values: ['neurodevelopmental','neurological/neuromuscular','organ abnormality','haematopoiesis/immune system','endocrine','metabolic','mitochondrial nutritional','cardiovascular','other'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'developmental':
                        case 'developmental disorder':
                        case 'developmental delay':
                        case 'Leukodystrophy':
                        case 'NDD+Epilepsy':
                        case 'NDD':
                        case 'epileptic encephalopathy':
                        case 'growth, cardiac, psychological':
                            return 'neurodevelopmental'
                        case 'Epilepsy':
                        case 'Neurological disorder':
                        case 'Neurodegenerative disease':
                        case 'neurological':
                        case 'neurological neuromuscular':
                        case 'neuromuscular':
                        case 'neurological disorder':
                        case 'neurology':
                        case 'Neuropathy':
                        case 'Myopathy':
                        case 'Dystonia':
                        case 'restless legs':
                        case 'frontotemporal dementia':
                        case 'Muscular dystrophy':
                        case 'Tremor':
                        case 'Ataxia':
                        case 'Psychomotor retardation':
                        case 'Dysmorphic Syndrome':
                        case 'hereditaere motorisch sensible Neuropathie':
                        case 'Neuromuscular disease':
                            return 'neurological/neuromuscular'
                        case 'Nephropathy':
                        case 'renal, cardiac':
                        case 'renal':
                        case 'skeletal/renal':
                        case 'skeletal':
                        case 'brain malformation':
                        case 'arteriovenösen Malformationssyndrom':
                        case 'Alport-Syndrome':
                        case 'malformations syndrome':
                            return 'organ abnormality'
                        case 'haematopoiesis and immune system':
                        case 'Haematology':
                        case 'Anemia':
                        case 'Hyperbilirubinemia':
                            return 'haematopoiesis/immune system'
                        case 'Glycogenosis':
                        case 'Metabolic disease':
                            return 'metabolic'
                        case 'endocrine, metabolic, mitochondrial nutritional':
                        case 'Mitochondrial disease':
                            return 'mitochondrial nutritional'
                        case 'cardiac':
                        case 'cardiac disease':
                        case 'vasculopathy':
                        case 'Hypotonia':
                        case 'dilated cardiomyopathy':
                        case 'Hypertrophic cardiomyopathy':
                            return 'cardiovascular'
                    }
                    return 'other'
                }
            }
        },
        {
            source: 'referring clinician',
            target: 'referringClinician',
            type: 'string'
        },
        {
            source: 'bisherige Diagnostik',
            target: 'bisherigeDiagnostik',
            type: 'string'
        },
        {
            source: 'age in years',
            target: 'ageinYears',
            type: 'decimal'
        },
        {
            source: 'autozygosity',
            target: 'autozygosity',
            type: 'decimal'
        },
        {
            source: 'Start der Diagnostik',
            target: 'startDerDiagnostik',
            type: 'date'
        },
        {
            source: 'Befunddatum',
            target: 'befunddatum',
            type: 'date'
        },
        {
            source: 'changes in management/therapy after test',
            target: 'changesInManagementOrTherapyAfterTest',
            type: 'string'
        },
        {
            source: 'secondary/incidental findings',
            target: 'secondaryOrIncidentalFindings',
            type: 'string'
        },
        {
            source: 'relevant findings for research',
            target: 'relevantFindingsForResearch',
            type: 'string'
        }
    ]
    








    const variantFieldMapping = [
        {
            source: 'mode of inheritance',
            target: 'modeOfInheritance',
            type: 'string',
            enum: {
                values: ['dominant','recessive','X-linked','mitochondrial','unclear'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'Autosomal Dominant':
                        case 'autosomal dominant':
                        case 'autosomal dominant;':
                        case 'AD':
                        case 'AD (de novo)':
                        case 'Autosomal Dominant - De Novo':
                        case 'domiant':
                            return 'dominant'
                        case 'X-Linked Dominant':
                        case 'X-linked;':
                        case 'x-linked recessive':
                        case 'x-linked dominant':
                        case 'de novo,  X-linked':
                        case 'X-Linked':
                        case 'x linked':
                        case 'XL':
                        case 'X-Linked Recessive':
                        case 'X-LinkedR':
                        case 'X-LinkedD':
                            return 'X-linked'
                        case 'autosomal recessive':
                        case 'autosomal recessive;':
                        case 'AR':
                        case 'Autosomal Recessive':
                        case 'AR (hom)':
                        case 'AR (comp het)':
                            return 'recessive'
                        case 'Mitochondrial':
                        case 'mt':
                            return 'mitochondrial'
                        case 'unknown':
                        case 'Unknown':
                            return 'unclear'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'zygosity',
            target: 'zygosity',
            type: 'string',
            enum: {
                values: ['heterozygous','homozygous','comp het','hemi','homoplasmic','heteroplasmic'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'heterozygote':
                        case 'Heterozygote':
                        case 'heterozygot':
                        case 'heterozygot;':
                        case 'het':
                        case 'Heterozygous':
                            return 'heterozygous'
                        case 'homozygot;':
                        case 'Homozygous':
                        case 'homo':
                        case 'homoyzgous':
                        case 'homozygote':
                        case 'Homozygote':
                            return 'homozygous'
                        case 'compound heterozygote':
                        case 'Compound het':
                        case 'compond het':
                        case 'compound heterozygous':
                        case 'compound het':
                        case 'Compound_Heterozygote':
                            return 'comp het'
                        case 'hemizygote':
                        case 'hemizygous':
                        case 'hemizygot;':
                        case 'Hemizygous':
                        case 'Hemizygote':
                            return 'hemi'
                        case 'Homoplasmic':
                            return 'homoplasmic'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'gene',
            target: 'gene',
            type: 'string',
        },
        {
            source: 'if new disease gene, level of evidence',
            target: 'ifNewDiseaseGeneLevelOfEvidence',
            type: 'string',
        },
        {
            source: 'de novo',
            target: 'segregationsanalyse',
            type: 'string',
            enum: {
                values: ['not performed','de novo','transmitted from father','transmitted from mother'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'NA':
                        case 'not in father, mother unavailable for testing':
                            return 'not performed'
                        case 'de novo\r\npaternal':
                        case 'de novo\npaternal':
                        case 'de novo dominant':
                            return 'de novo'
                        case 'inherited from father':
                        case 'paternal':
                            return 'transmitted from father'
                        case 'inherited from mother':
                        case 'maternal':
                            return 'transmitted from mother'
                    }
                    return oldValue
                }
            }
        },
        {
            source: 'pmid',
            target: 'pubMedId',
            type: 'string'
        },
        {
            source: 'ClinVar Accession ID',
            target: 'clinvarAccessionId',
            type: 'string'
        },
        {
            source: 'ACMG class',
            target: 'acmgClass',
            type: 'string',
            enum: {
                values: ['pathogenic', 'likely pathogenic', 'unclear', 'likely benign', 'benign'],
                korrektur: function(oldValue) {
                    switch(oldValue) {
                        case 'Pathogenic':
                        case 'pathogenic;':
                        case 'Pathogenic (V)':
                        case 'pathogen':
                        case 'Pathogenicic':
                            return 'pathogenic'
                        case 'Uncertain significance':
                        case 'vus':
                        case 'hot vus':
                        case 'variant of uncertain significance (VUS)':
                        case 'variant of uncertain significance (VUS);':
                        case 'Uncertain Significance (III)':
                        case 'VUS':
                        case 'VUC':
                        case 'hot VUS':
                        case 'uncertain significance':
                            return 'unclear'
                        case 'Likely pathogenic':
                        case 'likely pathogenic;':
                        case 'Likely Pathogenic (IV)':
                        case 'wahrscheinlich pathogen':
                        case 'Likely Pathogenic':
                        case 'likely Pathogenicic':
                            return 'likely pathogenic'
                        case 'Likely benign':
                            return 'likely benign'
                    }
                    return oldValue
                }
            }
        }
    ]


    const multiCheck = [
        'mode of inheritance',
        'ACMG class',
        'de novo',
        'zygosity',
        'HGVS_cDNA',
        'HGVS_gDNA',
        'gene',
        'if new disease gene, level of evidence',
        'pmid',
        'ACMG evidences',
        'ClinVar Accession ID'
    ]


    





    // PROCESS OLD CASES
    {

        let vv_gDNA = require('./vv_gDNA.json')
        let vv_cDNA = require('./vv_cDNA.json')
    

        // const hpoCheck = /^[hH][pP]:\d*$/
        const hpoParse = /([hH][pP][: ]?\d{7})[\s;,]*/g
        const acmgParse = /PVS1|PS1|PS2|PS3|PS4|PM1|PM2|PM3|PM4|PM5|PM6|PP1|PP2|PP3|PP4|PP5|BA1|BS1|BS2|BS3|BS4|BP1|BP2|BP3|BP4|BP5|BP6|BP7/g

        const dateTest = /^\d\d\.\d\d\.\d\d\d\d$/

        const oldLabToNewId = require('./old_lab_to_new_id.json')
        const newCases = []

        const collectEnumErrors = new Map()

        let problemCount = 0

        let vorhanden_gDNA = 0
        let valid_gDNA = 0
        let invalid_gDNA = 0

        let vorhanden_cDNA = 0
        let valid_cDNA = 0
        let invalid_cDNA = 0

        let mismatch = 0

        let iCase = 0

        for(const oldCase of oldCases) {

            console.log()
            console.log("PROCESS CASE " + iCase + "/" + oldCases.length)

            let newCase = {}

            // MAIN FIELDS (specific)

            // lab
            {
                let oldLab = oldCase['sequencing lab']
                if(oldLab === 'MHH') {
                    // diese neun Fälle sind duplikate und können ignoriert werden
                    continue
                }
                let newLabId = oldLabToNewId[oldLab]
                if(newLabId == null) {
                    throw new Error("could not map old lab name: " + oldLab)
                }
                newCase['sequencingLab'] = newLabId
            }

            // hpo terms
            {
                let oldHPOTerms = oldCase['HPO terms']

                if(lodash.isString(oldHPOTerms)) {
                    oldHPOTerms = oldHPOTerms.trim()
                }

                if(lodash.isString(oldHPOTerms) && oldHPOTerms.length > 0) {

                    const terms = []
                    for(let match of oldHPOTerms.matchAll(hpoParse)) {
                        let term = 'HP' + match[1].replace(' ',':').substring(2)
                        if(term.charAt(2) !== ':') {
                            term = 'HP:' + term.substring(2)
                        }
                        terms.push(term)
                    }
                    if(terms.length > 0) {
                        newCase['hpoTerms'] = terms
                    }
                }
            }



            // MAIN FIELDS (automatic)
            
            for(const mapping of mainFieldMapping) {

                let oldValue = oldCase[mapping.source]

                if(lodash.isString(oldValue)) {
                    oldValue = oldValue.trim()
                }

                if(oldValue == null || (lodash.isString(oldValue) && oldValue.length <= 0) ) {
                    // empty field
                    continue
                }

                let newValue = null
                switch(mapping.type) {
                    case 'string':
                        if(mapping.enum != null) {
                            if(lodash.isFunction(mapping.enum.korrektur)) {
                                oldValue = mapping.enum.korrektur(oldValue)
                            }
                            if(mapping.enum.values.includes(oldValue)) {
                                // enum test passed
                                newValue = oldValue
                            } else {
                                if(collectEnumErrors.has(mapping.target)) {
                                    collectEnumErrors.get(mapping.target).add(oldValue)
                                } else {
                                    collectEnumErrors.set(mapping.target,new Set([oldValue]))
                                }
                                // console.log("ENUM ERROR")
                                // console.log(mapping.target)
                                // console.log(oldValue)
                                // console.log()
                            }
                        } else {
                            newValue = oldValue
                        }
                        break;
                    case 'decimal':
                        newValue = null
                        if(oldValue.endsWith('%')) {
                            let number = Number.parseFloat(oldValue.substring(0,oldValue.length).replace(',','.'))
                            if(isNaN(number) === false) {
                                newValue = 0.01 * number
                            }
                        } else {
                            let number = Number.parseFloat(oldValue)
                            if(isNaN(number) === false) {
                                newValue = number
                            }
                        }
                        break;
                    case 'date':
                        newValue = null
                        if(dateTest.test(oldValue)) {
                            let date = DateTime.fromFormat(oldValue, 'dd.MM.yyyy').toUTC()
                            newValue = new Date(date).toISOString()
                        } else {
                            let date = Date.parse(oldValue)
                            if(isNaN(date) === false) {
                                newValue = new Date(date).toISOString()
                            }
                        }
                        break
                    default:
                        throw new Error('unhandled type: ' + mapping.type)
                }
                if(newValue != null) {
                    newCase[mapping.target] = newValue
                }
            }


            console.log("   internalCaseId: " + newCase.internalCaseId)
            console.log("   lab: " + oldCase['sequencing lab'])






            // VARIANTS FIELDS
            {
                let count = 0
                for(let key of multiCheck) {
                    let value = oldCase[key]
                    if(lodash.isString(value) && value.length > 0) {
                        let cnt = value.split('/').length
                        if(cnt > count) {
                            count = cnt
                        }
                    }
                }

                let extractedRows = Array(count).fill(0).map(() => ({}))

                for(let key of multiCheck) {
                    let value = oldCase[key]
                    if(lodash.isString(value) && value.length > 0) {
                        let parts = value.split('/')
                        if(parts.length === count) {
                            for(let i=0; i<count; i++) {
                                extractedRows[i][key] = parts[i]
                            }
                        } else if(parts.length === 1) {
                            for(let i=0; i<count; i++) {
                                extractedRows[i][key] = parts[0]
                            }
                        } else {
                            console.log(count)
                            console.log(key)
                            console.log(oldCase)
                            throw new Error("COUNT ERROR")
                        }
                    }
                }

                let variantEntries = []

                let iRow = 1

                for(let extractedRow of extractedRows) {

                    console.log("   VariantEntry " + iRow)

                    let variantEntry = {
                        variant: {
                        }
                    }
        
                    // automatic
                    for(const mapping of variantFieldMapping) {

                        let oldValue = extractedRow[mapping.source]

                        /*
                        if(newCase.internalCaseId === '1006284-2006288') {
                            console.log(mapping.source + ": " + oldValue)
                        }
                        */
        
                        if(lodash.isString(oldValue)) {
                            oldValue = oldValue.trim()
                        }
        
                        if(oldValue == null || (lodash.isString(oldValue) && oldValue.length <= 0) ) {
                            // empty field
                            continue
                        }
        
                        let newValue = null
                        switch(mapping.type) {
                            case 'string':
                                if(mapping.enum != null) {
                                    if(lodash.isFunction(mapping.enum.korrektur)) {
                                        oldValue = mapping.enum.korrektur(oldValue)
                                    }
                                    if(mapping.enum.values.includes(oldValue)) {
                                        // enum pass
                                        newValue = oldValue
                                    } else {
                                        if(collectEnumErrors.has(mapping.target)) {
                                            collectEnumErrors.get(mapping.target).add(oldValue)
                                        } else {
                                            collectEnumErrors.set(mapping.target,new Set([oldValue]))
                                        }
                                        // console.log("ENUM ERROR")
                                        // console.log(mapping.target)
                                        // console.log(oldValue)
                                        // console.log()
                                    }
                                } else {
                                    newValue = oldValue
                                }
                                break;
                            case 'decimal':
                            case 'date':
                            default:
                                throw new Error('unhandled type: ' + mapping.type)
                        }
                        if(newValue != null) {
                            variantEntry[mapping.target] = newValue
                        }
                    }


                    // manuell 
                    if(variantEntry.acmgClass != null) {
                        if(variantEntry.acmg == null) {
                            variantEntry.acmg = {}
                        }
                        variantEntry.acmg.class = variantEntry.acmgClass
                        delete variantEntry.acmgClass
                    }
                    
                    {
                        let oldValue = extractedRow['ACMG evidences']
        
                        if(lodash.isString(oldValue)) {
                            oldValue = oldValue.trim()
                        }
        
                        if(lodash.isString(oldValue) && oldValue.length > 0) {

                            const terms = new Set()
                            for(let match of oldValue.matchAll(acmgParse)) {
                                terms.add(match[0])
                            }
                            let termsArray = Array.from(terms.values())

                            if(termsArray.length > 0) {
                                if(variantEntry.acmg == null) {
                                    variantEntry.acmg = {}
                                }
                                variantEntry.acmg.criteria = termsArray
                            }
                        }
                    }

                    // variants


                    // gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA gDNA 
                    let gDNA_variant = null
                    {
                        let gDNA = extractedRow['HGVS_gDNA']

                        if(lodash.isString(gDNA)) {
                            gDNA = gDNA.trim()
                        }
        
                        if(lodash.isString(gDNA) && gDNA.length > 0) {
                            if(mode === 'VV') {
                                console.log("      gDNA: " + gDNA)
                                if(vv_gDNA[gDNA] != null) {
                                    console.log("            -> schon vorhanden")
                                } else {
                                    let vv = null
                                    try {
                                        vv = await vv_query('GRCh38',gDNA,'auth_all')
                                    } catch(error) {
                                        vv = { error: "valiation error" }
                                    }
                                    // console.log(vv)
                                    vv_gDNA[gDNA] = vv
                                }
                            } else if(mode === 'IMPORT') {

                                vorhanden_gDNA = vorhanden_gDNA + 1

                                let vv = vv_gDNA[gDNA]

                                console.log("      " + gDNA)
                                // console.dir(vv,{depth: null})
                                // console.log(Object.keys(vv))
                                // console.log(vv.validation_warning_1)#

                                gDNA_variant = {
                                    GRCh37: {
                                        gDNA: null,
                                        build: 'GRCh37',
                                        chr: null,
                                        pos: null,
                                        ref: null,
                                        alt: null,
                                    },
                                    GRCh38: {
                                        gDNA: null,
                                        build: 'GRCh38',
                                        chr: null,
                                        pos: null,
                                        ref: null,
                                        alt: null,
                                    }
                                }

                                let isValid = true

                                if(gDNA.indexOf(';') != -1) {
                                    // alle aussortieren die ein semikolon verwenden 
                                    // muss später reported werden und schauen wie man damit umgehen kann
                                    isValid = false
                                    gDNA_variant = null

                                } else if(vv.flag === 'gene_variant') {

                                    // VV TO VARIANT

                                    try {
                                        let first = true
                                        for(let [key,entry] of Object.entries(vv)) {
                                            if(entry.primary_assembly_loci != null) {
                                                if(first === true) {
                                                    gDNA_variant.GRCh37.gDNA = entry.primary_assembly_loci.grch37.hgvs_genomic_description
                                                    gDNA_variant.GRCh37.chr = entry.primary_assembly_loci.grch37.vcf.chr
                                                    gDNA_variant.GRCh37.pos = entry.primary_assembly_loci.grch37.vcf.pos
                                                    gDNA_variant.GRCh37.ref = entry.primary_assembly_loci.grch37.vcf.ref
                                                    gDNA_variant.GRCh37.alt = entry.primary_assembly_loci.grch37.vcf.alt
                                                    gDNA_variant.GRCh38.gDNA = entry.primary_assembly_loci.grch38.hgvs_genomic_description
                                                    gDNA_variant.GRCh38.chr = entry.primary_assembly_loci.grch38.vcf.chr
                                                    gDNA_variant.GRCh38.pos = entry.primary_assembly_loci.grch38.vcf.pos
                                                    gDNA_variant.GRCh38.ref = entry.primary_assembly_loci.grch38.vcf.ref
                                                    gDNA_variant.GRCh38.alt = entry.primary_assembly_loci.grch38.vcf.alt
                                                    let check = gDNA_variant.GRCh37.gDNA != null && gDNA_variant.GRCh37.chr != null && gDNA_variant.GRCh37.pos != null && gDNA_variant.GRCh37.ref != null && gDNA_variant.GRCh37.alt != null && gDNA_variant.GRCh38.gDNA != null && gDNA_variant.GRCh38.chr != null && gDNA_variant.GRCh38.pos != null && gDNA_variant.GRCh38.ref != null && gDNA_variant.GRCh38.alt != null
                                                    if(check === false) {
                                                        // Muss reported werden
                                                        isValid = false
                                                        gDNA_variant = null
                                                    }
                                                    first = false
                                                } else {
                                                    let check = 
                                                        gDNA_variant.GRCh37.gDNA === entry.primary_assembly_loci.grch37.hgvs_genomic_description &&
                                                        gDNA_variant.GRCh37.chr === entry.primary_assembly_loci.grch37.vcf.chr &&
                                                        gDNA_variant.GRCh37.pos === entry.primary_assembly_loci.grch37.vcf.pos &&
                                                        gDNA_variant.GRCh37.ref === entry.primary_assembly_loci.grch37.vcf.ref &&
                                                        gDNA_variant.GRCh37.alt === entry.primary_assembly_loci.grch37.vcf.alt &&
                                                        gDNA_variant.GRCh38.gDNA === entry.primary_assembly_loci.grch38.hgvs_genomic_description &&
                                                        gDNA_variant.GRCh38.chr === entry.primary_assembly_loci.grch38.vcf.chr &&
                                                        gDNA_variant.GRCh38.pos === entry.primary_assembly_loci.grch38.vcf.pos &&
                                                        gDNA_variant.GRCh38.ref === entry.primary_assembly_loci.grch38.vcf.ref &&
                                                        gDNA_variant.GRCh38.alt === entry.primary_assembly_loci.grch38.vcf.alt;
                                                    if(check === false) {
                                                        // Diese Fälle deuten auf einen fehlerhafte eingabe hin, die allerdings von
                                                        // variant validator irgendwie interpretiert wird als unterschiedliche ergebnisse
                                                        // mit warnings versehen.
                                                        // Diese Fälle sollten reported werden um einen korrektur zu bekommen
                                                        isValid = false
                                                        gDNA_variant = null
                                                    }
                                                }
                                            }
                                        }                                        
                                    } catch(err) {
                                        // muss reported werden
                                        isValid = false
                                        gDNA_variant = null
                                    }
                                    
                                } else {
                                    // todo: muss reported werden
                                    isValid = false
                                    gDNA_variant = null
                                }


                                if(isValid === true) {
                                    // HIER IST ALLES OK, variante kann gesetzt werden
                                    gDNA_variant.id = `GRCh38-${gDNA_variant.GRCh38.chr}-${gDNA_variant.GRCh38.pos}-${gDNA_variant.GRCh38.ref}-${gDNA_variant.GRCh38.alt}`
                                    valid_gDNA = valid_gDNA + 1
                                } else {
                                    invalid_gDNA = invalid_gDNA + 1
                                }

                                
                            }   // end if mode === IMPORT

                        } // end check of gDNA feld vorhanden

                    } // end äußerer klammern
                    



                    // cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA cDNA 
                    let cDNA_variant = null
                    let cDNA = null
                    {
                        cDNA = extractedRow['HGVS_cDNA']

                        if(lodash.isString(cDNA)) {
                            cDNA = cDNA.trim()
                        }
        
                        if(lodash.isString(cDNA) && cDNA.length > 0) {
                            if(mode === 'VV') {
                                console.log("      cDNA: " + cDNA)
                                if(vv_cDNA[cDNA] != null) {
                                    console.log("            -> schon vorhanden")
                                } else {
                                    let vv = null
                                    try {
                                        vv = await vv_query('GRCh38',cDNA,'auth_all')
                                    } catch(error) {
                                        vv = { error: "valiation error" }
                                    }
                                    // console.log(vv)
                                    vv_cDNA[cDNA] = vv
                                }
                            } else if(mode === 'IMPORT') {

                                vorhanden_cDNA = vorhanden_cDNA + 1

                                let vv = vv_cDNA[cDNA]

                                console.log("      " + cDNA)

                                cDNA_variant = {
                                    GRCh37: {
                                        gDNA: null,
                                        build: 'GRCh37',
                                        chr: null,
                                        pos: null,
                                        ref: null,
                                        alt: null,
                                    },
                                    GRCh38: {
                                        gDNA: null,
                                        build: 'GRCh38',
                                        chr: null,
                                        pos: null,
                                        ref: null,
                                        alt: null,
                                    }
                                }

                                let isValid = true

                                if(vv == null) {
                                    // TODO: report
                                    isValid = false
                                    cDNA_variant = null
                                } else if(cDNA.indexOf(';') != -1) {
                                    // alle aussortieren die ein semikolon verwenden 
                                    // muss später reported werden und schauen wie man damit umgehen kann
                                    isValid = false
                                    cDNA_variant = null
                                } else if(vv.flag === 'gene_variant') {

                                    if(Object.keys(vv).length != 3) {
                                        // TODO: report, ist irgendein fehler
                                        isValid = false
                                        cDNA_variant = null
                                    } else {
                                        // console.dir(vv,{depth: null})
                                        // throw new Error("GEHT NICHT")

                                        let entryKey = null
                                        let entry = null
                                        for(let [key,value] of Object.entries(vv)) {
                                            if(key !== 'flag' && key !== 'metadata') {
                                                entryKey = key
                                                entry = value
                                                break
                                            }
                                        }

                                                                                /*
                                        man nimmt einfach das user provided cDNA
                                        if(entryKey !== cDNA) {
                                            console.dir(entry,{depth: null})
                                            console.log(cDNA)
                                            console.log(entryKey)
                                            isValid = false
                                            cDNA_variant = null
                                        }
                                        */

                                        try {
                                            cDNA_variant.GRCh37.gDNA = entry.primary_assembly_loci.grch37.hgvs_genomic_description
                                            cDNA_variant.GRCh37.chr = entry.primary_assembly_loci.grch37.vcf.chr
                                            cDNA_variant.GRCh37.pos = entry.primary_assembly_loci.grch37.vcf.pos
                                            cDNA_variant.GRCh37.ref = entry.primary_assembly_loci.grch37.vcf.ref
                                            cDNA_variant.GRCh37.alt = entry.primary_assembly_loci.grch37.vcf.alt
                                            cDNA_variant.GRCh38.gDNA = entry.primary_assembly_loci.grch38.hgvs_genomic_description
                                            cDNA_variant.GRCh38.chr = entry.primary_assembly_loci.grch38.vcf.chr
                                            cDNA_variant.GRCh38.pos = entry.primary_assembly_loci.grch38.vcf.pos
                                            cDNA_variant.GRCh38.ref = entry.primary_assembly_loci.grch38.vcf.ref
                                            cDNA_variant.GRCh38.alt = entry.primary_assembly_loci.grch38.vcf.alt
                                            let check = cDNA_variant.GRCh37.gDNA != null && cDNA_variant.GRCh37.chr != null && cDNA_variant.GRCh37.pos != null && cDNA_variant.GRCh37.ref != null && cDNA_variant.GRCh37.alt != null && cDNA_variant.GRCh38.gDNA != null && cDNA_variant.GRCh38.chr != null && cDNA_variant.GRCh38.pos != null && cDNA_variant.GRCh38.ref != null && cDNA_variant.GRCh38.alt != null
                                            if(check === false) {
                                                // Muss reported werden
                                                isValid = false
                                                cDNA_variant = null
                                            }
                                        } catch(err) {
                                            // report
                                            isValid = false
                                            cDNA_variant = null
                                        }

                                    }

                                } else {
                                    // todo: muss reported werden
                                    isValid = false
                                    cDNA_variant = null
                                }

                                if(isValid === true) {
                                    cDNA_variant.id = `GRCh38-${cDNA_variant.GRCh38.chr}-${cDNA_variant.GRCh38.pos}-${cDNA_variant.GRCh38.ref}-${cDNA_variant.GRCh38.alt}`
                                    valid_cDNA = valid_cDNA + 1
                                } else {
                                    invalid_cDNA = invalid_cDNA + 1
                                }


                            }

                        }
                    }


                    // variante von gDNA und/oder cDNA erstellen
                    let importVariant = null
                    if(cDNA_variant == null) {
                        if(gDNA_variant == null) {
                            // keines von beiden vorhanden
                        } else {
                            // nur gDNA ist vorhanden

                            // importVariant setzen
                            importVariant = gDNA_variant

                            // variant in case setzten
                            variantEntry.variant.reference = gDNA_variant.id
                        }
                    } else {
                        if(gDNA_variant == null) {
                            // nur cDNA ist vorhanden
                            
                            // importVariant setzen
                            importVariant = cDNA_variant

                            // variant anlegen
                            variantEntry.variant.transcript = cDNA
                            variantEntry.variant.reference = cDNA_variant.id

                        } else {
                            // gDNA UND cDNA beide vorhanden

                            // mismatch testen
                            let check = cDNA_variant.id === gDNA_variant.id && cDNA_variant.GRCh37.gDNA === gDNA_variant.GRCh37.gDNA && cDNA_variant.GRCh37.chr === gDNA_variant.GRCh37.chr && cDNA_variant.GRCh37.pos === gDNA_variant.GRCh37.pos && cDNA_variant.GRCh37.ref === gDNA_variant.GRCh37.ref && cDNA_variant.GRCh37.alt === gDNA_variant.GRCh37.alt && cDNA_variant.GRCh38.gDNA === gDNA_variant.GRCh38.gDNA && cDNA_variant.GRCh38.chr === gDNA_variant.GRCh38.chr && cDNA_variant.GRCh38.pos === gDNA_variant.GRCh38.pos && cDNA_variant.GRCh38.ref === gDNA_variant.GRCh38.ref && cDNA_variant.GRCh38.alt === gDNA_variant.GRCh38.alt
                            if(check === false) {
                                // TODO: report
                                // kann man das hier einfach so durchlaufen lassen?
                                mismatch = mismatch + 1
                                /*
                                console.log(gDNA_variant)
                                console.log(cDNA_variant)
                                throw new Error("safljsf")
                                */
                            }

                            // importVariant setzen
                            importVariant = gDNA_variant

                            // variant anlegen
                            variantEntry.variant.transcript = cDNA
                            variantEntry.variant.reference = gDNA_variant.id
                        }
                    }

                    // TODO: variant muss in die DB, checken ob schon vorhanden





                    variantEntries.push(variantEntry)

                    iRow = iRow + 1
                }
                
                newCase.variants = variantEntries

                if(count > 2) {
                    // console.log(newCase)
                }

                if(newCase.internalCaseId === '1006284-2006288') {
                    // console.dir(newCase,{depth: null})
                }


            }




            if(mode === 'VV' && iCase % 10 === 0) {
                console.log("   WRITE JSON FILES")
                fs.writeFileSync('./import_exomag_v1/vv_gDNA.json', JSON.stringify(vv_gDNA,null,4))
                fs.writeFileSync('./import_exomag_v1/vv_cDNA.json', JSON.stringify(vv_cDNA,null,4))
            }
    
            iCase = iCase + 1


            // TODO: case muss in die DB, prüfen ob duplikat (lab, internal id)


        }   // end case loop

        // console.log(collectEnumErrors)





        console.log()
        console.log()
        console.log("VORHANDEN gDNA: " + vorhanden_gDNA)
        console.log("VALID gDNA: " + valid_gDNA)
        console.log("INVALID gDNA: " + invalid_gDNA)
        console.log()
        console.log("VORHANDEN cDNA: " + vorhanden_cDNA)
        console.log("VALID cDNA: " + valid_cDNA)
        console.log("INVALID cDNA: " + invalid_cDNA)
        console.log()
        console.log("MISMATCH: " + mismatch)





    }



    










}








( async () => {
    console.log("start")
    await run()
    console.log("finished")
})()





