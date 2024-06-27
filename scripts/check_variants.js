const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../backend/database/connector').connector
const users = require('../backend/users/manager')

const Mailer = require('../backend/util/mail/SMTPMailer')

const IMAPClient = require('../backend/util/mail/IMAPClient')
const imapSession = IMAPClient.createSession()

const console = require('../backend/util/PrettyfiedConsole')


const FetchAPI = require('./FetchAPI')




async function vvQuery(build,variant,transcripts = 'all') {
        
    // const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${build}/${variant}/${transcripts}`
    // const url = `https://exomag.meb.uni-bonn.de/vv/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`

    const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    // console.log(url)

    return FetchAPI.get(url)
}






const parse_primary_assembly_loci = (item) => {
    
    let parsed = {
        variant: {}
    }
    
    parsed.variant = {
        GRCh37: {
            gDNA: item?.grch37?.hgvs_genomic_description,
            build: 'GRCh37',
            chr: item?.grch37?.vcf?.chr,
            pos: parseInteger(item?.grch37?.vcf?.pos),
            ref: item?.grch37?.vcf?.ref,
            alt: item?.grch37?.vcf?.alt
        },
        GRCh38: {
            gDNA: item?.grch38?.hgvs_genomic_description,
            build: 'GRCh38',
            chr: item?.grch38?.vcf?.chr,
            pos: parseInteger(item?.grch38?.vcf?.pos),
            ref: item?.grch38?.vcf?.ref,
            alt: item?.grch38?.vcf?.alt
        }
    }

    let isValid =
        parsed.variant.GRCh37.gDNA != null &&
        parsed.variant.GRCh37.build != null &&
        parsed.variant.GRCh37.chr != null &&
        parsed.variant.GRCh37.pos != null &&
        parsed.variant.GRCh37.ref != null &&
        parsed.variant.GRCh37.alt != null &&
        parsed.variant.GRCh38.gDNA != null &&
        parsed.variant.GRCh38.build != null &&
        parsed.variant.GRCh38.chr != null &&
        parsed.variant.GRCh38.pos != null &&
        parsed.variant.GRCh38.ref != null &&
        parsed.variant.GRCh38.alt != null

    if(isValid === true) {
        parsed.hasError = false
        parsed.variant._id = `GRCh38-${parsed.variant.GRCh38.chr}-${parsed.variant.GRCh38.pos}-${parsed.variant.GRCh38.ref}-${parsed.variant.GRCh38.alt}`
    } else {
        parsed.hasError = true
    }

    return parsed
}






/*

let gDNA_processed = {
    source: variantEntry['HGVS_gDNA'],
    vvOutput: null,
    parsed: null,
    state: 'VALID'
}

if(gDNA_processed.source != null) {

    const fullPath = `variants[${i}].HGVS_gDNA`

    let caught = null
    try {
        gDNA_processed.vvOutput = await vvQuery('GRCh38',gDNA_processed.source,'mane_select')
    } catch(err) {
        caught = err
    }

    if(caught != null || gDNA_processed.vvOutput == null) {
        // console.dir(caught, {depth: null})
        let msg = `Unexpected error during VariantValidator query (Error Code 7).\ngDNA is '${gDNA_processed.source}'.`

        // if(caught != null) {
        //     msg += ` Error message from VariantValidator was '${caught.message != null ? caught.message : caught}'.`
        // } else {
        //     msg += ` VariantValidator returned 'null'.`
        // }

        let cause = {
            status: caught.status || 500,
            name: caught.name,
            message: caught.message,
            stackTrace: await StackTrace.fromError(caught)
        }
        record.report.addFieldError(fullPath, msg, cause)
        cDNA_processed.state = 'ERROR'
    }

    if(gDNA_processed.vvOutput != null && gDNA_processed.vvOutput.flag !== 'gene_variant') {
        let msg = `VariantValidator returned error for gDNA (Error Code 8): ${gDNA_processed.source}`
        record.report.addFieldError(fullPath, msg)
        // record.report.addTopLevelError(msg)
        gDNA_processed.state = 'ERROR'
    }
    
    if(gDNA_processed.vvOutput != null && gDNA_processed.state !== 'ERROR') {
        for(let [vvKey,vvEntry] of Object.entries(gDNA_processed.vvOutput)) {
            if(vvEntry.primary_assembly_loci != null) {
                let parsed = parse_primary_assembly_loci(vvEntry.primary_assembly_loci)
                if(gDNA_processed.parsed == null) {
                    if(parsed.hasError === true) {
                        // es gibt noch kein geparstes, aber das eben geparste ist fehlerhaft
                        // diesen fall einfach ignorieren, in der hoffnung, dass die nächsten entries korrekt geparst werden
                        // ein fehler wird in jedem fall generiert, wenn nach dem for loop kein gDNA_processed.parsed vorhanden ist
                    } else {
                        gDNA_processed.parsed = parsed
                    }
                } else {
                    // es gibt breits ein geparsten loci. der soeben geparset muss identisch sein, alles andere ist als fehler zu werten
                    let isEqual = lodash.isEqual(parsed, gDNA_processed.parsed)
                    if(isEqual === false) {
                        let msg = `VariantValidator returned ambiguous results for gDNA (Error Code 9): ${gDNA_processed.source}`
                        record.report.addFieldError(fullPath, msg)
                        // record.report.addTopLevelError(msg)
                        gDNA_processed.state = 'ERROR'
                        break
                    }
                }
            }
        }

        if(gDNA_processed.parsed == null) {
            let msg = `Could not parse loci from VariantValidator output for gDNA (Error Code 10): ${gDNA_processed.source}`
            record.report.addFieldError(fullPath, msg)
            // record.report.addTopLevelError(msg)
            gDNA_processed.state = 'ERROR'
        }
    }

} else {
    gDNA_processed.state = 'MISSING'
}

*/







async function main() {



    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    await imapSession.connect()
    console.log()


    const res = await database.find('GRID_variants')





    for(let variant of res.data) {

        // console.log(variant)

        console.log(variant.GRCh37.gDNA)


        let vv_GRCh37 = await vvQuery('GRCh37',variant.GRCh37.gDNA,'mane_select')

        console.log(Object.getOwnPropertyNames(vv_GRCh37))


        mit dem teil von processing.js

        














        break
    }

    /*

        1. Genauso wie im Import die gDNA abfragen (aber welche?)
           beide?

        2. genau wie im import für alle transcripte die positionen holen
    
        3. mit der gespeicherten variante überprüfen

        4. wenn fehler, dann prüfen, ob die vertauschung vorliegt, wenn ja, zurücktauschen, prüfen und in db ersetzen

    */


    await database.disconnect()
    await imapSession.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()
















