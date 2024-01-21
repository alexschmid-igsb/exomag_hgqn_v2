
const {
    workerData,
    parentPort
} = require('worker_threads')



async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}


async function main() {

    console.dir(workerData,{depth: null})

    for(let i=0; i<100; i++) {
        console.log(i)
        if(i==20) {
            throw new Error("mein error")
        }
        if(i==15) {
            parentPort.postMessage({bla: 'eine message', daten: { zeug: '123', bla: 567 }})
        }
        await sleep(100)
    }
}

// main().catch(err => console.error(err))
main()





























