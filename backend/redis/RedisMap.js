class RedisMap {
    
    constructor(redis, name) {
        this.redis = redis
        this.redis.del(name)
        this.name = name
    }

    async set(key, value)  {
        await this.redis.hSet(this.name, key, JSON.stringify(value))
    }

    async get(key) {
        return JSON.parse(await this.redis.hGet(this.name, key))
    }
}

module.exports = RedisMap
