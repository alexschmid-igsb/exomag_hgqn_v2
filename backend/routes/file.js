var express = require('express')
var router = express.Router()

const fs = require('fs')
const multer = require('multer')

const auth = require('../users/auth')
const isAdmin = require('../users/isAdmin')

const xlsx = require('xlsx')
xlsx.helper = require('../util/xlsx-helper')

const UUID = require('uuid')
const BackendError = require('../util/BackendError')

function validateUUID(uuid) {
  return UUID.validate(uuid) && UUID.version(uuid) === 4;
}


// GET FILE
router.get('/get', [auth, isAdmin], async function (req, res, next) {

    let fileId = req.query['fileId'] 
    if(fileId == undefined || fileId == null || validateUUID(fileId) == false) {
        throw new BackendError(`Missing fileId parameter`, 400)
    }

    let file = await knex('files').where({id: fileId}).first()
    if(file == undefined) {
        throw new BackendError(`Could not find file for fileId ${fileId}`,400)
    }

    file.buffer = file.buffer.toString('binary')

    res.send(file)
})

module.exports = router;















