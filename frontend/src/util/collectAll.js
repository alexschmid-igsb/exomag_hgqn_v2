
const lodash = require('lodash')

function resolveArray(array,depth,path,result) {
    if(lodash.isArray(array) === false) {
        return
    }
    for(let [index,item] of array.entries()) {
        if(depth <= 1) {
            if(item != null) {
                result[path+'['+index+']'] = item
            }
        } else {
            if(lodash.isArray(item) === true) {
                resolveArray(item,depth-1,path+'['+index+']',result)
            }
        }
    }
}

function traverse(obj, path, pos, current, result) {

    const pathNode = path[pos]

    if(obj == null || lodash.isString(pathNode.prop) === false) {
        return
    }

    const value = obj[pathNode.prop]

    if(pathNode.arrayDepth > 0) {

        // array 

        let arrayResult = {}
        resolveArray(value,pathNode.arrayDepth,'',arrayResult)

        if(pos >= path.length-1) {
            for(let [key,item] of Object.entries(arrayResult)) {
                result[current + (pos===0 ? '' : '.') + pathNode.prop + key] = item
            }
        } else {
            for(let [key,item] of Object.entries(arrayResult)) {
                traverse(item, path, pos+1, current + (pos===0 ? '' : '.') + pathNode.prop + key, result)
            }
        }

    } else {

        // no array

        if(pos >= path.length-1) {
                result[current + '.' + pathNode.prop] = value
        } else {
            traverse(value, path, pos+1, current + (pos===0 ? '' : '.') + pathNode.prop, result)
        }
    }

}

function resolve(obj, path, result) {
    traverse(obj, path, 0, '', result)
}

function collectAll(obj, pathStrings) {

    if (obj == null || (lodash.isArray(pathStrings) === false && (lodash.isString(pathStrings) === false || pathStrings.length <= 0))) {
        return {}
    }

    if (lodash.isArray(pathStrings) === false) {
        pathStrings = [pathStrings]
    }

    let result = {}

    for (const pathString of pathStrings) {

        if (lodash.isString(pathString) === false) {
            continue
        }

        const parts = pathString.split('.')

        if (lodash.isArray(parts) === false || parts.length <= 0) {
            return {}
        }

        let pathIsValid = true
        let path = []

        for (let prop of parts) {

            if (lodash.isString(prop) === false || prop.length <= 0) {
                return {}
            }

            let arrayDepth = 0

            while(prop.length>0 && prop.endsWith('[]')) {
                arrayDepth++
                prop = prop.substring(0, prop.length - 2)
            }

            if (prop.length <= 0) {
                pathIsValid = false
            }

            path.push({ prop, arrayDepth })
        }

        if(pathIsValid === false) {
            continue
        }

        resolve(obj,path,result)
    }

    return result
}

// module.exports = collectAll

export default collectAll