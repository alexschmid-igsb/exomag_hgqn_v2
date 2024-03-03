var express = require('express')
var router = express.Router()

const argon2 = require('argon2')
const { v4: uuidv4 } = require('uuid')
var _ = require('lodash')

const auth = require('../users/auth')
const isSuperuser = require('../users/isSuperuser')

const config = require('../../config/config')
const jwt = require('jsonwebtoken')

const usersStore = require('../users/manager')
const database = require('../database/connector').connector

const BackendError = require('../util/BackendError')

var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const mailConfig = config['mail']


// TODO: endpoint for public lab liste
/*
router.get('/list-public', [auth], async function (req, res, next) {

    
    const dbResult = await database.find('CORE_users', { populate: 'lab'})
    console.log(dbResult)
    for(let user of dbResult.data) {
        delete user.password
        delete user.state
    }
    res.send(dbResult)
})
*/



// endpoint to get lab list (by superuser)
router.get('/list', [auth, isSuperuser], async function (req, res, next) {
    const dbResult = await database.find('STATIC_labs')
    res.send(dbResult)
})



module.exports = router;
