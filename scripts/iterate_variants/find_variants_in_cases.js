const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const database = require('../../backend/database/connector').connector
const users = require('../../backend/users/manager')

const console = require('../../backend/util/PrettyfiedConsole')
const StackTrace = require('stacktrace-js')

const FetchAPI = require('../FetchAPI')
const prettyBytes = require('pretty-bytes')

/*
const Readable = require('node:stream').Readable
const pipeline = require('node:stream/promises').pipeline
*/

function isNonEmptyString(val) {
    return val != null && lodash.isString(val) && val.length > 0
}



async function target() {


    let variants = (await database.find('GRID_variants')).data
    let cases = (await database.find('GRID_cases')).data

    for(let variant of variants) {

        // console.log(variant._id)

        let casesFound = []

        for(let item of cases) {
            
            for(let caseVariant of item.variants) {
                let reference = caseVariant?.variant?.reference
                if(isNonEmptyString(reference) && reference === variant._id) {
                    if(casesFound.includes(item) === false)
                        casesFound.push(item)
                }
            }
        }


        /*
        if(casesFound.length > 2) {
            console.log(variant._id)
            for(let item of casesFound) {
                console.log("   " + item._id)
            }
        }
        */


        // cross check by query

        let queryCases = (await database.find('GRID_cases', {
            filter: { variants: { $elemMatch: { 'variant.reference': { $eq: variant._id } } } }
        })).data


        // length

        console.log(casesFound.length + ' ' + queryCases.length)

        if(casesFound.length !== queryCases.length) {
            console.log("ERROR 1")
            console.log(JSON.stringify(casesFound,null,2))
            console.log()
            console.log(JSON.stringify(queryCases,null,2))
            return
        }



        for(let caseFound of casesFound) {
            let exists = false
            for(let queryCase of queryCases) {
                if(lodash.isEqual(caseFound,queryCase)) {
                    exists = true
                }
            }
            if(exists === false) {
                console.log("ERROR 2")
                return
            }
        }



        for(let queryCase of queryCases) {
            let exists = false
            for(let caseFound of casesFound) {
                if(lodash.isEqual(caseFound,queryCase)) {
                    exists = true
                }
            }

            if(exists === false) {
                console.log("ERROR 3")
                return
            }
        }

    }


    // GRCh38-2-21006288-C-T

    // { variants: { $elemMatch: { gene: 'ARID1B' } }}
    // { variants: { $elemMatch: { variant: { $ne: null } } }}

    // dieser query holt die cases an der die variante beteiligt ist
    // { variants: { $elemMatch: { 'variant.reference': { $eq: 'GRCh38-2-21006288-C-T' } } } }
    
    



}




async function main() {

    // INSTANCE_CONFIG_PATH=./config/exomag PROFILE=development_default node scripts/iterate_variants/find_variants_in_cases.js

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


