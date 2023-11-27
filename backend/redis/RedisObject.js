class RedisObject {
    
    constructor(redis, name) {
        this.redis = redis
        this.name = name
    }

    async set(value)  {
        await this.redis.set(this.name, JSON.stringify(value))
    }

    async get() {
        return JSON.parse(await this.redis.get(this.name))
    }
}

module.exports = RedisObject
