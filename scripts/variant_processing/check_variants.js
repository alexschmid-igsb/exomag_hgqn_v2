const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const Mailer = require('../../backend/util/mail/SMTPMailer')

const IMAPClient = require('../../backend/util/mail/IMAPClient')
const imapSession = IMAPClient.createSession()

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')


const FetchAPI = require('../FetchAPI')




async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}



const parseInteger = any => {
    if(lodash.isString(any)) {
        if(/^[-+]?\d+$/.test(any) === true) {
            return parseInt(any)
        }
    } else {
        if(Number.isInteger(any) === true) {
            return any
        }
    }
    return null
}




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





async function executeQuery(build,inputString,transcript = 'mane_select') {

    let result = {
        vvResponse: null,
        error: {
            state: 'VALID'
        },
        parsedLoci: null
    }

    let caught = null
    try {
        result.vvResponse = await vvQuery(build,inputString,transcript)
    } catch(err) {
        caught = err
    }

    if(caught != null || result.vvResponse == null) {

        result.error = {
            state: 'ERROR',
            message: `Unexpected error during VariantValidator query (Error Code 7). Input was ('${build}', '${inputString}', '${transcript}').`,
        }

        if(caught != null) {
            result.error.cause = {
                status: caught.status || 500,
                name: caught.name,
                message: caught.message,
                stackTrace: await StackTrace.fromError(caught)
            }
        } else {
            result.error.cause = {
                message: "vvQuery returned null",
            }
        }

    }

    if(result.vvResponse != null && result.vvResponse.flag !== 'gene_variant') {
        result.error = {
            state: 'ERROR',
            message: `VariantValidator returned error (Error Code 8): ${inputString}`
        }
    }
    
    if(result.vvResponse != null && result.error.state !== 'ERROR') {
        for(let [vvKey,vvEntry] of Object.entries(result.vvResponse)) {
            if(vvEntry.primary_assembly_loci != null) {
                let parsed = parse_primary_assembly_loci(vvEntry.primary_assembly_loci)
                if(result.parsedLoci == null) {
                    if(parsed.hasError === true) {
                        // es gibt noch kein geparstes, aber das eben geparste ist fehlerhaft
                        // diesen fall einfach ignorieren, in der hoffnung, dass die nächsten entries korrekt geparst werden
                        // ein fehler wird in jedem fall generiert, wenn nach dem for loop kein parsedLoci vorhanden ist
                    } else {
                        result.parsedLoci = parsed
                    }
                } else {
                    // es gibt breits ein geparsten loci. der soeben geparset muss identisch sein, alles andere ist als fehler zu werten
                    let isEqual = lodash.isEqual(parsed, result.parsedLoci)
                    if(isEqual === false) {
                        result.error = {
                            state: 'ERROR',
                            message: `VariantValidator returned ambiguous results (Error Code 9): ${inputString}`
                        }
                        break
                    }
                }
            }
        }

        if(result.parsedLoci == null) {
            result.error = {
                state: 'ERROR',
                message: `Could not parse loci from VariantValidator output (Error Code 10): ${inputString}`
            }
        }
    }
    
    return result

}





function compareItem(itemA,itemB) {
    return true &&
        itemA._id          != null && itemB._id          != null && itemA._id          === itemB._id &&
        itemA.GRCh37.gDNA  != null && itemB.GRCh37.gDNA  != null && itemA.GRCh37.gDNA  === itemB.GRCh37.gDNA &&
        itemA.GRCh37.build != null && itemB.GRCh37.build != null && itemA.GRCh37.build === itemB.GRCh37.build &&
        itemA.GRCh37.chr   != null && itemB.GRCh37.chr   != null && itemA.GRCh37.chr   === itemB.GRCh37.chr &&
        itemA.GRCh37.pos   != null && itemB.GRCh37.pos   != null && itemA.GRCh37.pos   === itemB.GRCh37.pos &&
        itemA.GRCh37.ref   != null && itemB.GRCh37.ref   != null && itemA.GRCh37.ref   === itemB.GRCh37.ref &&
        itemA.GRCh37.alt   != null && itemB.GRCh37.alt   != null && itemA.GRCh37.alt   === itemB.GRCh37.alt &&
        itemA.GRCh38.gDNA  != null && itemB.GRCh38.gDNA  != null && itemA.GRCh38.gDNA  === itemB.GRCh38.gDNA &&
        itemA.GRCh38.build != null && itemB.GRCh38.build != null && itemA.GRCh38.build === itemB.GRCh38.build &&
        itemA.GRCh38.chr   != null && itemB.GRCh38.chr   != null && itemA.GRCh38.chr   === itemB.GRCh38.chr &&
        itemA.GRCh38.pos   != null && itemB.GRCh38.pos   != null && itemA.GRCh38.pos   === itemB.GRCh38.pos &&
        itemA.GRCh38.ref   != null && itemB.GRCh38.ref   != null && itemA.GRCh38.ref   === itemB.GRCh38.ref &&
        itemA.GRCh38.alt   != null && itemB.GRCh38.alt   != null && itemA.GRCh38.alt   === itemB.GRCh38.alt
}






function checkVertauschungBeiHGQNImport(vvGRCh37,vvGRCh38,dbVariant) {

    return true &&

        vvGRCh37._id          != null && vvGRCh38._id          != null && vvGRCh37._id          === vvGRCh38._id &&
        vvGRCh37.GRCh37.gDNA  != null && vvGRCh38.GRCh37.gDNA  != null && vvGRCh37.GRCh37.gDNA  === vvGRCh38.GRCh37.gDNA &&
        vvGRCh37.GRCh37.build != null && vvGRCh38.GRCh37.build != null && vvGRCh37.GRCh37.build === vvGRCh38.GRCh37.build &&
        vvGRCh37.GRCh37.chr   != null && vvGRCh38.GRCh37.chr   != null && vvGRCh37.GRCh37.chr   === vvGRCh38.GRCh37.chr &&
        vvGRCh37.GRCh37.pos   != null && vvGRCh38.GRCh37.pos   != null && vvGRCh37.GRCh37.pos   === vvGRCh38.GRCh37.pos &&
        vvGRCh37.GRCh37.ref   != null && vvGRCh38.GRCh37.ref   != null && vvGRCh37.GRCh37.ref   === vvGRCh38.GRCh37.ref &&
        vvGRCh37.GRCh37.alt   != null && vvGRCh38.GRCh37.alt   != null && vvGRCh37.GRCh37.alt   === vvGRCh38.GRCh37.alt &&
        vvGRCh37.GRCh38.gDNA  != null && vvGRCh38.GRCh38.gDNA  != null && vvGRCh37.GRCh38.gDNA  === vvGRCh38.GRCh38.gDNA &&
        vvGRCh37.GRCh38.build != null && vvGRCh38.GRCh38.build != null && vvGRCh37.GRCh38.build === vvGRCh38.GRCh38.build &&
        vvGRCh37.GRCh38.chr   != null && vvGRCh38.GRCh38.chr   != null && vvGRCh37.GRCh38.chr   === vvGRCh38.GRCh38.chr &&
        vvGRCh37.GRCh38.pos   != null && vvGRCh38.GRCh38.pos   != null && vvGRCh37.GRCh38.pos   === vvGRCh38.GRCh38.pos &&
        vvGRCh37.GRCh38.ref   != null && vvGRCh38.GRCh38.ref   != null && vvGRCh37.GRCh38.ref   === vvGRCh38.GRCh38.ref &&
        vvGRCh37.GRCh38.alt   != null && vvGRCh38.GRCh38.alt   != null && vvGRCh37.GRCh38.alt   === vvGRCh38.GRCh38.alt &&

        vvGRCh37._id          != null && dbVariant._id          != null && vvGRCh37._id          === dbVariant._id &&
        vvGRCh37.GRCh37.gDNA  != null && dbVariant.GRCh38.gDNA  != null && vvGRCh37.GRCh37.gDNA  === dbVariant.GRCh38.gDNA &&       // vertauschung
        vvGRCh37.GRCh37.build != null && dbVariant.GRCh37.build != null && vvGRCh37.GRCh37.build === dbVariant.GRCh37.build &&
        vvGRCh37.GRCh37.chr   != null && dbVariant.GRCh37.chr   != null && vvGRCh37.GRCh37.chr   === dbVariant.GRCh37.chr &&
        vvGRCh37.GRCh37.pos   != null && dbVariant.GRCh37.pos   != null && vvGRCh37.GRCh37.pos   === dbVariant.GRCh37.pos &&
        vvGRCh37.GRCh37.ref   != null && dbVariant.GRCh37.ref   != null && vvGRCh37.GRCh37.ref   === dbVariant.GRCh37.ref &&
        vvGRCh37.GRCh37.alt   != null && dbVariant.GRCh37.alt   != null && vvGRCh37.GRCh37.alt   === dbVariant.GRCh37.alt &&
        vvGRCh37.GRCh38.gDNA  != null && dbVariant.GRCh37.gDNA  != null && vvGRCh37.GRCh38.gDNA  === dbVariant.GRCh37.gDNA &&       // vertauschung
        vvGRCh37.GRCh38.build != null && dbVariant.GRCh38.build != null && vvGRCh37.GRCh38.build === dbVariant.GRCh38.build &&
        vvGRCh37.GRCh38.chr   != null && dbVariant.GRCh38.chr   != null && vvGRCh37.GRCh38.chr   === dbVariant.GRCh38.chr &&
        vvGRCh37.GRCh38.pos   != null && dbVariant.GRCh38.pos   != null && vvGRCh37.GRCh38.pos   === dbVariant.GRCh38.pos &&
        vvGRCh37.GRCh38.ref   != null && dbVariant.GRCh38.ref   != null && vvGRCh37.GRCh38.ref   === dbVariant.GRCh38.ref &&
        vvGRCh37.GRCh38.alt   != null && dbVariant.GRCh38.alt   != null && vvGRCh37.GRCh38.alt   === dbVariant.GRCh38.alt &&

        vvGRCh38._id          != null && dbVariant._id          != null && vvGRCh38._id          === dbVariant._id &&
        vvGRCh38.GRCh37.gDNA  != null && dbVariant.GRCh38.gDNA  != null && vvGRCh38.GRCh37.gDNA  === dbVariant.GRCh38.gDNA &&       // vertauschung
        vvGRCh38.GRCh37.build != null && dbVariant.GRCh37.build != null && vvGRCh38.GRCh37.build === dbVariant.GRCh37.build &&
        vvGRCh38.GRCh37.chr   != null && dbVariant.GRCh37.chr   != null && vvGRCh38.GRCh37.chr   === dbVariant.GRCh37.chr &&
        vvGRCh38.GRCh37.pos   != null && dbVariant.GRCh37.pos   != null && vvGRCh38.GRCh37.pos   === dbVariant.GRCh37.pos &&
        vvGRCh38.GRCh37.ref   != null && dbVariant.GRCh37.ref   != null && vvGRCh38.GRCh37.ref   === dbVariant.GRCh37.ref &&
        vvGRCh38.GRCh37.alt   != null && dbVariant.GRCh37.alt   != null && vvGRCh38.GRCh37.alt   === dbVariant.GRCh37.alt &&
        vvGRCh38.GRCh38.gDNA  != null && dbVariant.GRCh37.gDNA  != null && vvGRCh38.GRCh38.gDNA  === dbVariant.GRCh37.gDNA &&       // vertauschung
        vvGRCh38.GRCh38.build != null && dbVariant.GRCh38.build != null && vvGRCh38.GRCh38.build === dbVariant.GRCh38.build &&
        vvGRCh38.GRCh38.chr   != null && dbVariant.GRCh38.chr   != null && vvGRCh38.GRCh38.chr   === dbVariant.GRCh38.chr &&
        vvGRCh38.GRCh38.pos   != null && dbVariant.GRCh38.pos   != null && vvGRCh38.GRCh38.pos   === dbVariant.GRCh38.pos &&
        vvGRCh38.GRCh38.ref   != null && dbVariant.GRCh38.ref   != null && vvGRCh38.GRCh38.ref   === dbVariant.GRCh38.ref &&
        vvGRCh38.GRCh38.alt   != null && dbVariant.GRCh38.alt   != null && vvGRCh38.GRCh38.alt   === dbVariant.GRCh38.alt
}





function generateOutput(inset,labelA,labelB,labelC,itemA,itemB,itemC) {
    let paths = [
        '_id',
        'GRCh37.gDNA',
        'GRCh37.build',
        'GRCh37.chr',
        'GRCh37.pos',
        'GRCh37.ref',
        'GRCh37.alt',
        'GRCh38.gDNA',
        'GRCh38.build',
        'GRCh38.chr',
        'GRCh38.pos',
        'GRCh38.ref',
        'GRCh38.alt'
    ]
    let out = ''
    for(let path of paths) {
        out += inset + path + '\n'
        out += inset + inset + labelA + ': ' + lodash.get(itemA,path) + '\n'
        out += inset + inset + labelB + ': ' + lodash.get(itemB,path) + '\n'
        out += inset + inset + labelC + ': ' + lodash.get(itemC,path) + '\n'
        // out += inset + inset + labelA + '.' + path + ': ' + lodash.get(itemA,path) + '\n'
        // out += inset + inset + labelB + '.' + path + ': ' + lodash.get(itemB,path) + '\n'
        // out += inset + inset + labelC + '.' + path + ': ' + lodash.get(itemC,path) + '\n'
    }
    return out
}




async function main() {


    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    await imapSession.connect()
    console.log()


    const res = await database.find('GRID_variants')


    for(let [i,dbVariant] of res.data.entries()) {

        let out = 'VARIANT ' + (i+1) + '/' + res.data.length

        let hasErrors = false

        // execute vv queries
        let result_GRCh37 = await executeQuery('GRCh37',dbVariant.GRCh37.gDNA,'mane_select')
        await sleep(500)
        let result_GRCh38 = await executeQuery('GRCh38',dbVariant.GRCh38.gDNA,'mane_select')
        await sleep(500)

        // check errors
        if(result_GRCh37.error.state !== 'VALID') {
            out += '\n'
            out += '     ERROR\n'
            out += '     GRCh37 VariantValidator Response\n'
            out += `     ${result_GRCh37.error.message}\n`
            hasErrors = true
        }
        if(result_GRCh38.error.state !== 'VALID') {
            out += '\n'
            out += '     ERROR\n'
            out += '     GRCh38 VariantValidator Response\n'
            out += `     ${result_GRCh38.error.message}\n`
            hasErrors = true
        }

        // check ids
        if(hasErrors === false) {

            if(result_GRCh37.parsedLoci.variant._id !== result_GRCh38.parsedLoci.variant._id ||
               result_GRCh37.parsedLoci.variant._id !== dbVariant._id ||
               result_GRCh38.parsedLoci.variant._id !== dbVariant._id)
            {
                out += '\n'
                out += '     ERROR\n'
                out += '     ID Inconsistency\n'
                out += `     GRCh37.parsedLoci._id = ${result_GRCh37.parsedLoci.variant._id}\n`
                out += `     GRCh38.parsedLoci._id = ${result_GRCh38.parsedLoci.variant._id}\n`
                out += `     db.variant.id =         ${dbVariant._id}\n`
                hasErrors = true
            }
        }

        // compare parsed variant(s)
        if( compareItem(result_GRCh37.parsedLoci.variant, result_GRCh38.parsedLoci.variant) === false ||
            compareItem(result_GRCh37.parsedLoci.variant, dbVariant) === false ||
            compareItem(result_GRCh38.parsedLoci.variant, dbVariant) === false )
        {
            out += '\n'
            out += '     ERROR\n'
            out += '     Variant Inconsistency\n'
            out += generateOutput('     ', 'vvGRCh37 ', 'vvGRCh38 ', 'dbVariant', result_GRCh37.parsedLoci.variant, result_GRCh37.parsedLoci.variant, dbVariant)
            hasErrors = true
        }

        // prüfen ob die vertauschung vom import der alten HGQN behoben werden muss
        if(checkVertauschungBeiHGQNImport(result_GRCh37.parsedLoci.variant,result_GRCh38.parsedLoci.variant,dbVariant) === true) {
            hasErrors = true

            out += '\n'
            out += '     VERTAUSCHUNG GEFUNDEN\n'

            let tausch = dbVariant.GRCh38.gDNA
            dbVariant.GRCh38.gDNA = dbVariant.GRCh37.gDNA
            dbVariant.GRCh37.gDNA = tausch

            let updated = true
            try {
                await database.findOneAndUpdate('GRID_variants', { filter: { _id: dbVariant._id } }, dbVariant)
            } catch(err) {
                out += '     FEHLER BEIM UPDATEN DER VARIANTE IN DER DATENBANK\n'
                out += '     ' + err.message
                updated = false
            }

            if(updated === true) {
                out += '     VARIANTE KORRIGIERT\n'
            }
        }

        if(hasErrors === false) {
            out += ': OK'
        } else {
            out += '\n'
        }

        console.log(out)

        if(i>10) break
    }

    
    await database.disconnect()
    await imapSession.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()
















