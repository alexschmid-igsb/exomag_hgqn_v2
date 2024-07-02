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

const clearStore = (name, build, transcript) => {
    let filename = path.join(__dirname, `${name}.${build}.${transcript}.store`)
    if(fs.existsSync(filename)) {
        fs.unlinkSync(filename)
    }
}

const addToStore = async (name, build, variants, transcript, retryError = true) => {
    
    // let filename = path.join(__dirname, `${name}.store`)
    let filename = path.join(__dirname, `${name}.${build}.${transcript}.store`)
    let store = {}

    if(fs.existsSync(filename)) {
        store = JSON.parse(fs.readFileSync(filename, 'utf8'))
    }


    // console.log(store['NC_000017.11:g.50600739G>'])
    // return

    for(let [i,variant] of variants.entries()) {
        
        if( store[variant] != null ) {

            // console.log(store[variant])

            if(store[variant].__STORE_ERROR__ != null) {
                if(retryError === false) {
                    console.log(`${i+1}/${variants.length} - ${variant}: ERROR: ${store[variant].__STORE_ERROR__} NO RETRY`)
                    continue
                } else {
                    console.log(`${i+1}/${variants.length} - ${variant}: ERROR: ${store[variant].__STORE_ERROR__}`)
                }
            } else {
                console.log(`${i+1}/${variants.length} - ${variant}: ALREADY EXISTS`)
                continue
            }
        
        } else {

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
                let msg = `${caught.message}${caught.status != null ? ` (${caught.status})` : '' }`
                store[variant] = {
                    __STORE_ERROR__: msg
                }
                console.log(`${i+1}/${variants.length} - ${variant}: ERROR: ${msg}`)
            }
        }

        fs.writeFileSync(filename, JSON.stringify(store))
    }
}


const loadStore = (name, build, transcript) => {
    let filename = path.join(__dirname, `${name}.${build}.${transcript}.store`)
    if(fs.existsSync(filename)) {
        let store = new Map()
        for(const [key,value] of Object.entries(JSON.parse(fs.readFileSync(filename, 'utf8')))) {
            store.set(key,value)
        }
        return store
    } else {
        throw new Error(`Store file does not exist: ${filename}`)
    }
}


module.exports = {
    addToStore: addToStore,
    loadStore: loadStore
}

























