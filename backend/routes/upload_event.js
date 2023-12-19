var express = require('express')
var router = express.Router()

const fs = require('fs')
const multer = require('multer')

const auth = require('../users/auth')
const isSuperuser = require('../users/isSuperuser')

const xlsx = require('xlsx')
xlsx.helper = require('../util/xlsx-helper')

const UUID = require('uuid')
const BackendError = require('../util/BackendError')

function validateUUID(uuid) {
  return UUID.validate(uuid) && UUID.version(uuid) === 4;
}

// GET LIST
router.get('/list', [auth, isSuperuser], async function (req, res, next) {
    
    let data = await knex('change_events')
        .select(
            'grids.name AS grid',
            'users.username AS user',
            'change_events.timestamp',
            'change_events.type',
            'change_events.file',
        )
        .join('grids', 'grids.id', '=', 'change_events.grid')
        .join('users', 'users.id', '=', 'change_events.user')
        .orderBy('grids.ordering','asc')
        .orderBy('timestamp','asc')
    res.send(data)

})

module.exports = router;















