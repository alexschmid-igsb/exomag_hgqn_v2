const Redis = require('redis')

const config = require('../../config/config')
const redisURL = config['redisURL']

let isInitialized = false
let client = null

async function init() {

    if(isInitialized) {
        return
    }
    
    client = Redis.createClient({ url: redisURL })

    try {
        await client.connect("redis://localhost:8482")
    } catch(err) {
        throw new Error("Could not connect to redis server", { cause: err })
    }

    console.log('   - connected to redis server')
}

let initPromise = init()

module.exports = {
    initPromise: initPromise,
    getClient: function() {
        return client
    }
}
