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


    let entries = parse(content, {
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


    


    /*
    let root = new Map()

    for(let entry of entries) {

        if(chromosomes.includes(entry['Chromosome/scaffold name'])) {



            // 1. BUILD ID FROM POSITION

            let pos = {
                chr: entry['Chromosome/scaffold name'],
                start: entry['Gene start (bp)'],
                end: entry['Gene end (bp)']
            }

            if(pos.chr == null || pos.start == null || pos.end == null) {
                console.log("ERROR: Chromosome, start oder end position ist nicht vorhanden. Entry wird übersprungen.")
                console.log(pos)
                continue
            }

            let id = pos.chr + '-' + pos.start + '-' + pos.end

            if(root.has(id) === true) {
                console.log('FATAL ERROR: id schon vorhanden')
                console.log(id)
                console.log(root.get(id))
                console.log(entry)
                return
            }

            root.set(id, entry)




        }



        
        
        
      

    }
    */







    let ensemblSet = new Map()
    let hgncSymbolSet = new Map()
    let hgncIdSet = new Map()
    let geneNameSet = new Map()
    let entrezSet = new Map()

    let sources = new Map()

    for(let entry of entries) {

        let chromosome = entry['Chromosome/scaffold name']

        if(chromosomes.includes(chromosome)) {



            let source = entry['Source of gene name']
            if(sources.has(source) === false) {
                sources.set(source, 0)
            }
            sources.set(source, sources.get(source) + 1)
            




            let ensembl = entry['Gene stable ID']
            if(ensembl == null || ensembl.length === 0) {
                console.log("ensembl is null")
            }
            else if(ensemblSet.has(ensembl)) {
                // console.log("ensembl duplicate " + ensembl)
                // console.log(entry)
                // console.log(ensemblSet.get(ensembl))

                // if(
                //     entry['Chromosome/scaffold name'] !== ensemblSet.get(ensembl)['Chromosome/scaffold name'] ||
                //     entry['Gene start (bp)'] !== ensemblSet.get(ensembl)['Gene start (bp)'] ||
                //     entry['Gene end (bp)'] !== ensemblSet.get(ensembl)['Gene end (bp)']
                // ) {
                //     console.log("ensembl duplicate " + ensembl)
                //     console.log(entry)
                //     console.log(ensemblSet.get(ensembl))
                // }

            }
            ensemblSet.set(ensembl,entry)

            let hgncSymbol = entry['HGNC symbol']
            if(hgncSymbol == null || hgncSymbol.length === 0) {
                // console.log("HGNC symbol duplicate")
                // console.log(entry)
                // console.log(geneNameSet.get(hgncSymbol))
            }
            else if(hgncSymbolSet.has(hgncSymbol)) {
                // console.log("hgncSymbol duplicate")
            }
            hgncSymbolSet.set(hgncSymbol,entry)
            
            let hgncId = entry['HGNC ID']
            if(hgncId == null || hgncId.length === 0) {
                // console.log("hgncId is null")
            }
            else if(hgncIdSet.has(hgncId)) {
                // console.log("hgncId duplicate")
            }
            hgncIdSet.set(hgncId,entry)


            let geneName = entry['Gene name']
            if(geneName == null || geneName.length === 0) {
                // console.log("geneName is null")
            }
            else if(geneNameSet.has(geneName)) {
                // console.log("geneName duplicate")
                // console.log(entry)
                // console.log(geneNameSet.get(geneName))
            }
            geneNameSet.set(geneName,entry)

            let entrez = entry['NCBI gene (formerly Entrezgene) ID']
            if(entrez == null || entrez.length === 0) {
                // console.log("entrez is null")
            }
            else if(entrezSet.has(entrez)) {
                // console.log("entrez duplicate")
                // console.log(entry)
                // console.log(entrezSet.get(entrez))
            }
            entrezSet.set(entrez,entry)







            // console.log(symbol + " " + symbol.length)


            // if(symbol == null || symbol.length === 0) {
            //     console.log(entry)
            // }
            //

            // if(symbols.has(symbol)) {
            //     console.log('error: doeppel: ' + symbol)
            //     return
            // }
            //


    
        }


        // console.log(entry)
    }

    // console.log(sources)








    // inputStream.pipe(outputStream)







    
    
    










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


