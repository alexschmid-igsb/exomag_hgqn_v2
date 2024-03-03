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
const database = require('../../backend/database/connector').connector

const Mailer = require('../util/mail/Brevo')

const BackendError = require('../util/BackendError')

var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


const mailConfig = config['mail']



/*
const environmentMode = config['environmentMode']
const jwtPrivateKey = config['jwtPrivateKey']
const jwtExpiresIn = config['jwtExpiresIn']
*/




function randHex(len) {
    let maxlen = 8
    let min = Math.pow(16, Math.min(len, maxlen) - 1)
    let max = Math.pow(16, Math.min(len, maxlen)) - 1
    let n = Math.floor(Math.random() * (max - min + 1)) + min
    let r = n.toString(16).toUpperCase()
    while (r.length < len) {
        r = r + randHex(len - maxlen);
    }
    return r;
}





// endpoint to get authenticated user given the jwt token received by cookie
router.get('/auth', [auth], async function (req, res, next) {
    // console.log(req.auth.user)
    res.send(req.auth.user)
})


// endpoint to login user
router.post('/login', async function (req, res, next) {

	const username = req.body.username ? req.body.username.trim() : undefined
	const password = req.body.password ? req.body.password : undefined

	if (username == undefined || username.length <= 0 || password == undefined || password.length <= 0) {
		throw new BackendError("username or password is missing", 400)
	}

    console.log("USERNAME RECEIVED")
    console.log(username)

    let user = undefined    

	const isEmail = EMAIL_REGEX.test(username)
    if(isEmail) {
        console.log("by email")
        user = await usersStore.getUserByEmail(username)
    } else {
        console.log("by username")
        user = await usersStore.getUserByUsername(username)
    }

    console.log("USER FOUND")
    console.log(user)

    if (user == null || user._id == null || user.username == null || user.email == null || user.password == null) {
		throw new BackendError("Credentials could not be verified", 401)
	}

    let verified = false
	try {
		verified = await argon2.verify(user.password, password)
        delete user.password
	} catch(err) {
		throw new BackendError("Unexpected Error while verifing credentials", 500, err)
	}

	if (verified) {
		const token = jwt.sign( { userId: user._id }, config.jwt.privateKey, { expiresIn: config.jwt.expiresIn } )
		res.cookie('x-auth-token', token, {
			// maxAge: jwtExpiresIn*1000,       // no expire, session cookie only
			httpOnly: true,
			sameSite: true,
			secure: config.jwt.secureCookie === true ? true : false
		}).send(user)
	} else {
		throw new BackendError("Credentials could not be verified", 401)
	}
})



// endpoint to logout user
router.post('/logout', async function (req, res, next) {
	res.clearCookie('x-auth-token')
	res.send({})
})



// endpoint for public user list
router.get('/list-public', [auth], async function (req, res, next) {

    // ALT
    // Es gibt keine Userliste mehr aus dem usersStore

    // let labs = await database.find('STATIC_labs')

    // let users = await usersStore.getAllUsers()
    // for(let user of users) {
    //     delete user.password
    //     delete user.state
    // }

    // res.send({
    //     users: users,
    //     labs: labs.data
    // })

    // let users = await usersStore.getAllUsers()
    // for(let user of users) {
    //     delete user.password
    //     delete user.state
    // }
    // res.send(users}


    // NEU
    // Users aus der Datenbank holen und labs per populate hinzufügen

    const dbResult = await database.find('CORE_users', { populate: 'lab'})
    console.log(dbResult)
    for(let user of dbResult.data) {
        delete user.password
        delete user.state
    }
    res.send(dbResult)
})



// endpoint to get user list (by admin using the user management)
router.get('/list', [auth, isSuperuser], async function (req, res, next) {

    // ALT
    // Es gibt keine Userliste mehr aus dem usersStore

    // let labs = await database.find('STATIC_labs')

    // let users = await usersStore.getAllUsers()
    // for(let user of users) {
    //     delete user.password
    // }

    // res.send({
    //     users: users,
    //     labs: labs.data
    // })


    // NEU
    // Users aus der Datenbank holen und labs per populate hinzufügen

    const dbResult = await database.find('CORE_users', { populate: 'lab'})
    for(let user of dbResult.data) {
        delete user.password
    }
    res.send(dbResult)
})



// endpoint to add user (by admin using the user management)
router.post('/add-user-admin', [auth, isSuperuser], async function (req, res, next) {

    // get params
	const username = req.body.username ? req.body.username.trim() : undefined
	const email = req.body.email ? req.body.email.trim() : undefined
    const lab =  req.body.lab ? req.body.lab.trim() : undefined
    const sendActivationLink = req.body.sendActivationLink ? req.body.sendActivationLink : false
    
    // check params
    if(!username) {
        throw new BackendError("Username is missing", 400)
    }

    if(!email) {
        throw new BackendError("Email is missing", 400)
    }

    if(!lab) {
        throw new BackendError("Lab is missing", 400)
    }

    if(await usersStore.getUserByUsername(username) != null) {
        throw new BackendError("Username already exist", 400)
    }

    if(await usersStore.getUserByEmail(email) != null) {
        throw new BackendError("Email already exist", 400)
    }

    const isEmail = EMAIL_REGEX.test(email)
    if(isEmail == false) {
        throw new BackendError("Wrong email syntax",400)
    }

    const template = req.body.template
    if(sendActivationLink === true && template == null) {
        throw new BackendError(`Template is missing`, 400)
    }

    // check if lab exisit
    const labCheck = await database.find('STATIC_labs', { filter: { _id: lab } } )
    if(labCheck.data.length !== 1) {
        throw new BackendError(`Lab does not exist: ${lab}`, 400)
    }

    // add user
    let userId = uuidv4()

    let stateId = 'CREATED'
    let token = null
    let when = null

    if(sendActivationLink) {
        stateId = 'ACTIVATION_PENDING'
        token = randHex(32)
        when = new Date(Date.now()).toISOString()
    }

    let user = {
        id: userId,
        username: username,
        email: email,
        lab: lab,
        isSuperuser: false,
        state: {
            id: stateId,
            token: token,
            when: when
        }
    }

    await usersStore.insertUser(user)

    if(sendActivationLink) {
        await Mailer.sendTransactionMail({
            to: {
                name: username,
                email: email
            },
            from: mailConfig.from,
            template: template,
            params: { token: token }
        })
    }
    
    return res.send({})
})



// endpoint to delete user (by admin using the user management)
router.post('/delete-user-admin', [auth, isSuperuser], async function (req, res, next) {

    console.log(req.body)

    // get params
	const username = req.body.username ? req.body.username.trim() : undefined
	const id = req.body.id ? req.body.id.trim() : undefined
	const email = req.body.email ? req.body.email.trim() : undefined

    // check params
    if(!username) {
        throw new BackendError("Username is missing", 400)
    }

    if(!id) {
        throw new BackendError("User id is missing", 400)
    }

    if(!email) {
        throw new BackendError("Email is missing", 400)
    }

    await usersStore.deleteUser(id,username,email)

    return res.send({})
})



// endpoint to get user by activation token
router.post('/by-activation-token', async function (req, res, next) {
    const activationToken = req.body.activationToken ? req.body.activationToken.trim() : undefined
    console.log("RECEIVED: activationToken " + activationToken)
    if(typeof activationToken !== 'string' || activationToken.length !== 32) {
        return res.send({})
    } else {
        let user = await usersStore.getUserByActivationToken(activationToken)
        console.log("USER: ")
        console.dir(user, { depth: null })

        if(user == null || user._id == null || user.username == null || user.email == null) {
            throw new BackendError("Could not find user for registry token", 404)
        } else {
            delete user.password
            return res.send(user)
        }
    }
})



// endpoint to get user by reset password token
router.post('/by-reset-password-token', async function (req, res, next) {
    const resetPasswordToken = req.body.resetPasswordToken ? req.body.resetPasswordToken.trim() : undefined
    console.log("RECEIVED: resetPasswordToken " + resetPasswordToken)
    if(typeof resetPasswordToken !== 'string' || resetPasswordToken.length !== 32) {
        return res.send({})
    } else {
        let user = await usersStore.getUserByPasswordToken(resetPasswordToken)
        console.log("USER: ")
        console.dir(user, { depth: null })

        if(user == null || user._id == null || user.username == null || user.email == null) {
            throw new BackendError("Could not find user for reset password token", 404)
        } else {
            delete user.password
            return res.send(user)
        }
    }
})



// endpoint to finish activation by user
router.post('/activation', async function (req, res, next) {

    const id = req.body.id ? req.body.id : undefined
    const password = req.body.password ? req.body.password : undefined
    const passwordConfirm = req.body.passwordConfirm ? req.body.passwordConfirm : undefined
    const firstname = req.body.firstname ? req.body.firstname : undefined
    const lastname = req.body.lastname ? req.body.lastname : undefined
    // const site = req.body.site ? req.body.site : undefined
    // const role = req.body.role ? req.body.role : undefined

    if(!id) {
        throw new BackendError("User id is missing", 400)
    }

    // console.log("ID: " + id)

    if(!password) {
        throw new BackendError("Password is missing", 400)
    }

    if(!passwordConfirm) {
        throw new BackendError("Password confirmation is missing", 400)
    }

    if(!firstname) {
        throw new BackendError("Firstname is missing", 400)
    }

    if(!lastname) {
        throw new BackendError("Lastname is missing", 400)
    }

    /*
    if(!site) {
        throw new BackendError("Site is missing", 400)
    }

    if(!role) {
        throw new BackendError("Role is missing", 400)
    }
    */

    const upperTest = /[ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ]/
    const lowerTest = /[abcdefghijklmnopqrstuvwxyzäöü]/
    const digitTest = /[0123456789]/
    const specialTest = /[ `°!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

    let passwordCheck = password.length >= 8 && upperTest.test(password) && lowerTest.test(password) && digitTest.test(password) && specialTest.test(password)
    if(!passwordCheck) {
        throw new BackendError("Illegal password format", 400)
    }

    let passwordsMatches = password === passwordConfirm
    if(!passwordsMatches) {
        throw new BackendError("Passwords do not match", 400)
    }

    try {
        await usersStore.updateUserById(id, {
            password: await argon2.hash(password),
            firstname: firstname,
            lastname: lastname,
            // site: site,
            // role: role,
            state: {
                id: 'ACTIVE',
                token: null,
                when: null
            }
        })
    } catch(err) {
        throw new BackendError("Error while updating user in database", 400, err)
    }

    res.send({})
})





// endpoint to execute password reset by user
router.post('/reset-password', async function (req, res, next) {

    const id = req.body.id ? req.body.id : undefined
    const password = req.body.password ? req.body.password : undefined
    const passwordConfirm = req.body.passwordConfirm ? req.body.passwordConfirm : undefined

    if(!id) {
        throw new BackendError("User id is missing", 400)
    }

    // console.log("ID: " + id)

    if(!password) {
        throw new BackendError("Password is missing", 400)
    }

    if(!passwordConfirm) {
        throw new BackendError("Password confirmation is missing", 400)
    }

    const upperTest = /[ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ]/
    const lowerTest = /[abcdefghijklmnopqrstuvwxyzäöü]/
    const digitTest = /[0123456789]/
    const specialTest = /[ `°!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

    let passwordCheck = password.length >= 8 && upperTest.test(password) && lowerTest.test(password) && digitTest.test(password) && specialTest.test(password)
    if(!passwordCheck) {
        throw new BackendError("Illegal password format", 400)
    }

    let passwordsMatches = password === passwordConfirm
    if(!passwordsMatches) {
        throw new BackendError("Passwords do not match", 400)
    }

    try {
        await usersStore.updateUserById(id, {
            password: await argon2.hash(password),
            state: {
                id: 'ACTIVE',
                token: null,
                when: null
            }
        })
    } catch(err) {
        throw new BackendError("Error while updating user in database", 400, err)
    }

    res.send({})
})








// endpoint to send the username by email
router.post('/send-username', async function (req, res, next) {

    const template = req.body.template
    if(template == null) {
        throw new BackendError(`Template is missing`, 400)
    }

	const email = req.body.email ? req.body.email.trim() : undefined

	if (email == undefined || email.length <= 0 || EMAIL_REGEX.test(email) == false) {
		throw new BackendError("email is missing", 400)
	}

    let user = await usersStore.getUserByEmail(email)

    if(user == null) {
        res.send({})
        return
    }

    await Mailer.sendTransactionMail({
        to: {
            name: user.username,
            email: email
        },
        from: mailConfig.from,
        template: template,
        params: { username: user.username }
    })

    res.send({})
})







// endpoint to init activation reset (by admin using the user management)
router.post('/reset-activation-admin', [auth, isSuperuser], async function (req, res, next) {

    const template = req.body.template
    if(template == null) {
        throw new BackendError(`Template is missing`, 400)
    }

    // get params
	const username = req.body.username ? req.body.username.trim() : undefined
	const userid = req.body.id ? req.body.id.trim() : undefined
	const email = req.body.email ? req.body.email.trim() : undefined

    // check params
    if(!username) {
        throw new BackendError("Username is missing", 400)
    }

    if(!userid) {
        throw new BackendError("Userid is missing", 400)
    }

    if(!email) {
        throw new BackendError("Email is missing", 400)
    }

    const state = {
        id: 'ACTIVATION_RESET_PENDING',
        token: randHex(32),
        when: new Date(Date.now()).toISOString()
    }

    await usersStore.resetState(userid, username, state)

    await Mailer.sendTransactionMail({
        to: {
            name: username,
            email: email
        },
        from: mailConfig.from,
        template: template,
        params: { token: state.token }
    })

    return res.send({})
})







// endpoint to init password reset by user
router.post('/reset-password-user', async function (req, res, next) {
    
    const template = req.body.template
    if(template == null) {
        throw new BackendError(`Template is missing`, 400)
    }

    // get params
	const username = req.body.username ? req.body.username.trim() : undefined
	const email = req.body.email ? req.body.email.trim() : undefined

    // check params
    if(!username) {
        throw new BackendError("Username is missing", 400)
    }

    if(!email) {
        throw new BackendError("Email is missing", 400)
    }

    let user = await usersStore.getUserByUsername(username)

    if(user == null || user.email !== email) {
        res.send({})
        return
    }

    const state = {
        id: 'PASSWORD_RESET_PENDING',
        token: randHex(32),
        when: new Date(Date.now()).toISOString()
    }

    await usersStore.resetState(user._id, username, state)

    await Mailer.sendTransactionMail({
        to: {
            name: username,
            email: email
        },
        from: mailConfig.from,
        template: template,
        params: { token: state.token }
    })

    return res.send({})
})




// endpoint to init password reset (by admin using the user management)
router.post('/reset-password-admin', [auth, isSuperuser], async function (req, res, next) {

    // get params
	const username = req.body.username ? req.body.username.trim() : undefined
	const userid = req.body.id ? req.body.id.trim() : undefined
	const email = req.body.email ? req.body.email.trim() : undefined

    const template = req.body.template
    if(template == null) {
        throw new BackendError(`Template is missing`, 400)
    }

    // check params
    if(!username) {
        throw new BackendError("Username is missing", 400)
    }

    if(!userid) {
        throw new BackendError("Userid is missing", 400)
    }

    if(!email) {
        throw new BackendError("Email is missing", 400)
    }

    const state = {
        id: 'PASSWORD_RESET_PENDING',
        token: randHex(32),
        when: new Date(Date.now()).toISOString()
    }

    await usersStore.resetState(userid, username, state)

    await Mailer.sendTransactionMail({
        to: {
            name: username,
            email: email
        },
        from: mailConfig.from,
        template: template,
        params: { token: state.token }
    })

    return res.send({})
})








module.exports = router;
