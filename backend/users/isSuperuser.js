const BackendError = require('../util/BackendError')

module.exports = async function (req, res, next) {

    if(!req.auth) {
        throw new BackendError("Authentication failed. Admin rights requried.",401)
    }

    let user = req.auth.user

    if(!user) {
        throw new BackendError("Authentication failed. Admin rights requried.",401)
    }

    if(user.isSuperuser === true) {
        next()
    } else {
        throw new BackendError("Authentication failed. Admin rights requried.",401)
    }
}
