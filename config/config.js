const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const lodash = require('lodash')

// A simple config module.

const config_path = process.env['INSTANCE_CONFIG_PATH']

if(config_path == null) {
    console.error("FATAL ERROR: No config path given")
    return process.exit(1)
}

if(fs.existsSync(config_path) == false) {
    console.error(`FATAL ERROR: Config path does not exist ('${config_path}')`)
    return process.exit(1)
}

if(fs.existsSync(path.resolve(config_path, 'default.yml')) == false) {
    console.error(`FATAL ERROR: Config file default.yml does not not exist in path '${config_path}'`)
    return process.exit(1)
}

const load = file => {
    try {
        return yaml.load(fs.readFileSync(path.resolve(config_path, file), 'utf8'))
    } catch (e) {
        return undefined
    }
}

const config = lodash.merge({}, load('default.yml'))                                            // load default config file

const profile = process.env['PROFILE'] ? process.env['PROFILE'] : 'default'                     // get profile ('default' if missing)
const profileConfig = load('profile_' + profile + '.yml')                                       // load config for specific profile

lodash.merge(config, profileConfig)                                                             // merge porfile specific config into default config

lodash.merge(process.env, config.env)                                                           // merge ENV variables from config into process.env
delete config.env                                                                               // remove ENV variables from config

if(process.env['NODE_ENV'] == null) {
    process.env['NODE_ENV'] = 'development'                                                     // always set NODE_ENV to 'developement' if not defined through config or command line
}

config.profile = profile                                                                        // set profile field

module.exports = config                                                                         // export config





