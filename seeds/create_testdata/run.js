

const FetchAPI = require('./FetchAPI')





async function vv_query(build,variant,transcripts = 'all') {
    return FetchAPI.get(`https://rest.variantvalidator.org/VariantValidator/variantvalidator/${build}/${variant}/${transcripts}`)
}





async function worker() {


    const data = require('./testdata.json')





    for(let record of data) {


        console.dir(record,{depth: null})

        break
    }



    console.log()




    process.exit(0)

}



function start() {
    return worker()
}



// Call start
(async () => {
    console.log('before start')
    await start()
    console.log('after start')
})();



    // select label,ordering from "columns" order by ordering






