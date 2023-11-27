var express = require('express')
var router = express.Router()

const auth = require('../users/auth')

router.get('/get', /*[ auth ],*/ async function (req, res, next) {

    let groups = await knex('grid_groups').orderBy('ordering', 'desc')
    let groupsById = new Map()
    for(let group of groups) {
        group.grids = []
        groupsById.set(group.id,group)
    }

    let grids = await knex('grids').orderBy('ordering', 'desc')
    for(let grid of grids) {
        let group = groupsById.get(grid.group)
        group.grids.push(grid)
    }

    console.log(JSON.stringify(groups))

    return res.send(groups)
})

module.exports = router;















