var express = require('express')
var router = express.Router()

const database = require('../database/connector').connector

const auth = require('../users/auth')

const BackendError = require('../util/BackendError')

const lodash = require('lodash')




router.get('/get/:variantId', [auth], async function (req, res, next) {

    let variantId = req.params['variantId'] 
    if(variantId == null ) {
        throw new BackendError(`Missing variantId in request`, 400)
    }

    let data = {}


    // get variant data

    let result = await database.find('GRID_variants', {
        filter: { _id: variantId },
        populate: [{ path: 'genes' }]
    })

    if(lodash.isArray(result?.data) === true && result.data.length < 1) {
        throw new BackendError(`Could not find variant with id '${variantId}' in database`, 404)
    }

    if(lodash.isArray(result?.data) === true && result.data.length > 1) {
        throw new BackendError(`Inconsitency Error: Found more than one variant entry for variant id '${variantId}' in database`, 500)
    }

    data.variant = result.data[0]


    // get cases data

    data.cases = (await database.find('GRID_cases', {
        filter: { variants: { $elemMatch: { 'variant.reference': { $eq: variantId } } } }
    })).data


    res.send(data)

})








module.exports = router;















