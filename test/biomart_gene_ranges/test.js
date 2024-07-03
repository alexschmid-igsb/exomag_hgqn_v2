const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')

const { parse } = require('csv-parse/sync')

const IntervalTree = require('@flatten-js/interval-tree').default



const chromosomes = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y' ]



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



async function main() {

    // init
    console.log('\n0. INIT')
    await database.initPromise
    await users.initPromise
    console.log()







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


