const path = require('path')

const lodash = require('lodash')
const argon2 = require('argon2')

const randomHex = require('../../shared/misc/rand-hex')
const { randomUUID: uuidv4 } = require('crypto')

const database = require('../database/connector.js').connector
const mongoose = require('mongoose')
const { Types } = mongoose

const RedisConnection = require('../redis/RedisConnection')
const RedisMap = require('../redis/RedisMap')
const RedisObject = require('../redis/RedisObject')
const { useState } = require('react')

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

        await database.initPromise
        database.registerSchemesFromYML(schemes)

        await this.loadUsers()
        console.log("   - user cache initialized")
    }

    constructor() {
        this.initPromise = this.init()
    }

    async loadUsers() {

        const dbRes = await database.find(schemes[0].target)
        const users = dbRes.data

        // Hier keine komplette Userliste mehr im Redis ablegen, nur noch die maps der user by id, email, username usw.
        // this.users = new RedisObject(this.redis, 'users')
        // this.users.set(users)

        this.userById = new RedisMap(this.redis, 'userById')
        this.userByEmail = new RedisMap(this.redis, 'userByEmail')
        this.userByUsername = new RedisMap(this.redis, 'userByUsername')
        this.userByActivationToken = new RedisMap(this.redis, 'userByActivationToken')
        this.userByPasswordToken = new RedisMap(this.redis, 'userByPasswordToken')

        for(let user of users) {
            this.userById.set(user._id, user)
            this.userByEmail.set(user.email.toLowerCase(), user)
            this.userByUsername.set(user.username, user)
            if((user.state.id === 'ACTIVATION_PENDING' || user.state.id === 'ACTIVATION_RESET_PENDING') && user.state.token != null) {
                this.userByActivationToken.set(user.state.token, user)
            } else if(user.state.id === 'PASSWORD_RESET_PENDING' && user.state.token != null) {
                this.userByPasswordToken.set(user.state.token, user)
            }
        }
    }

    async relaodAll() {
        await this.loadUsers()
    }

    // DEPRECATED
    // Der Zugriff auf die Liste aller user sollte nicht mehr hierüber kommen, da diese Abfrage aus dem redis cache kommt.
    // Redis sollte hier nur verwendet werden, um user by id, email, token etc. für login und ähnliches zu holen
    // async getAllUsers() {
    //     return await this.users.get()
    // }

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

    async insertUser(user) {
        await database.insert('CORE_users', user)
        await this.loadUsers()
    }

    async deleteUser(id, username, email) {
        await database.deleteOne('CORE_users', {_id: id, username: username, email: email})
        await this.loadUsers()
    }


    async updateUserById(id, user) {
        await database.findOneAndUpdate('CORE_users', { fields: '', filter: { _id: id } }, user)
        await this.loadUsers()

        /*
        try {
        } catch(err) {
            console.log("ERROR ERROR ERROR")
            console.log(err)
        }
        */
    }



    async resetState(id, username, state) {
        await database.findOneAndUpdate('CORE_users', { fields: '', filter: { _id: id, username: username } }, {state: state})
        await this.loadUsers()
    }




    /*
    async updatePassword(userid,password) {
        let hash = await argon2.hash(password)
        await database.findByIdAndUpdate(schemes.users, userid, { password: hash })
    }
    */

    
}

module.exports = new Users()

