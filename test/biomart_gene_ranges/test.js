const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')

const { parse } = require('csv-parse/sync')

const IntervalTree = require('@flatten-js/interval-tree').default

const FetchAPI = require('../../scripts/FetchAPI')
const prettyBytes = require('pretty-bytes')








/*
const Readable = require('node:stream').Readable
const pipeline = require('node:stream/promises').pipeline
*/

const { Readable, promises: { pipeline }  } = require('node:stream')




/*

    peter:
    overlap statstik machen
    wie groß ist der bereich der eine abdeckung hat, overlaps werden nicht doppelt gezählt
    

*/










/*
    Abfrage



    Man baut am besten eine gene table, wo die nutzlast ein eigenes feld ist und type any
    dann kann man nämlich in zukunft alles mögliche updaten und da reinschieben
    und hat das direkt im frontend
    es reicht dann auch biomart...



<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Query>
<Query  virtualSchemaName = "default" formatter = "TSV" header = "0" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" >
			
	<Dataset name = "hsapiens_gene_ensembl" interface = "default" >
		<Attribute name = "ensembl_gene_id" />
		<Attribute name = "external_gene_name" />
		<Attribute name = "hgnc_id" />
		<Attribute name = "entrezgene_description" />
		<Attribute name = "description" />
		<Attribute name = "ensembl_peptide_id" />
		<Attribute name = "ensembl_peptide_id_version" />
		<Attribute name = "ensembl_transcript_id_version" />
		<Attribute name = "ensembl_transcript_id" />
		<Attribute name = "ensembl_gene_id_version" />
		<Attribute name = "chromosome_name" />
		<Attribute name = "start_position" />
		<Attribute name = "end_position" />
		<Attribute name = "transcript_mane_select" />
		<Attribute name = "transcript_mane_plus_clinical" />
		<Attribute name = "external_gene_source" />
		<Attribute name = "external_transcript_name" />
		<Attribute name = "external_transcript_source_name" />
		<Attribute name = "transcript_biotype" />
		<Attribute name = "gene_biotype" />
		<Attribute name = "ensembl_exon_id" />
		<Attribute name = "external_synonym" />
		<Attribute name = "hgnc_symbol" />
	</Dataset>
</Query>


<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query><Query  virtualSchemaName = "default" formatter = "TSV" header = "0" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" ><Dataset name = "hsapiens_gene_ensembl" interface = "default" ><Attribute name = "ensembl_gene_id" /><Attribute name = "external_gene_name" /><Attribute name = "hgnc_id" /><Attribute name = "entrezgene_description" /><Attribute name = "description" /><Attribute name = "ensembl_peptide_id" /><Attribute name = "ensembl_peptide_id_version" /><Attribute name = "ensembl_transcript_id_version" /><Attribute name = "ensembl_transcript_id" /><Attribute name = "ensembl_gene_id_version" /><Attribute name = "chromosome_name" /><Attribute name = "start_position" /><Attribute name = "end_position" /><Attribute name = "transcript_mane_select" /><Attribute name = "transcript_mane_plus_clinical" /><Attribute name = "external_gene_source" /><Attribute name = "external_transcript_name" /><Attribute name = "external_transcript_source_name" /><Attribute name = "transcript_biotype" /><Attribute name = "gene_biotype" /><Attribute name = "ensembl_exon_id" /><Attribute name = "external_synonym" /><Attribute name = "hgnc_symbol" /></Dataset></Query>


http://www.ensembl.org/biomart/martservice?query=<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query><Query  virtualSchemaName = "default" formatter = "TSV" header = "0" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" ><Dataset name = "hsapiens_gene_ensembl" interface = "default" ><Attribute name = "ensembl_gene_id" /><Attribute name = "external_gene_name" /><Attribute name = "hgnc_id" /><Attribute name = "entrezgene_description" /><Attribute name = "description" /><Attribute name = "ensembl_peptide_id" /><Attribute name = "ensembl_peptide_id_version" /><Attribute name = "ensembl_transcript_id_version" /><Attribute name = "ensembl_transcript_id" /><Attribute name = "ensembl_gene_id_version" /><Attribute name = "chromosome_name" /><Attribute name = "start_position" /><Attribute name = "end_position" /><Attribute name = "transcript_mane_select" /><Attribute name = "transcript_mane_plus_clinical" /><Attribute name = "external_gene_source" /><Attribute name = "external_transcript_name" /><Attribute name = "external_transcript_source_name" /><Attribute name = "transcript_biotype" /><Attribute name = "gene_biotype" /><Attribute name = "ensembl_exon_id" /><Attribute name = "external_synonym" /><Attribute name = "hgnc_symbol" /></Dataset></Query>


wget -O out.txt 'http://www.ensembl.org/biomart/martservice?query=<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query><Query  virtualSchemaName = "default" formatter = "TSV" header = "0" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" ><Dataset name = "hsapiens_gene_ensembl" interface = "default" ><Attribute name = "ensembl_gene_id" /><Attribute name = "external_gene_name" /><Attribute name = "hgnc_id" /><Attribute name = "entrezgene_description" /><Attribute name = "description" /><Attribute name = "ensembl_peptide_id" /><Attribute name = "ensembl_peptide_id_version" /><Attribute name = "ensembl_transcript_id_version" /><Attribute name = "ensembl_transcript_id" /><Attribute name = "ensembl_gene_id_version" /><Attribute name = "chromosome_name" /><Attribute name = "start_position" /><Attribute name = "end_position" /><Attribute name = "transcript_mane_select" /><Attribute name = "transcript_mane_plus_clinical" /><Attribute name = "external_gene_source" /><Attribute name = "external_transcript_name" /><Attribute name = "external_transcript_source_name" /><Attribute name = "transcript_biotype" /><Attribute name = "gene_biotype" /><Attribute name = "ensembl_exon_id" /><Attribute name = "external_synonym" /><Attribute name = "hgnc_symbol" /></Dataset></Query>'




wget -O out.txt 'http://www.ensembl.org/biomart/martservice?query='
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Query>
<Query  virtualSchemaName = "default" formatter = "TSV" header = "0" uniqueRows = "0" count = "" datasetConfigVersion = "0.6" >
	<Dataset name = "hsapiens_gene_ensembl" interface = "default" >
		<Attribute name = "ensembl_gene_id" />
		<Attribute name = "hgnc_id" />
		<Attribute name = "chromosome_name" />
		<Attribute name = "start_position" />
		<Attribute name = "end_position" />
    </Dataset>
</Query>'


es scheint wohl sehr groß zu sein....


*/





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
    console.log(response)
    
    let inputStream = Readable.fromWeb(response.body)

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
                console.log(`${progressBar} | ${String(percent).padStart(2,' ')}% | ${prettyBytes(bytesRead)} (${prettyBytes(contentLength)}) received`)
            } else {
                console.log(prettyBytes(bytesRead) + ' received')
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














const chromosomes = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y' ]





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



















function isNonEmptyString(val) {
    return val != null && lodash.isString(val) && val.length > 0
}









async function main() {

    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    console.log()






    // get biomart
    // await streamFromURLToFile(ensemblURL, path.join(__dirname, 'temp.txt'))
    // return 


    // direkt laden
    // let content = await streamFromURLToString(ensemblURL)









    /*
        Es gibt für eine Entrez ID mehrere einträge mit unterschiedlichen NSBI (entrez) IDs
        Wenn man die nachschaut, dann sind das einträge für unchraterized genes (bzw locations)

        Entrez IDs sind gleich, obowhl ganz anderes chromosome und unterschiedliche symbols

        entrez duplicate
        {
        'Gene stable ID': 'ENSG00000273768',
        'HGNC ID': 'HGNC:54433',
        'HGNC symbol': 'RNVU1-29',
        'Gene name': 'RNVU1-29',
        'NCBI gene (formerly Entrezgene) ID': '124905573',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '146376807',
        'Gene end (bp)': '146376970'
        }
        {
        'Gene stable ID': 'ENSG00000207389',
        'HGNC ID': 'HGNC:10128',
        'HGNC symbol': 'RNU1-4',
        'Gene name': 'RNU1-4',
        'NCBI gene (formerly Entrezgene) ID': '124905573',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '16740516',
        'Gene end (bp)': '16740679'
        }




        ähnliches für gene name

        geneName duplicate
        {
        'Gene stable ID': 'ENSG00000293296',
        'HGNC ID': '',
        'HGNC symbol': '',
        'Gene name': 'PFN1P2',
        'NCBI gene (formerly Entrezgene) ID': '767846',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '120432204',
        'Gene end (bp)': '120434037'
        }
        {
        'Gene stable ID': 'ENSG00000270392',
        'HGNC ID': 'HGNC:24298',
        'HGNC symbol': 'PFN1P2',
        'Gene name': 'PFN1P2',
        'NCBI gene (formerly Entrezgene) ID': '',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '120433656',
        'Gene end (bp)': '120434052'
        }


        https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000293296;r=1:120432204-120434037;t=ENST00000604437
        https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000270392;r=1:120433656-120434052;t=ENST00000621347



        Eine möglichkeit wäre, einfach alles abzuspeichern und zwar als eintrag mit random datenbank id (uuid)
        Dann lädt man alle einträge, baut die suchbäume aus den koordinten und bekommt dann für eine
        koordinate einfach ALLE eintäge und muss dann reagieren

        source of gene name
        und source (gene) sollte man sich auch mal anschauen

        Ich könnte auch einfach alles reinlinken (alle einträge), dann sollen die sich das anschauen und beurteilen



        geneName duplicate
        {
        'Gene stable ID': 'ENSG00000201944',
        'HGNC ID': '',
        'HGNC symbol': '',
        'Gene name': 'SNORA72',
        'NCBI gene (formerly Entrezgene) ID': '124900423',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '205731221',
        'Gene end (bp)': '205731352'
        }
        {
        'Gene stable ID': 'ENSG00000201898',
        'HGNC ID': '',
        'HGNC symbol': '',
        'Gene name': 'SNORA72',
        'NCBI gene (formerly Entrezgene) ID': '124900425',
        'Chromosome/scaffold name': '1',
        'Gene start (bp)': '224179641',
        'Gene end (bp)': '224179767'
        }

        https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000201944;r=1:205731221-205731352;t=ENST00000365074
        https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000201898;r=1:224179641-224179767;t=ENST00000365028










        genes in datenbank
            - scheme
            - update script
            * biomart query
            * updaten in datenbank
            - variant gene anpassen

        
        update variant genes
            - genes aus datenbank laden und bäume aufbauen
            - variants aus datenbank laden
            - schauen welche variant man updaten muss
            - schreiben der gene ids in die variants

        
        frontend
            - populate genes beim laden der variants
            - frontend popup mit den infos
            
            
            
            




        Die synonyms sind auch wichtig


    */






    // laden
    const filename = path.join(__dirname, 'temp.txt')
    const content = fs.readFileSync(filename, 'utf8')

    // console.log(content)


    let newEntries = parse(content, {
        columns: true,
        delimiter: '\t',
        trim: true,
        skip_empty_lines: true
    })








    /*

        1. 
        Ensembl IDs und Positionen sind eins zu eins, d.h. es darf kein entry mit gleicher position und unterschiedlicher
        IDs geben. Und umgekehrt keine endemble ID mit unterschiedlichen positionen. DAS MUSS GEPRÜFT WERDEN!!
        
        Man kann dann alle root entries über die position als id anlegen

        

        2.

        HGNC ID und HGNC SYMBOL vorhanden
            -> ist external gene name mit source vorhanden?
                -> wenn ja: match das?
                -> wenn nein: wieso?
            -> hier kann man sich dann nach HGNC Symbol halten und eine "HGNC Entry" erstellen
        
        HGNC ID und HGNC SYMBOL NICHT vorhanden
            -> ist external gene name mit source vorhanden?
                -> ja
                    wie regaiert man auf die untterschiedlichen sources?

                -> nein
                    -> was ist überhaupt vorhanden?

        
        
        Es muss geprüft werden, ob es immer eine eins-zu-eins beziehung zwischen HGNC ID und HGNC Symbol gibt (muss es eigentlich)

        GROßES PROBLEM:
        Wenn es für ein feld multiple einträge gibt (z.b. Gene Synonym), dann liefert biomart den gleichen eintrach nochmal
        mit unterschiedlichem werten für das entsprechende feld

    */


    
    
    
    let error_count = 0
    let error_genes = new Map()



    
    // const idFields = ['Gene stable ID', 'HGNC ID', 'HGNC symbol', 'Gene name', 'Source of gene name', 'Chromosome/scaffold name', 'Gene start (bp)', 'Gene end (bp)' ]
    // const multiFields = ['Gene Synonym', 'NCBI gene (formerly Entrezgene) ID']

    // const compareByIdFields = (entry,newEntry,idFields) => {
    //     let equal = true
    //     for(let key of idFields) {
    //         let a = entry[key]
    //         let b = newEntry[key]
    //         equal &&= lodash.isEqual(a,b)
    //     }
    //     return equal
    // }

    // const buildMultiValue = (newEntry,multiFields) => {
    //     let result = ''
    //     let first = true
    //     for(let key of idFields) {
    //         if(first === true) {
    //             first = false
    //         } else {
    //             result += '__'
    //         }
    //         let value = newEntry[key] == null || lodash.isString(newEntry[key]) === false || newEntry[key].length <= 0 ? 'NULL' : newEntry[key]
    //         result += value
    //     }
    //     return result
    // }





    // check ob HGNC ID und HGNC symbol eins-zu-eins beziehung haben

    // let hgncIDs = new Map()
    // let hgncSymbols = new Map()

    // for(let newEntry of newEntries) {

    //     if(chromosomes.includes(newEntry['Chromosome/scaffold name'])) {

    //         let id = newEntry['HGNC ID']
    //         let symbol = newEntry['HGNC symbol']

    //         if(hgncIDs.has(id) === true) {
    //             if(hgncIDs.get(id) !== symbol) {
    //                 console.log()
    //                 console.log('FATAL ERROR:')
    //                 console.log("geparster eintrag")
    //                 console.log(entry)
    //                 console.log("neuer eintrag")
    //                 console.log(newEntry)
    //                 return 
    //             }
    //         } else {
    //             hgncIDs.set(newEntry['HGNC ID'],newEntry['HGNC symbol'])
    //         }

    //         if(hgncSymbols.has(symbol) === true) {
    //             if(hgncSymbols.get(symbol) !== id) {
    //                 console.log()
    //                 console.log('FATAL ERROR:')
    //                 console.log("geparster eintrag")
    //                 console.log(entry)
    //                 console.log("neuer eintrag")
    //                 console.log(newEntry)
    //                 return 
    //             }
    //         } else {
    //             hgncSymbols.set(newEntry['HGNC symbol'],newEntry['HGNC ID'])
    //         }
    //     }
    // }
    // console.log(hgncIDs)
    // console.log(hgncSymbols)
    // return





    // let sources = new Set()
    // for(let newEntry of newEntries) {
    //     if(chromosomes.includes(newEntry['Chromosome/scaffold name'])) {
    //         sources.add(newEntry['Source of gene name'])
    //     }
    // }
    // console.log(sources)
    // return




    let hasError = false
    let rootEntries = new Map()

    for(let newEntry of newEntries) {

        if(chromosomes.includes(newEntry['Chromosome/scaffold name'])) {

            // if(newEntry['Gene stable ID'] === 'ENSG00000230417') {
            //     console.log(newEntry)
            // }

            if(newEntry['Source of gene name'] === 'HGNC Symbol' && newEntry['HGNC symbol'] !== newEntry['Gene name']) {
                // Diese 5 einträge können verwirrend sein, da hier über HGNC ID und symbol etwas andere transprotiert wird, als
                // über external gene name und Source of gene name

                // Es sollte aber ausreichen, die HGNC ID und symbol zu interpretieren und die anderen zu ignorieren, da es für
                // das was über Gene name kommt auch nochmal ein Entry gibt, welches diese Werte in HGNC ID und symbol stehen hat

                // Wenn man nur Gene name interpretieren würde, dann fehlt hier die HGNC ID

                // console.log(newEntry)
                // return
            }


            // 1. position id erzeugen
            let pos = {
                chr: newEntry['Chromosome/scaffold name'],
                start: newEntry['Gene start (bp)'],
                end: newEntry['Gene end (bp)']
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
            if(rootEntry != null && newEntry['Gene stable ID'] !== rootEntry.orig['Gene stable ID']) {
                
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
                // console.log(newEntry)
            }



            // 4. newEntry abhängig vom type verarbeiten

            if( isNonEmptyString(newEntry['HGNC ID']) && isNonEmptyString(newEntry['HGNC symbol']) ) {

                // HGNC ID and HGNC symbol vorhanden

                const hgnc = {
                    id: newEntry['HGNC ID'],
                    symbol: newEntry['HGNC symbol']
                }

                if(rootEntry == null) {

                    // neues root muss erzeugt werden
                    rootEntry = {
                        id: posId,
                        pos: pos,
                        orig: newEntry,
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
                let synonym = newEntry['Gene Synonym']
                let ensembl = newEntry['Gene stable ID']
                let ncbi = newEntry['NCBI gene (formerly Entrezgene) ID']

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


            } else if(isNonEmptyString(newEntry['Gene name'])) {

                // den external gene name nur dann anschauen, wenn es keine HGNC ID und/oder HGNC symbol gegeben hat

                if(newEntry['Source of gene name'] === 'HGNC Symbol') {

                    // Dieser Fall tritt momentan nicht ein
                    console.log("UNKLAR")
                    console.log(newEntry)
                    hasError = true
                    return

                } else if(newEntry['Source of gene name'] === 'NCBI gene (formerly Entrezgene)') {
                    // vorerst ignorieren
                    // hier könnte man später einen weitern child type 'NCBI' definieren
                    continue
                } else if(newEntry['Source of gene name'] === 'RFAM') {
                    // ebenso hier
                    continue
                } else if(newEntry['Source of gene name'] === 'miRBase') {
                    // und hier auch
                    continue
                } else {
                    // gene Name ohne source of gene name tritt momentan nicht auf
                    console.log("UNKLAR")
                    console.log(newEntry)
                    hasError = true
                    return
                }
                id
            } else {
                // hier kommen entries an, die kein HGNC oder anderweitigen gene name haben, sondern ausschließlich
                // Ensembl und NCBI ID mit der gegebenen Position verknüpfen
                // Hier kann man später eventuell einen weiteren child type definieren

                // console.log(newEntry)
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






    // flat entries berechnen

    // in die datenbank schreiben, immer komplette collection löschen und neu schreiben
    // collection laden, suchbäume aufbauen, varianten laden, entries suchen und gene entry ids speichern
    // (gibt es eine sortierung der häufigkeiten die man verwenden könnte, um die genes pro variant zu ranken)


    // console.dir(rootEntries.get('X-55451495-55451582'), { depth: null })
    // console.dir(rootEntries.get('1-24496254-24556039'), { depth: null })

    
  



    
    
    










    return



    let genes = new GeneDatabase('biomart_gene_list.tsv')


    const res = await database.find('GRID_variants')

    for(let [i, variant] of res.data.entries()) {
        // console.log(variant.GRCh38)
        console.log(variant.GRCh38.gDNA)
        console.log(genes.find(variant.GRCh38.chr, variant.GRCh38.pos))

        // 1. WIE ERKENNE ICH ins del delins usw zuverlässig
        // 2. WIE BERECHNE ICH DAS INTERVALL DAFÜR?

    }













    /*
    // zählen
    let map = new Map()
    for(let entry of records) {
        let key = entry['Chromosome/scaffold name']
        // console.log(key)
        if(map.get(key) == null) {
            map.set(key, 0)
            // console.log(map)
        } else {
            map.set(key, map.get(key) + 1)
        }
    }
    for(let entry of Array.from(map.entries()).sort(((b,a) => a[1]>b[1] ? 1 : a[1]<b[1] ? -1 : 0))) {
        console.log(entry)
    }
    */



    // TODO: suchstrukturen aufbauen

    // welche lib?

    // https://www.npmjs.com/package/@flatten-js/interval-tree
    // https://www.npmjs.com/package/node-interval-tree

    // flatten-js ist aktueller und besser dokumentiert






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


    
    /*
        1 für jedes chromosom einen baum erstellen und die genes einfügen
        2 suche testen

        3. varianten durchgehen, wird zu jeder variante was gefunden?

        4. für alle varianten mit dup und del usw, wie bekommt man die range?

        5. genes in eine neues feld speichern

    */


















    // variants durchgehen

    // const res = await database.find('GRID_variants')




    /*

    for(let [i,dbVariant] of res.data.entries()) {

        toStore.GRCh37.push(dbVariant.GRCh37.gDNA)
        toStore.GRCh38.push(dbVariant.GRCh38.gDNA)
    }
    
    // await VVStore.addToStore('HGQN_gDNA', 'GRCh37', toStore.GRCh37, 'mane_select', false)

    console.log(toStore.GRCh37.length)
    console.log(toStore.GRCh38.length)

    let retryError = false

    await VVStore.addToStore('HGQN_gDNA', 'GRCh38', toStore.GRCh37, 'mane_select', retryError)
    await VVStore.addToStore('HGQN_gDNA', 'GRCh38', toStore.GRCh38, 'mane_select', retryError)
    
    await database.disconnect()
    */


    await database.disconnect()
}










(async function () {
    await main()
    process.exit(0)
})()


