
const { Worker } = require("worker_threads");

(async function () {

    let stuff = {
        importId: 'b2788164-cd8a-45c5-ae9b-077a9621752e',
        userId: '33bd2aa6-ec8c-4ed4-a30a-f9060354fd75'
    }

    // const worker = new Worker('./trash/worker.js', { workerData: stuff });
    const worker = new Worker('./backend/import/excel/worker.js', { workerData: stuff });

    worker.on('message', msg => {
        console.log("MESSAGE FROM WORKER")
        console.log(msg)
    })

    worker.on('error', err => {
        console.log("ERROR FROM WORKER")
        console.log(err)
    })

    worker.on('exit', code => {
        console.log("EXIT FROM WORKER")
        console.log("EXIT CODE: " + code)
    })

    console.log("starter finished")

})()














