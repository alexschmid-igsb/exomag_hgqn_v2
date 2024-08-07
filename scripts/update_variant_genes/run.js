const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')

const { parse } = require('csv-parse/sync')

const IntervalTree = require('@flatten-js/interval-tree').default

const FetchAPI = require('../FetchAPI')
const prettyBytes = require('pretty-bytes')

/*
const Readable = require('node:stream').Readable
const pipeline = require('node:stream/promises').pipeline
*/

const { Readable, promises: { pipeline }  } = require('node:stream')



function isNonEmptyString(val) {
    return val != null && lodash.isString(val) && val.length > 0
}


const chromosomes = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y' ]




/*
    Gene Stable ID  <=>  ensembl_gene_id

    HGNC ID  <=>  hgnc_id
    HGNC symbol  <=>  hgnc_symbol

    NCBI gene (formerly Entrezgene) ID  <=>  

    Gene name  <=>  external_gene_name
    Source of gene na me  <=>  external_gene_source
    Gene Synonym  <=>  external_synonym

    Chromosome/scaffold name  <=>  chromosome_name

    Gene start (bp)  <=>  start_position
    Gene end (bp) <=>  end_position
*/

const ensemblQuery = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Query>
<Query virtualSchemaName = "default" formatter = "TSV" header = "1" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" >
	<Dataset name = "hsapiens_gene_ensembl" interface = "default" >
		<Attribute name = "ensembl_gene_id" />
		<Attribute name = "hgnc_id" />
		<Attribute name = "hgnc_symbol" />
		<Attribute name = "external_gene_name" />        
		<Attribute name = "external_gene_source" />      
        <Attribute name = "external_synonym" />      
		<Attribute name = "entrezgene_id" />
		<Attribute name = "chromosome_name" />
		<Attribute name = "start_position" />
		<Attribute name = "end_position" />
    </Dataset>
</Query>
`

const ensemblURL = `http://www.ensembl.org/biomart/martservice?query=${ensemblQuery.replace(/(\r\n|\n|\r)/gm, '')}`





async function streamFromURLToFile(url, filename, showProgress = true) {

    const progressInterval = 300
    const progressBarSize = 40

    let response = await fetch(url)
    console.log(response)
    
    let inputStream = Readable.fromWeb(response.body)
    let outputStream = fs.createWriteStream(filename)

    if(showProgress === true) {
        console.log(`Writing contents from '${url}' to file '${filename}'`)

        let contentLength = lodash.isObject(response) && lodash.isObject(response.headers) && lodash.isFunction(response.headers.get) ? parseInt(response.headers.get('content-length')) : NaN
        // contentLength = NaN

        const writeProgress = (bytesRead) => {
            if(lodash.isInteger(contentLength)) {
                let percent = Math.round(100.0 * bytesRead / contentLength)
                let progressBar = '['
                let nPoints = Math.round(progressBarSize * (bytesRead/contentLength))
                for(let i=0; i<nPoints; i++) {
                    progressBar += '.'
                }
                for(let i=0; i<progressBarSize-nPoints; i++) {
                    progressBar += ' '
                }
                progressBar += ']'
                console.log(`${progressBar} | ${String(percent).padStart(2,' ')}% | ${prettyBytes(bytesRead)} (${prettyBytes(contentLength)}) written`)
            } else {
                console.log(prettyBytes(bytesRead) + ' written')
            }
        }

        let time = {
            current: Date.now(),
            last: 0
        }

        let bytesRead = 0
        inputStream.on('data', buffer => {
            time.current = Date.now()
            if(time.current - time.last > progressInterval) {
                writeProgress(bytesRead,contentLength)
                time.last = time.current
            }
            bytesRead += buffer.length
        })

        inputStream.on('end', () => {
            writeProgress(bytesRead,contentLength)
        })

    }

    await pipeline(inputStream, outputStream)
}





async function streamFromURLToString(url, filename, showProgress = true) {

    const progressInterval = 300
    const progressBarSize = 40

    let response = await fetch(url)
    
    let inputStream = Readable.fromWeb(response.body)

    if(showProgress === true) {

        let contentLength = lodash.isObject(response) && lodash.isObject(response.headers) && lodash.isFunction(response.headers.get) ? parseInt(response.headers.get('content-length')) : NaN
        // contentLength = NaN

        const writeProgress = (bytesRead) => {
            if(lodash.isInteger(contentLength)) {
                let percent = Math.round(100.0 * bytesRead / contentLength)
                let progressBar = '['
                let nPoints = Math.round(progressBarSize * (bytesRead/contentLength))
                for(let i=0; i<nPoints; i++) {
                    progressBar += '.'
                }
                for(let i=0; i<progressBarSize-nPoints; i++) {
                    progressBar += ' '
                }
                progressBar += ']'
                console.log(`${progressBar} | ${String(percent).padStart(2,' ')}% | ${prettyBytes(bytesRead)} (${prettyBytes(contentLength)}) received`)
            } else {
                console.log('   ' + prettyBytes(bytesRead) + ' received')
            }
        }

        let time = {
            current: Date.now(),
            last: 0
        }

        let bytesRead = 0
        inputStream.on('data', buffer => {
            time.current = Date.now()
            if(time.current - time.last > progressInterval) {
                writeProgress(bytesRead,contentLength)
                time.last = time.current
            }
            bytesRead += buffer.length
        })

        inputStream.on('end', () => {
            writeProgress(bytesRead,contentLength)
        })

    }

    return await new Response(inputStream).text()
}






async function importBiomartGenes() {

    // aus file laden
    // const filename = path.join(__dirname, 'biomart.txt')
    // const content = fs.readFileSync(filename, 'utf8')

    
    // direkt von biomart streamen
    console.log('1. Loading data from biomart')
    let content = await streamFromURLToString(ensemblURL)


    // tsv parsen
    let incomingEntries = parse(content, {
        columns: true,
        delimiter: '\t',
        trim: true,
        skip_empty_lines: true
    })


    
    // const idFields = ['Gene stable ID', 'HGNC ID', 'HGNC symbol', 'Gene name', 'Source of gene name', 'Chromosome/scaffold name', 'Gene start (bp)', 'Gene end (bp)' ]
    // const multiFields = ['Gene Synonym', 'NCBI gene (formerly Entrezgene) ID']

    // const compareByIdFields = (entry,incomingEntry,idFields) => {
    //     let equal = true
    //     for(let key of idFields) {
    //         let a = entry[key]
    //         let b = incomingEntry[key]
    //         equal &&= lodash.isEqual(a,b)
    //     }
    //     return equal
    // }

    // const buildMultiValue = (incomingEntry,multiFields) => {
    //     let result = ''
    //     let first = true
    //     for(let key of idFields) {
    //         if(first === true) {
    //             first = false
    //         } else {
    //             result += '__'
    //         }
    //         let value = incomingEntry[key] == null || lodash.isString(incomingEntry[key]) === false || incomingEntry[key].length <= 0 ? 'NULL' : incomingEntry[key]
    //         result += value
    //     }
    //     return result
    // }




    // check ob HGNC ID und HGNC symbol eins-zu-eins beziehung haben

    // let hgncIDs = new Map()
    // let hgncSymbols = new Map()

    // for(let incomingEntry of incomingEntries) {

    //     if(chromosomes.includes(incomingEntry['Chromosome/scaffold name'])) {

    //         let id = incomingEntry['HGNC ID']
    //         let symbol = incomingEntry['HGNC symbol']

    //         if(hgncIDs.has(id) === true) {
    //             if(hgncIDs.get(id) !== symbol) {
    //                 console.log()
    //                 console.log('FATAL ERROR:')
    //                 console.log("geparster eintrag")
    //                 console.log(entry)
    //                 console.log("neuer eintrag")
    //                 console.log(incomingEntry)
    //                 return 
    //             }
    //         } else {
    //             hgncIDs.set(incomingEntry['HGNC ID'],incomingEntry['HGNC symbol'])
    //         }

    //         if(hgncSymbols.has(symbol) === true) {
    //             if(hgncSymbols.get(symbol) !== id) {
    //                 console.log()
    //                 console.log('FATAL ERROR:')
    //                 console.log("geparster eintrag")
    //                 console.log(entry)
    //                 console.log("neuer eintrag")
    //                 console.log(incomingEntry)
    //                 return 
    //             }
    //         } else {
    //             hgncSymbols.set(incomingEntry['HGNC symbol'],incomingEntry['HGNC ID'])
    //         }
    //     }
    // }
    // console.log(hgncIDs)
    // console.log(hgncSymbols)
    // return


    // let sources = new Set()
    // for(let incomingEntry of incomingEntries) {
    //     if(chromosomes.includes(incomingEntry['Chromosome/scaffold name'])) {
    //         sources.add(incomingEntry['Source of gene name'])
    //     }
    // }
    // console.log(sources)
    // return


    let hasError = false
    let rootEntries = new Map()

    for(let incomingEntry of incomingEntries) {

        if(chromosomes.includes(incomingEntry['Chromosome/scaffold name'])) {

            // if(incomingEntry['Gene stable ID'] === 'ENSG00000230417') {
            //     console.log(incomingEntry)
            // }

            if(incomingEntry['Source of gene name'] === 'HGNC Symbol' && incomingEntry['HGNC symbol'] !== incomingEntry['Gene name']) {
                // Diese 5 einträge können verwirrend sein, da hier über HGNC ID und symbol etwas andere transprotiert wird, als
                // über external gene name und Source of gene name

                // Es sollte aber ausreichen, die HGNC ID und symbol zu interpretieren und die anderen zu ignorieren, da es für
                // das was über Gene name kommt auch nochmal ein Entry gibt, welches diese Werte in HGNC ID und symbol stehen hat

                // Wenn man nur Gene name interpretieren würde, dann fehlt hier die HGNC ID

                // console.log(incomingEntry)
                // return
            }


            // 1. position id erzeugen
            let pos = {
                chr: incomingEntry['Chromosome/scaffold name'],
                start: incomingEntry['Gene start (bp)'],
                end: incomingEntry['Gene end (bp)']
            }
            if(pos.chr == null || pos.start == null || pos.end == null) {
                console.log("WARNUNG: Chromosome, start oder end position ist nicht vorhanden. Der eintrag wird übersprungen.")
                console.log(pos)
                continue
            }
            let posId = pos.chr + '-' + pos.start + '-' + pos.end


            // 2. vorhandenes root entry für die position id holen
            let rootEntry = rootEntries.get(posId)


            // 3. Check für multiple Ensembl IDs bei gleicher Position
            if(rootEntry != null && incomingEntry['Gene stable ID'] !== rootEntry.orig['Gene stable ID']) {
                
                // Es gibt hier 21 Fälle
                // Root entries werden über die position identifiziert. Es kann Einträge mit der gleichen Position geben
                // und unterschieldichen Enseml ID

                // Beispiel

                // {
                //     'Gene stable ID': 'ENSG00000266328',
                //     'HGNC ID': 'HGNC:43525',
                //     'HGNC symbol': 'MIR4536-2',
                //     'Gene name': 'MIR4536-2',
                //     'Source of gene name': 'HGNC Symbol',
                //     'Gene Synonym': 'HSA-MIR-4536-2',
                //     'NCBI gene (formerly Entrezgene) ID': '100847061',
                //     'Chromosome/scaffold name': 'X',
                //     'Gene start (bp)': '55451495',
                //     'Gene end (bp)': '55451582'
                //   }
                //   {
                //     'Gene stable ID': 'ENSG00000283334',
                //     'HGNC ID': 'HGNC:41730',
                //     'HGNC symbol': 'MIR4536-1',
                //     'Gene name': 'MIR4536-1',
                //     'Source of gene name': 'HGNC Symbol',
                //     'Gene Synonym': 'HSA-MIR-4536',
                //     'NCBI gene (formerly Entrezgene) ID': '100616155',
                //     'Chromosome/scaffold name': 'X',
                //     'Gene start (bp)': '55451495',
                //     'Gene end (bp)': '55451582'
                //   }

                // Hier ist nur die Position gleich, alles andere nicht. Bei location hat ensembl hier "forward strand" und "reverse strand"
                // als Zusätze. Das heißt, es sind tatsächlich unterschiedliche Einträge, einmal vorwärts und einmal rückwärts.
                // https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=ENSG00000266328;r=X:55451495-55451582;t=ENST00000583537
                // https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=ENSG00000283334;r=X:55451495-55451582;t=ENST00000636519

                // In diesem Fall ist es richtig, das ganze unter einem Root Entry (= Position) zu sammeln und zwei HGNC Children
                // anzulegen. Die Ensembl IDs gehen dann in das entsprechende child.

                // console.log("Single Position, Multiple Entries")
                // console.log(rootEntry.orig)
                // console.log(incomingEntry)
            }



            // 4. incomingEntry abhängig vom type verarbeiten

            if( isNonEmptyString(incomingEntry['HGNC ID']) && isNonEmptyString(incomingEntry['HGNC symbol']) ) {

                // HGNC ID and HGNC symbol vorhanden

                const hgnc = {
                    id: incomingEntry['HGNC ID'],
                    symbol: incomingEntry['HGNC symbol']
                }

                if(rootEntry == null) {

                    // neues root muss erzeugt werden
                    rootEntry = {
                        id: posId,
                        pos: pos,
                        orig: incomingEntry,
                        children: new Map([
                            [
                                hgnc.id,
                                {
                                    type: 'HGNC',
                                    hgnc: hgnc,
                                    synonyms: [],
                                    ncbi: [],
                                    ensembl: []
                                }
                            ]
                        ])
                    }
                    rootEntries.set(posId, rootEntry)
                }


                // im (vorhanden oder gerade eben erstellten) root entry nach dem entsprechenden HGNC child suchen
                let child = rootEntry.children.get(hgnc.id)

                // child anlegen wenn nicht vorhanden
                if(child == null) {
                    child = {
                        type: 'HGNC',
                        hgnc: hgnc,
                        synonyms: [],
                        ncbi: [],
                        ensembl: []
                    }
                    rootEntry.children.set(hgnc.id, child)
                }
                
                // restlichen Felder verarbeiten
                let synonym = incomingEntry['Gene Synonym']
                let ensembl = incomingEntry['Gene stable ID']
                let ncbi = incomingEntry['NCBI gene (formerly Entrezgene) ID']

                if(isNonEmptyString(synonym) && child.synonyms.includes(synonym) === false) child.synonyms.push(synonym)
                if(isNonEmptyString(ensembl) && child.ensembl.includes(ensembl) === false) child.ensembl.push(ensembl)
                if(isNonEmptyString(ncbi) && child.ncbi.includes(ncbi) === false) child.ncbi.push(ncbi)

                // das hier dient einem späteren test, ob für alle möglichen kombinationen ein entry vorhanden ist.
                // nur dann kann man sicher davon ausgehen, dass die werte unabhängig voneinander abgelegt werden können.
                if(child.test == null) child.test = []
                let bla = ensembl + ' __ ' + ncbi + ' __ ' + synonym
                if(child.test.includes(bla) === false) {
                    child.test.push(bla)
                }


            } else if(isNonEmptyString(incomingEntry['Gene name'])) {

                // den external gene name nur dann anschauen, wenn es keine HGNC ID und/oder HGNC symbol gegeben hat

                if(incomingEntry['Source of gene name'] === 'HGNC Symbol') {

                    // Dieser Fall tritt momentan nicht ein
                    console.log("UNKLAR")
                    console.log(incomingEntry)
                    hasError = true
                    return

                } else if(incomingEntry['Source of gene name'] === 'NCBI gene (formerly Entrezgene)') {
                    // vorerst ignorieren
                    // hier könnte man später einen weitern child type 'NCBI' definieren
                    continue
                } else if(incomingEntry['Source of gene name'] === 'RFAM') {
                    // ebenso hier
                    continue
                } else if(incomingEntry['Source of gene name'] === 'miRBase') {
                    // und hier auch
                    continue
                } else {
                    // gene Name ohne source of gene name tritt momentan nicht auf
                    console.log("UNKLAR")
                    console.log(incomingEntry)
                    hasError = true
                    return
                }
                id
            } else {
                // hier kommen entries an, die kein HGNC oder anderweitigen gene name haben, sondern ausschließlich
                // Ensembl und NCBI ID mit der gegebenen Position verknüpfen
                // Hier kann man später eventuell einen weiteren child type definieren

                // console.log(incomingEntry)
                // hasError = true

                // ignore
                continue
            }

        }

    }



    if(hasError === true) {
        console.log("ERROR: Verarbeitung abgebrochen")
        return
    }



    // output and/or error check
    for(let [key,value] of rootEntries.entries()) {

        let out = ''
        let print = false

        // if(value.children.size > 0) {
        if(true) {

            out += '\n'
            out += value['id'] + '\n'

            for(let child of value.children.values()) {
                out += "     " + child.hgnc.id + " " + child.hgnc.symbol + '\n'


                for(let bla of child.test) {
                    out += "          " + bla + '\n'
                }
                out += "          " + child.test.length + '\n'

                out += '\n'

                for(let ensembl of child.ensembl) {
                    out += "          e " + ensembl + '\n'
                }
                out += "            count " + child.ensembl.length + '\n\n'

                for(let ncbi of child.ncbi) {
                    out += "          n " + ncbi + '\n'
                }
                out += "            count " + child.ncbi.length + '\n\n'

                for(let synonym of child.synonyms) {
                    out += "          s " + synonym + '\n'
                }
                out += "            count " + child.synonyms.length + '\n\n'


                // if(child.ncbi.length <= 0 && child.synonyms.length > 0) {
                //     print = true
                // }

                // if(child.ncbi.length <= 0 && child.synonyms.length <= 0) {
                //     print = true
                // }

                // if(child.ncbi.length > 2 && child.synonyms.length > 2) {
                //     print = true
                // }

                // if(child.ensembl.length > 1) {
                //     print = true
                // }


                // check
                for(let ensembl of child.ensembl.length > 0 ? child.ensembl : ['']) {
                    for(let ncbi of child.ncbi.length > 0 ? child.ncbi : ['']) {
                        for(let synonym of child.synonyms.length > 0 ? child.synonyms : ['']) {
                            let bla = ensembl + ' __ ' + ncbi + ' __ ' + synonym
                            out += "          check " + bla + '\n'

                            if(child.test.includes(bla) === false) {
                                print = true
                                out += "          ERROR"
                                hasError = true
                            } else {

                            }
                        }
                    }
                }
            }
        }

        if(print) {
            console.log(out)
        }
    }

    if(hasError === true) {
        console.log("ERROR: Verarbeitung abgebrochen")
        return
    }




    // entries für die datenbank erstellen

    let dbEntries = new Map()

    for(let [posId,entry] of rootEntries.entries()) {

        for(let [key,child] of entry.children.entries()) {

            if(child.type === 'HGNC') {

                if(child.hgnc == null || isNonEmptyString(child.hgnc.id) === false || /^HGNC:\d{1,5}$/.test(child.hgnc.id) === false || isNonEmptyString(child.hgnc.symbol) === false) {
                    console.log("ERROR: Wrong or missing HGNC ID or Symbol")
                    console.dir(entry,{ depth: null })
                    return
                }

                let dbEntry = dbEntries.get(child.hgnc.id)

                if(dbEntry == null) {
                    dbEntry = {
                        _id: child.hgnc.id,
                        type: child.type,
                        hgnc: child.hgnc,
                        occurrences: new Map()
                    }
                    dbEntries.set(child.hgnc.id, dbEntry)
                } else {
                    // wenn es schon ein entry gibt für die HGNC ID
                    // console.log(child.hgnc.id)
                }

                if(dbEntry.occurrences.has(posId)) {
                    // FEHLER
                    console.log(`ERROR: Positon ID duplicate`)
                    console.dir(child,{ depth: null })
                    console.dir(dbEntry,{ depth: null })
                    return
                }

                dbEntry.occurrences.set(posId, {
                    pos: entry.pos,
                    synonyms: child.synonyms,
                    ncbi: child.ncbi,
                    ensembl: child.ensembl
                })

            } else {

                // TODO sobald weiter entry types importiert werden sollen

            }
        }
    }


    // bestimmtes entry anzeigen
    // console.dir( dbEntries.get('HGNC:7083'), { depth: null } )


    // Die maps in arrays umbauen
    dbEntries = Array.from(dbEntries.values())
    for(let dbEntry of dbEntries) {
        dbEntry.occurrences = Array.from(dbEntry.occurrences.values())
    }


    // collection leeren und entries hochladen
    console.log(`\nWriting ${dbEntries.length} gene entries to database...`)
    await database.deleteAll('GRID_genes')
    let result = await database.insertMany('GRID_genes', dbEntries)
    if(result.insertedCount !== dbEntries.length) {
        console.log("ERROR: count not insert all entries into database")
        console.log(result)
        return
    } else {
        console.log('DONE')
    }
}
















/*

class GeneDatabase {

    constructor(inputFile) {

        const filename = path.join(__dirname, inputFile)
        const content = fs.readFileSync(filename, 'utf8')

        let geneEntries = parse(content, {
            columns: true,
            delimiter: '\t',
            trim: true,
            skip_empty_lines: true
        })

        let intervalTrees = new Map()

        for(let geneEntry of geneEntries) {
            let chromosome = geneEntry['Chromosome/scaffold name']
            if(chromosomes.includes(chromosome)) {
                let intervalTree = intervalTrees.get(chromosome)
                if(intervalTree == null) {
                    intervalTree = new IntervalTree()
                    intervalTrees.set(chromosome, intervalTree)
                }
                let geneInterval = [ parseInt(geneEntry['Gene start (bp)']), parseInt(geneEntry['Gene end (bp)']) ]
                intervalTree.insert(geneInterval, geneEntry)
            }
        }

        this.geneEntries = geneEntries
        this.intervalTrees = intervalTrees
    }

    find(chromosome, pos) {
        let result = []
        if(lodash.isString(chromosome) && chromosomes.includes(chromosome)) {
            const intervalTree = this.intervalTrees.get(chromosome)
            let interval = [0,0]
            if(lodash.isArray(pos) === true && pos.length === 2 && lodash.isInteger(pos[0]) === true && lodash.isInteger(pos[1]) === true) {
                result = intervalTree.search(pos)
            } else if(lodash.isInteger(pos) === true) {
                result = intervalTree.search([pos,pos])
            }
        }
        return result
    }

}

*/






class GenesByPosition {

    constructor(genesFromDB) {

        let trees = new Map()

        for(const geneFromDB of genesFromDB) {

            // console.log(geneFromDB._id)

            for(const occurrence of geneFromDB.occurrences) {

                const chr = occurrence.pos.chr
                const interval = [ parseInt(occurrence.pos.start), parseInt(occurrence.pos.end) ]
                
                // console.log('   ' + chr + ' ' + interval)

                let tree = trees.get(chr)
                if(tree == null) {
                    tree = new IntervalTree()
                    trees.set(chr, tree)
                }

                tree.insert(interval, geneFromDB)
            }
        }

        this.trees = trees
    }

    find(chr, pos) {
        let result = []
        if(lodash.isString(chr) && chromosomes.includes(chr)) {
            const tree = this.trees.get(chr)
            let interval = [0,0]
            if(lodash.isArray(pos) === true && pos.length === 2 && lodash.isInteger(pos[0]) === true && lodash.isInteger(pos[1]) === true) {
                result = tree.search(pos)
            } else if(lodash.isInteger(pos) === true) {
                result = tree.search([pos,pos])
            }
        }
        return result
    }
}




async function updateVariantGenes() {


    // load genes from database
    const genesResult = await database.find('GRID_genes')

    // build interval search trees
    const genesByPosition = new GenesByPosition(genesResult.data)



    let all = 0
    let count = 0
    for(let gene of genesResult.data) {
        if(gene.occurrences.length > 1) {
            console.log()
            console.dir(gene, { depth: null })
            count++
        }
        all++
    }
    console.log()
    console.log(count)
    console.log(all)
    return 


    // load variants from database
    const variantsResult = await database.find('GRID_variants')
    for(let [i, variant] of variantsResult.data.entries()) {

        // console.log(variant)

        let found = genesByPosition.find(variant.GRCh38.chr, variant.GRCh38.pos)

        if(found.length > 1) {
            // console.log(variant.GRCh38)
            // console.log(variant.GRCh38.gDNA)
            // console.dir(found, {depth : null})
        }

        

        /*
            TODO:
            1. delins usw versuchen zu erkennen
                - Zählen, wie viele solcher varianten es eigentlich sind, im vergleich zu allen
                - am besten über regexp auf der normierten gDNA
                - und zusätzlich über die length von alt/ref rückversichern
                - dann irgendwie ein intervall daraus berechnen


            2. PRÜFEN
                - für jede variant und alle ihrerr gefundenne genes :
                    * liegt sie in mind. einem intervall des gene entries (wenn nein, dann ist das ein falsche gefundenes gene)
                    * Alle anderen genes durchgehen und manuell sichergehen, dass die variant pos in KEINEM der gene intervalls liegt

        */

    }



}





// INSTANCE_CONFIG_PATH=./config/hgqn PROFILE=development_default node scripts/update_variant_genes/run.js UPDATE_VARIANT_GENES






async function main() {

    // commands
    let commands = new Map(
        [
            [ 'IMPORT_BIOMART_GENES', { target: importBiomartGenes }],
            [ 'UPDATE_VARIANT_GENES', { target: updateVariantGenes }],
        ]
    )

    // check params
    const argv = require('minimist')(process.argv.slice(2))
    const command = argv._[0]

    // get target function
    let target = commands.get(command) != null && lodash.isFunction(commands.get(command).target) ? commands.get(command).target : null
    if(target == null) {
        console.log(`ERROR: unknown command '${command}'`)
        return
    }

    // init database
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    console.log()

    // call target function
    await target()

    // disconnect
    await database.disconnect()
}




(async function () {
    await main()
    process.exit(0)
})()













/*

class GeneDatabase {

    constructor(inputFile) {

        const filename = path.join(__dirname, inputFile)
        const content = fs.readFileSync(filename, 'utf8')

        let geneEntries = parse(content, {
            columns: true,
            delimiter: '\t',
            trim: true,
            skip_empty_lines: true
        })

        let intervalTrees = new Map()

        for(let geneEntry of geneEntries) {
            let chromosome = geneEntry['Chromosome/scaffold name']
            if(chromosomes.includes(chromosome)) {
                let intervalTree = intervalTrees.get(chromosome)
                if(intervalTree == null) {
                    intervalTree = new IntervalTree()
                    intervalTrees.set(chromosome, intervalTree)
                }
                let geneInterval = [ parseInt(geneEntry['Gene start (bp)']), parseInt(geneEntry['Gene end (bp)']) ]
                intervalTree.insert(geneInterval, geneEntry)
            }
        }

        this.geneEntries = geneEntries
        this.intervalTrees = intervalTrees
    }

    find(chromosome, pos) {
        let result = []
        if(lodash.isString(chromosome) && chromosomes.includes(chromosome)) {
            const intervalTree = this.intervalTrees.get(chromosome)
            let interval = [0,0]
            if(lodash.isArray(pos) === true && pos.length === 2 && lodash.isInteger(pos[0]) === true && lodash.isInteger(pos[1]) === true) {
                result = intervalTree.search(pos)
            } else if(lodash.isInteger(pos) === true) {
                result = intervalTree.search([pos,pos])
            }
        }
        return result
    }

}

*/



    // collection laden, suchbäume aufbauen, varianten laden, entries suchen und gene entry ids speichern
    // (gibt es eine sortierung der häufigkeiten die man verwenden könnte, um die genes pro variant zu ranken)



    /*

    let genes = new GeneDatabase('biomart_gene_list.tsv')

    const res = await database.find('GRID_variants')

    for(let [i, variant] of res.data.entries()) {
        // console.log(variant.GRCh38)
        console.log(variant.GRCh38.gDNA)
        console.log(genes.find(variant.GRCh38.chr, variant.GRCh38.pos))

        // 1. WIE ERKENNE ICH ins del delins usw zuverlässig
        // 2. WIE BERECHNE ICH DAS INTERVALL DAFÜR?

    }

    */



    /*
    let tree = new IntervalTree()

    let intervals = [[6,8],[1,4],[5,12],[1,1],[5,7]]

    // Insert interval as a key and string "val0", "val1" etc. as a value 
    for (let i=0; i < intervals.length; i++) {
        tree.insert(intervals[i],"val"+i);
    }

    // Get array of keys sorted in ascendant order
    let sorted_intervals = tree.keys;              //  expected array [[1,1],[1,4],[5,7],[5,12],[6,8]]

    // Search items which keys intersect with given interval, and return array of values
    let values_in_range = tree.search([2,3]);     //  expected array ['val1']

    console.log(values_in_range)
    */


