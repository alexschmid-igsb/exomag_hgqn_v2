// EINFACHER STANDALONE TEST FÜR DAS IMPORT PROCESSING

const fs = require('fs')

const db = require('../../../backend/database/connector.js').connector
const users = require('../../../backend/users/manager.js')

const Processing = require('../../../backend/import/excel_template/processing.js')

const xlsx = require('xlsx')
xlsx.helper = require('../../../backend/util/xlsx-helper.js')

const mapping = [
    {
        "id": "COLUMN_internalCaseId",
        "activated": true,
        "sourceColumn": "Internal Case ID",
        "targetColumn": {
            "label": "Internal Case ID",
            "path": "internalCaseId",
            "is_key": true
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_gestaltMatcherId",
        "activated": true,
        "sourceColumn": "GestaltMatcher ID",
        "targetColumn": {
            "label": "GestaltMatcher ID",
            "path": "gestaltMatcherId",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_externalCaseId",
        "activated": true,
        "sourceColumn": "External Case ID",
        "targetColumn": {
            "label": "External Case ID",
            "path": "externalCaseId",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_face2GeneId",
        "activated": true,
        "sourceColumn": "Face2Gene ID",
        "targetColumn": {
            "label": "Face2Gene ID",
            "path": "face2GeneId",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_sex",
        "activated": true,
        "sourceColumn": "Sex",
        "targetColumn": {
            "label": "Sex",
            "path": "sex",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_ageInMonths",
        "activated": true,
        "sourceColumn": "Age (in months)",
        "targetColumn": {
            "label": "Age (in months)",
            "path": "ageInMonths",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_ageinYears",
        "activated": true,
        "sourceColumn": "Age (in years)",
        "targetColumn": {
            "label": "Age (in years)",
            "path": "ageinYears",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_prenatal",
        "activated": true,
        "sourceColumn": "Prenatal",
        "targetColumn": {
            "label": "Prenatal",
            "path": "prenatal",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_dateOfBirth",
        "activated": true,
        "sourceColumn": "Date of Birth",
        "targetColumn": {
            "label": "Date of Birth",
            "path": "dateOfBirth",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_startDerDiagnostik",
        "activated": true,
        "sourceColumn": "Start der Diagnostik",
        "targetColumn": {
            "label": "Start der Diagnostik",
            "path": "startDerDiagnostik",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_befunddatum",
        "activated": true,
        "sourceColumn": "Befunddatum",
        "targetColumn": {
            "label": "Befunddatum",
            "path": "befunddatum",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_diseaseCategory",
        "activated": true,
        "sourceColumn": "Disease Category",
        "targetColumn": {
            "label": "Disease Category",
            "path": "diseaseCategory",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_caseStatus",
        "activated": true,
        "sourceColumn": "Case Status",
        "targetColumn": {
            "label": "Case Status",
            "path": "caseStatus",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_hpoTerms",
        "activated": true,
        "sourceColumn": "HPO Terms",
        "targetColumn": {
            "label": "HPO Terms",
            "path": "hpoTerms",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_bisherigeDiagnostik",
        "activated": true,
        "sourceColumn": "Bisherige Diagnostik",
        "targetColumn": {
            "label": "Bisherige Diagnostik",
            "path": "bisherigeDiagnostik",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_singleDuoTrio",
        "activated": true,
        "sourceColumn": "Single / Duo / Trio",
        "targetColumn": {
            "label": "Single / Duo / Trio",
            "path": "singleDuoTrio",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_referringClinician",
        "activated": true,
        "sourceColumn": "Referring Clinician",
        "targetColumn": {
            "label": "Referring Clinician",
            "path": "referringClinician",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_autozygosity",
        "activated": true,
        "sourceColumn": "Autozygosity",
        "targetColumn": {
            "label": "Autozygosity",
            "path": "autozygosity",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_testConducted",
        "activated": true,
        "sourceColumn": "Test conducted",
        "targetColumn": {
            "label": "Test Conducted",
            "path": "testConducted",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_changesInManagementOrTherapyAfterTest",
        "activated": true,
        "sourceColumn": "Changes in Management / Therapy after Test",
        "targetColumn": {
            "label": "Changes in Management / Therapy after Test",
            "path": "changesInManagementOrTherapyAfterTest",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_secondaryOrIncidentalFindings",
        "activated": true,
        "sourceColumn": "Secondary or incidental Findings",
        "targetColumn": {
            "label": "Secondary or incidental Findings",
            "path": "secondaryOrIncidentalFindings",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_relevantFindingsForResearch",
        "activated": true,
        "sourceColumn": "Relevant findings for research",
        "targetColumn": {
            "label": "Relevant findings for research",
            "path": "relevantFindingsForResearch",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_selektivvertrag",
        "activated": true,
        "sourceColumn": "Selektivvertrag",
        "targetColumn": {
            "label": "Selektivvertrag",
            "path": "selektivvertrag",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_wetlabMetainfo",
        "activated": true,
        "sourceColumn": "Wetlab Metainfo",
        "targetColumn": {
            "label": "Wetlab Metainfo",
            "path": "wetlabMetainfo",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_AutoCasc",
        "activated": true,
        "sourceColumn": "AutoCasc",
        "targetColumn": {
            "label": "AutoCasc",
            "path": "AutoCasc",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_kommentar",
        "activated": true,
        "sourceColumn": "Kommentar",
        "targetColumn": {
            "label": "Kommentar",
            "path": "kommentar",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_gene",
        "activated": true,
        "sourceColumn": "Gene",
        "targetColumn": {
            "label": "Gene",
            "path": "variants.gene",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_variantSolvesCase",
        "activated": true,
        "sourceColumn": "Variant solves case",
        "targetColumn": {
            "label": "Variant solves case",
            "path": "variants.variantSolvesCase",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_ifNewDiseaseGeneLevelOfEvidence",
        "activated": true,
        "sourceColumn": "Level of Evidence (for new disease genes)",
        "targetColumn": {
            "label": "Level of Evidence (for new disease genes)",
            "path": "variants.ifNewDiseaseGeneLevelOfEvidence",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_acmgClass",
        "activated": true,
        "sourceColumn": "ACMG Class",
        "targetColumn": {
            "label": "ACMG Class",
            "path": "variants.acmg.class",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_acmgCriteria",
        "activated": true,
        "sourceColumn": "ACMG Criteria",
        "targetColumn": {
            "label": "ACMG Criteria",
            "path": "variants.acmg.criteria",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_zygosity",
        "activated": true,
        "sourceColumn": "Zygosity",
        "targetColumn": {
            "label": "Zygosity",
            "path": "variants.zygosity",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_segregationsanalyse",
        "activated": true,
        "sourceColumn": "Segregationsanalyse",
        "targetColumn": {
            "label": "Segregationsanalyse",
            "path": "variants.segregationsanalyse",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_modeOfInheritance",
        "activated": true,
        "sourceColumn": "Mode of Inheritance",
        "targetColumn": {
            "label": "Mode of Inheritance",
            "path": "variants.modeOfInheritance",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_pubMedId",
        "activated": true,
        "sourceColumn": "PubMed ID",
        "targetColumn": {
            "label": "PubMed ID",
            "path": "variants.pubMedId",
            "is_key": false
        },
        "updateMode": "KEEP"
    },
    {
        "id": "COLUMN_clinvarAccessionId",
        "activated": true,
        "sourceColumn": "Clinvar Accession ID",
        "targetColumn": {
            "label": "Clinvar Accession ID",
            "path": "variants.clinvarAccessionId",
            "is_key": false
        },
        "updateMode": "KEEP"
    }
]

async function main() {

    await db.initPromise
    await users.initPromise

    const rows = xlsx.helper.parseRowsFromFile('/home/alex/exomag_testdaten.xlsx', 'Data', 1).rows

    const processing = Processing.createInstance({ mapping: mapping })

    for (let row of rows) {
        let result = processing.process(row)
        break
    }

    // console.dir(rows, {depth: null})

    process.exit(0)
}

main().catch(err => console.error(err))


