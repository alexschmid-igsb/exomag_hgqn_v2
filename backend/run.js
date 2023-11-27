#!/usr/bin/env node

const config = require('../config/config.js')
const debug = require('debug')('backend:server')

const http = require('http')
const express = require('express')
require('express-async-errors')

const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const nocache = require('nocache')

var logger = require('morgan')
var path = require('path')
const fs = require('fs')

const StackTrace = require('stacktrace-js')


// Setup async init tasks
const asyncInits = [
    require('./redis/RedisConnection').initPromise,
    require('./users/manager').initPromise
]

// const init = require('./init')


// Prepare server port (or named pipe)
function normalizePort(value) {
    var port = parseInt(value, 10)
    if (isNaN(port)) {
        return value            // named pipe
    }
    if (port >= 0) {
        return port             // port number
    }
    return false
}
var port = normalizePort(process.env.PORT || '9000')


// Create the express app
var app = express()

app.set('port', port)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(nocache())
app.set('etag', false)


// Create routes automatically for all route files
fs.readdirSync(path.join(__dirname, 'routes')).forEach( file => {
    if (file !== 'index.js') {
        route = file.substring(0, file.length - 3)
        app.use(`/api/${route}`, require(`./routes/${route}`))
    } else if (file === 'index.js') {
        // Eine index route könnte verwendet werden, um auch das frontend über Express auszuliefern.
        // Für ExomaAG und HGQN werden aber nur die API endpoints geroutet. Das Frontend wird über
        // einen webserver (z.b. nginx) ausgeliefert.
        
        // app.use('/', require('./routes/index'))     
    }
})

// Catch 404 errors and forward to the error handler
app.use( function(req, res, next) {

    // console.dir(req.originalUrl, { depth: null }) // '/admin/new?a=b' (WARNING: beware query string)
    // console.dir(req.baseUrl, { depth: null }) // '/admin'
    // console.dir(req.path, { depth: null }) // '/new'
    // console.dir(req.baseUrl + req.path, { depth: null })
    // console.dir(req, {depth: null})

    next(createError(404, req.path))
})

// WICHTIG: Im folgenden geht es um die async error Problematik und eine Lösung wird beschrieben
// https://zellwk.com/blog/async-await-express/

// Ersetzt diese art des error handlings auch den 404 handler von oben?
app.use(async function (err, req, res, next) {

    // Generiere Fehlerinfos für die Anzeige im Frontend (auch für async code)

    console.log("CALL GLOBAL ERROR HANDLER")

    let status = err.status || 500

    let error = {
        status: status,
        name: err.name,
        message: err.message,
        stackTrace: await StackTrace.fromError(err)
    }

    console.log("STATUS")
    console.log(error.status)
    console.log()
    console.log("NAME")
    console.log(error.name)
    console.log()
    console.log("MESSAGE")
    console.log(error.message)
    console.log()
    console.log("CAUSE")
    console.log(err)
    console.log()


    res.status(status)
    res.send(error)
})


// Create HTTP server
console.log('Start backend in ' + config['environmentMode'] + ' mode')

var server = http.createServer(app)

server.on('error', error => {
    if (error.syscall !== 'listen') {
        throw error
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
        default:
            throw error
    }
})

server.on('listening', () => {
    var addr = server.address()
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Express server is listening on ' + bind)
    // debug('Listening on ' + bind);
})


// Initialize all modules that need asynchronous initialization, wait for completion, the run the server
console.log("Run asynchronous module initialization")
Promise.all(asyncInits).then( () => {
    console.log("Asynchronous initialization finished")
    server.listen(port)    
})
.catch( (error) => {
    console.log("ERROR: ASYNCHRONOUS INITIALIZATION FAILED WITH ERROR")
    console.log(error)
})
