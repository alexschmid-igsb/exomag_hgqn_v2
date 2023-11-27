const jwt = require('jsonwebtoken')
const BackendError = require('../util/BackendError')

const config = require('../../config/config')

const users = require('../users/manager')

module.exports = async function (req, res, next) {

    // zum zeitpunkt des ersten requests, sind alle async modules bereits initialisiert

    // const token = req.cookies['x-auth-token'] || req.header('x-auth-token')
    const token = req.cookies['x-auth-token']

    if (!token) {
        throw new BackendError("Authentication failed. No token provided.",401)
    }

    let payload = undefined

    try {
        // der x-auth-token kann nur mit dem private key verifiziert und dekodiert werden
        payload = jwt.verify(token, config.jwt.privateKey)
        console.log("decoded token payload")
        console.log(payload)
    }
    catch(error) {
        throw new BackendError("Authentication failed. Invalid token.",401,error)
    }


    let user = await users.getUserById(payload.userId)

    if(user == null) {
        res.clearCookie('x-auth-token')
        res.status(401).send({})
    }

    // der password hash ist für die weitere request chain nicht relevant und wird deshalb hier rausgenommen
    delete user.password  
    
    // hier die user info für die request chain zusammenstellen und im request object ablegen
    req.auth = {
        user: user

        // TODO: Über das users objekt werden beispielsweise die rechte des users aus dem store
        // geladen und über die request chain zur verfügung gestellt

        // rights: users.getRightInfos()            
    }

    next()
}
