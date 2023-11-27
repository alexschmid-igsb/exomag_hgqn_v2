var express = require('express')
var router = express.Router()

const db = require('../../backend/database/connector').connector

const auth = require('../users/auth')

const BackendError = require('../util/BackendError')

function validateUUID(uuid) {
  return UUID.validate(uuid) && UUID.version(uuid) === 4;
}


// curl --header "Content-Type: application/json" --request POST --data '["HP:0000013"]' http://localhost:9000/api/process

// curl --header "Content-Type: application/json" --request GET http://localhost:9000/api/grid/get/cases
// curl --header "Content-Type: application/json" --request POST --data '["HP:0000013"]' http://localhost:9000/api/grid/get/cases

// curl --header "Content-Type: application/json" --request GET http://localhost:9000/api/grid/get/cases



// router.get('/get/:gridId', [auth], async function (req, res, next) {
    router.get('/get/:gridId', async function (req, res, next) {

    let gridId = req.params['gridId'] 
    if(gridId == null ) {
        throw new BackendError(`Could not find grid with id ${gridId}`, 404)
    }

    const target = `GRID_${gridId}`

    let model = null
    let scheme = null

    try {
        model = db.getModel(target)
        scheme = db.getScheme(target)
    } catch (e) {
        throw new BackendError(`Could not find grid with id ${gridId}`, 404)
    }

    const dbRes = await db.find(target)

    res.send(dbRes)
    
    // res.send(result)
})








module.exports = router;















