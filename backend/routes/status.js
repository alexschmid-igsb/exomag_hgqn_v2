var express = require('express')
var router = express.Router()

const auth = require('../users/auth')

const config = require('../../config/config')

router.get('/', function (req, res, next) {

    /*
    const info = {
        environmentMode: config['environmentMode']
    }
    res.send(info)
    */

    res.send(config)
})

router.post('/auth-info', [auth], async function (req, res, next) {
    // TODO: user/login status, token etc
    res.send({})
})

module.exports = router
