

const assert = require('node:assert')



const fs = require('fs')
const path = require('path')

const lodash = require('lodash')

const { parse: parseSync } = require('csv-parse/sync')

const { parse } = require('csv-parse')



const { generate } = require('csv-generate')
const { transform } = require('stream-transform')


async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}




async function main() {





    let result = await new Promise( (resolve,reject) => {

        let records = []

        // let inputStream = fs.createReadStream(path.join(__dirname, 'battke-large.csv'))
        let inputStream = fs.createReadStream(path.join(__dirname, 'battke2.csv'))

        const parser = parse({
            columns: true,
            delimiter: '+',
            trim: true,
            skip_empty_lines: true
        })
        

        // sammelt alle records
        parser.on('readable', function () {
            let record
            while((record = parser.read()) !== null) {
                records.push(record);
            }
        })


        // holt über die keys des ersten records die header names
        // parser.on('readable', function () {
        //     let record = parser.read()
        //     inputStream.close()
        //     if(record == null || lodash.isObject(record) === false || lodash.isArray(record)) {
        //         reject(new Error('could not parse even a single record from csv stream'))
        //     } else {
        //         let headers = Object.keys(record)
        //         if(headers == null || lodash.isArray(headers) === false) {
        //             reject(new Error('could not parse headers from csv stream'))
        //         } else {
        //             resolve(headers)
        //         }
        //     }
        // })
        
        parser.on('error', function (err) {
            reject(new Error('could not parse csv stream', err))
        })
    
        parser.on('end', function () {
            console.log("END")
            resolve(records)
        })

        inputStream.pipe(parser)
    })


    console.log(result.length)
    console.log(result)

    
    


    // sync

    // const filename = path.join(__dirname, 'battke-large.csv')
    // const content = fs.readFileSync(filename, 'utf8')
    // let incomingEntries = parseSync(content, {
    //     columns: true,
    //     delimiter: ',',
    //     trim: true,
    //     skip_empty_lines: true
    // })
    // console.log(incomingEntries)



}




(async function () {
    await main()
    process.exit(0)
})()




