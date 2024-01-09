const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const db = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const console = require('../backend/util/PrettyfiedConsole')

const lodash = require('lodash')


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
                    return null
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
                    return null
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
                    return null
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
                    return null
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

        // const hpoCheck = /^[hH][pP]:\d*$/
        const hpoParse = /([hH][pP][: ]?\d{7})[\s;,]*/g


        const oldLabToNewId = require('./old_lab_to_new_id.json')
        const newCases = []

        const collectEnumErrors = new Map()

        let problemCount = 0


        for(const oldCase of oldCases) {

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
                                // enum pass
                                newValue = oldValue
                            } else {
                                if(collectEnumErrors.has(mapping.target)) {
                                    collectEnumErrors.get(mapping.target).add(oldValue)
                                } else {
                                    collectEnumErrors.set(mapping.target,new Set([oldValue]))
                                }
                                console.log("ENUM ERROR")
                                console.log(mapping.target)
                                console.log(oldValue)
                                console.log()
                            }
                        } else {
                            newValue = oldValue
                        }
                        break;
                    case 'decimal':
                        newValue = null
                        break;
                    case 'date':
                        newValue = null
                        break;
                    default:
                        throw new Error('unhandled type: ' + mapping.type)
                }
                if(newValue != null) {
                    newCase[mapping.target] = newValue
                }
            }





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

                let extractedRows = Array(count).fill({})

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

                for(let extractedRow of extractedRows) {

                    let variantEntry = {}
        
                    // automatic
                    for(const mapping of variantFieldMapping) {

                        let oldValue = extractedRow[mapping.source]
        
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
                                newValue = null
                                break;
                            case 'date':
                                newValue = null
                                break;
                            default:
                                throw new Error('unhandled type: ' + mapping.type)
                        }
                        if(newValue != null) {
                            variantEntry[mapping.target] = newValue
                        }
                    }


                    // manuell 
                    if(variantEntry.acmgClass != null) {
                        variantEntry.acmg = {
                            class: variantEntry.acmgClass
                        }
                        delete variantEntry.acmgClass
                    }


                    if(extractedRow['ACMG evidences'] != null) {
                        console.log(extractedRow['ACMG evidences'])
                    }

                    /*

                    Der Split kann genauso laufen wie beim HPO
                    Man kann einfach den regexp so anpassen, dass er nur die bekannten zieht

                    'ACMG evidences' => 25,
                    */

                    /*
                    'HGVS_cDNA' => 2029,
                    'HGVS_gDNA' => 1140,
                    */

        
                    variantEntries.push(variantEntry)
                }
                
                newCase.variants = variantEntries

                if(count > 1) {
                    // console.log(newCase)
                }

            }








            // folgendes felder sind relevant um multiple zu prüfen




            /*
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
            */


            // specififc
            /*
            'ACMG evidences' => 25,
            'ACMG class' => 2093,
            'HGVS_cDNA' => 2029,
            'HGVS_gDNA' => 1140,
            */


            /*

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


                variant:
                    reference:
                        type: string
                        reference: GRID_variants
                        required: true
                    transcript:
                        type: string

            */






            // VARIANTS




        }


        console.log(collectEnumErrors)



    }




    









}








( async () => {
    console.log("start")
    await run()
    console.log("finished")
})()





