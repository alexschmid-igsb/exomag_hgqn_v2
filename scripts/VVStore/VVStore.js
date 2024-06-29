const fs = require('fs')
const path = require('path')

const FetchAPI = require('../FetchAPI')

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function vvQuery(build,variant,transcripts = 'all') {
    const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    return FetchAPI.get(url)
}

const clearStore = name => {
    // file löschen

}

const addToStore = async (name, build, variants, transcript) => {
    
    let filename = path.join(__dirname, `${name}.store`)
    let store = {}

    if(fs.existsSync(filename)) {
        store = JSON.parse(fs.readFileSync(filename, 'utf8'))
    }

    for(let [i,variant] of variants.entries()) {
        
        if(store[variant] == null) {

            let response = null

            let caught = null
            try {
                response = await vvQuery(build,variant,transcript)
            } catch(err) {
                caught = err
            }

            if(caught == null) {
                store[variant] = response
                console.log(`${i+1}/${variants.length} - ${variant}: ADDED`)
                await sleep(500)
            } else {
                console.log(`${i+1}/${variants.length} - ${variant}: ERROR: ${caught.message}${caught.status != null ? ` (${caught.status})` : '' }`)
            }

        } else {
            console.log(`${i+1}/${variants.length} - ${variant}: ALREADY EXISTS`)
        }

        fs.writeFileSync(filename, JSON.stringify(store))
    }
}

module.exports = {
    addToStore: addToStore
}

























