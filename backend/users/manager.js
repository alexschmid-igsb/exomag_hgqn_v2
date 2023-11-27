const path = require('path')

const lodash = require('lodash')
const argon2 = require('argon2')

const randomHex = require('../../shared/misc/rand-hex')
const { randomUUID: uuidv4 } = require('crypto')

const db = require('../database/connector.js').connector
const mongoose = require('mongoose')
const { Types } = mongoose

const RedisConnection = require('../redis/RedisConnection')
const RedisMap = require('../redis/RedisMap')
const RedisObject = require('../redis/RedisObject')

const schemes = [
    {
        target: 'CORE_users',
        file: path.resolve(__dirname, 'scheme_user.yml')
    }
]

class Users {

    async init() {

        await RedisConnection.initPromise
        this.redis = RedisConnection.getClient()

        await db.initPromise
        db.registerSchemesFromYML(schemes)

        await this.loadUsers()
        console.log("   - user cache initialized")
    }

    constructor() {
        this.initPromise = this.init()
    }

    async loadUsers() {

        const dbRes = await db.find(schemes[0].target)
        // const dbRes = await db.find('CORE_users')
        const users = dbRes.data

        // console.log(users)
        // console.log(await argon2.hash('123'))
        // process.exit(1)

        this.users = new RedisObject(this.redis, 'users')
        this.users.set(users)

        this.userById = new RedisMap(this.redis, 'userById')
        this.userByEmail = new RedisMap(this.redis, 'userByEmail')
        this.userByUsername = new RedisMap(this.redis, 'userByUsername')
        this.userByActivationToken = new RedisMap(this.redis, 'userByActivationToken')
        this.userByPasswordToken = new RedisMap(this.redis, 'userByPasswordToken')

        for(let user of users) {
            this.userById.set(user._id, user)
            this.userByEmail.set(user.email.toLowerCase(), user)
            this.userByUsername.set(user.username, user)
            if(user.state.id === 'ACTIVATE' && user.state.token != null) {
                this.userByActivationToken.set(user.state.token, user)
            }
            else if(user.state.id === 'RESET_PASSWORD' && user.state.token != null) {
                this.userByPasswordToken.set(user.state.token, user)
            }
        }
    }

    async relaodAll() {
        await this.loadUsers()
    }

    async getAllUsers() {
        return await this.users.get()
    }

    async getUserById(id) {
        if(this.userById != undefined) {
            return await this.userById.get(id)
        } else {
            return undefined
        }
    }

    async getUserByEmail(email) {
        if(this.userByEmail != undefined) {
            return await this.userByEmail.get(email.toLowerCase())
        } else {
            return undefined
        }
    }

    async getUserByUsername(username) {
        if(this.userByUsername != undefined) {
            return await this.userByUsername.get(username)
        } else {
            return undefined
        }
    }

    async getUserByActivationToken(token) {
        if(this.userByActivationToken != undefined) {
            return await this.userByActivationToken.get(token)
        } else {
            return undefined
        }
    }

    async getUserByPasswordToken(token) {
        if(this.userByPasswordToken != undefined) {
            return await this.userByPasswordToken.get(token)
        } else {
            return undefined
        }
    }






    // TODO: alter code? Muss angepasst werden?


    /*
    validateUser(user) {
        // ???
    }


    async addUser(user) {

        this.validateUser(user)

        user.state = {
            id: 'CREATED',
            when: Date.now(),
            token: randHex(32),
            test1: new Types.ObjectId(),
            test2: uuidv4()
        }

        let result = await db.insert(schemes.users, user)
        return result
    }

    async updatePassword(userid,password) {
        let hash = await argon2.hash(password)
        await db.findByIdAndUpdate(schemes.users, userid, { password: hash })
    }

    */





    // TODO: MUSS ALLES AUF MONGOOSE ANGEPASST WERDEN

    /*
    async insertUser(user) {
        await knex('users').insert([user])
        await this.updateUsers()
    }

    async resetActions(id, username, actions) {
        await knex('users').where({id: id, username: username}).update({ actions: actions })
        await this.updateUsers()
    }

    async deleteUser(id, username) {
        await knex('users').where({id: id, username: username}).del()
        await this.updateUsers()
    }

    async updateUserById(id, user) {
        // console.log("update user")
        // console.log(user)
        await knex('users').where({id: id}).update(user)
        await this.updateUsers()
    }
    */
    
}

module.exports = new Users()

