
const mongoose = require('mongoose')
const { Schema, SchemaTypes, Types } = mongoose
// const { Types: SchemaTypes } = Schema

const mongodb = require('mongodb')
const bson = require('bson')
const os = require('os')

const config = require('../../config/config')
const lodash = require('lodash')

const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')


const { randomUUID: uuidv4 } = require('crypto')



// const debug = true
const debug = false









function postprocessLeanObjects(obj) {
    if(lodash.isArray(obj)) {
        for(let element of obj) {
            postprocessLeanObjects(element)
        }
    } else if(lodash.isObject(obj)) {

        for(const [key, value] of Object.entries(obj)) {

            // TYPE INFOS
            // mongoose.Types.ObjectId (EXTENDS mongodb.ObjectId EXTENDS bson.BSONValue)
            // bson.UUID (EXTENDS bson.Binary EXTENDS bson.BSONValue)
            // BSONValue ist der Basistyp

            if(value instanceof Date) {
                obj[key] = value.toISOString()
            } else if(value instanceof Types.ObjectId) {
                obj[key] = value.toString()
            } else if(value instanceof bson.UUID) {
                obj[key] = value.toString()
            } else if(value instanceof bson.Binary && value.sub_type === bson.Binary.SUBTYPE_UUID) {
                obj[key] = value.toUUID().toString()
            } else {
                postprocessLeanObjects(value)                
            }
        }
    }
}











/*
function targetErrMsg(target) {
    return `${os.EOL}TARGET [ collection: '${target.collection ? target.collection : 'null'}', scheme: '${target.scheme ? target.scheme : 'null'}' ]`
}
*/

function itemErrMsg(item) {
    return `${os.EOL}ITEM [${JSON.stringify(item)}]` 
}

function targetErrMsg(target) {
    return `${os.EOL}TARGET [${JSON.stringify(target)}]` 
}












function schemeMapping(genericScheme) {
    if (typeof genericScheme !== 'object') {
        return null
    }

    let mappedScheme = null

    if (typeof genericScheme.type === 'string') {

        switch (genericScheme.type) {

            case 'UUID':
                mappedScheme = {
                    type: SchemaTypes.UUID
                }
                break

            case 'ObjectID':
                mappedScheme = {
                    type: SchemaTypes.ObjectId
                }
                break

            case 'string':
                mappedScheme = {
                    type: SchemaTypes.String
                }
                break

            case 'integer':
                mappedScheme = {
                    type: SchemaTypes.Number
                }
                break

            case 'decimal':
                mappedScheme = {
                    type: SchemaTypes.Number
                }
                break

            case 'timestamp':
                mappedScheme = {
                    type: SchemaTypes.Date
                }
                break

            case 'date':
                mappedScheme = {
                    type: SchemaTypes.Date
                }
                break
    
            case 'boolean':
                mappedScheme = {
                    type: SchemaTypes.Boolean
                }
                break

            case 'buffer':
                mappedScheme = {
                    type: SchemaTypes.Buffer
                }
                break

            case 'any':
                mappedScheme = {
                    type: SchemaTypes.Mixed
                }
                break
        }

        if(lodash.isString(genericScheme.reference)) {
            mappedScheme.ref = genericScheme.reference
        }

        // generic <==> mongoose
        // index <==> index (muss nicht unique sein)
        // unique <==> unique index
        // es gibt kein unique feld, welches nicht auf indiziert ist
        if(genericScheme.unique === true) {
            mappedScheme.unique = true
        } else if(genericScheme.index === true) {
            mappedScheme.index = true
        }

        if(genericScheme.required === true) {
            mappedScheme.required = true
        }

    } else if (Array.isArray(genericScheme)) {
        if (genericScheme.length < 1) {
            throw new Error('ERROR: No array item defined')
        }
        let arrayType = genericScheme[0]
        let arrayTypeMapped = schemeMapping(arrayType)
        if (arrayTypeMapped != null) {
            mappedScheme = [arrayTypeMapped]
        }
    } else {
        mappedScheme = {}
        for (let [propName, propValue] of Object.entries(genericScheme)) {
            let mappedProp = schemeMapping(propValue)
            if (mappedProp != null) {
                mappedScheme[propName] = mappedProp
            }
        }
    }

    return mappedScheme
}











class Connector {
    // ASYNC MODULE INIT PATTERN

    // Für die async inits wird  im constructor eine anonyme async function erzeugt und aufgerufen. Dieser Aufruf liefert
    // einen promise der gespeichert wird.

    // Falls andere module von dem aktuellen module abhängen, dann können diese wiederum in ihrer async init auf die
    // initialisierung des aktuellen modules warten. Ebenso kann der Hauptstrang der Applikation in der init phase
    // auf die initialisierung aller relevanten module warten.

    constructor(config) {

        let self = this
        this.config = config
        this.state = new Map()

        this.initPromise = ( async () => {

            const options = {}

            const str = `mongodb://${self.config.user}:${encodeURIComponent(self.config.password)}@${self.config.host}:${self.config.port}/${self.config.database}`
            self.connection = await mongoose.createConnection(str, options).asPromise()
            console.log('   - connected to database')

            await this.loadSchemes()

        }) ()
    }

    

    async loadSchemes() {
        let fromStatic = []
        fs.readdirSync(path.join(__dirname, 'schemes/static')).forEach( file => {
            if(file.endsWith('.yml')) {
                let target = file.substring(0,file.length-4)
                fromStatic.push({ target: `STATIC_${target}`, file: path.resolve(__dirname, 'schemes/static', file) })
            }
        })
        this.registerSchemesFromYML(fromStatic)

        let gridDesc = require('./grids.json')
        let fromGrid = []
        for(let grid of gridDesc) {
            let target = grid.id
            let file = path.resolve(__dirname, 'schemes/grids', `${target}.yml`)
            if(fs.existsSync(file) == false) {
                throw new Error(`scheme file does not exist: ${file}`)
            }
            fromGrid.push({
                target: `GRID_${target}`,
                file: file
            })
        }
        this.registerSchemesFromYML(fromGrid)
    }







    async disconnect () {
        // await this.connection.close({ force: true })
        await this.connection.close()
    }








    // SCHEME AND MODEL MANAGEMENT
    registerSchemesFromYML(descriptions) {
        if(lodash.isArray(descriptions) === false) {
            descriptions = [descriptions]
        }
        for(const desc of descriptions) {
            const target = desc.target
            let content = yaml.load(fs.readFileSync(desc.file, 'utf8')) 
            this.registerScheme(target, content.scheme, content.layouts, desc.file)
        }
    }


    registerScheme(target, schemeDescription, layouts={}, file=null) {

        console.log(`   - register scheme [${target}${file != null ? ', ' + file : ''}]`)

        let entry = this.state.get(target)
        if(entry == null) {
            entry = {
                target: target,
                scheme: null,
                model: null,
                file: file
            }
            this.state.set(target,entry)
        }

        if(entry.scheme == null || lodash.isEqual(entry.scheme.schemeDescription, schemeDescription) == false) {

            // scheme neu erstellen
            let copy = lodash.cloneDeep(schemeDescription)                                      // immer eine kopie des generic scheme verwenden um veränderung von außen über die reference zu verhindern
            let mongooseSchemeDescription = this.translateSchemeDescription(copy)               // scheme nach mongoose übersetzen
            let mongooseScheme = new Schema(mongooseSchemeDescription)

            entry.scheme = {
                target: target,
                schemeDescription: copy,
                mongooseSchemeDescription: mongooseSchemeDescription,
                mongooseScheme: mongooseScheme,
                layouts: layouts
            }

            // model neu erstellen
            entry.model = this.connection.model(target, mongooseScheme, target)

            if(debug) {
                console.log()
                console.log('GENERIC SCHEME')
                console.dir(copy, { depth: null })
                console.log('TRANSLATED SCHEME')
                console.dir(mongooseSchemeDescription, { depth: null })
            }
        }

        // update referenced schemes
        this.updateReferencedSchemes()
    }


    translateSchemeDescription(schemeDescription) {

        let translatedSchemeDescription = schemeMapping(schemeDescription)

        // set default _id entry if missing
        if(translatedSchemeDescription._id == null) {
            translatedSchemeDescription._id = {
                type: SchemaTypes.UUID
            }
        }   

        // set default value for common _id types
        if(translatedSchemeDescription._id.type === SchemaTypes.UUID) {
            translatedSchemeDescription._id.default = () => uuidv4()
        } else if(translatedSchemeDescription._id.type === SchemaTypes.ObjectId) {
            translatedSchemeDescription._id.default = () => new SchemaTypes.ObjectId()
        }

        // console.dir(translatedSchemeDescription, { depth: null })
        return translatedSchemeDescription
    }

    
    getModel(target) {
        const entry = this.state.get(target)
        if(entry == null || entry.model == null) {
            throw new Error(`could not find model${targetErrMsg(target)}`)
        }
        return entry.model
    }


    getScheme(target) {
        const entry = this.state.get(target)
        if(entry == null || entry.scheme == null) {
            throw new Error(`could not find scheme${targetErrMsg(target)}`)
        }
        return entry.scheme
    }






    updateReferencedSchemes() {

        const traverse = (parent,indent) => {

            let node

            if(lodash.isArray(parent) === true && lodash.isObject(parent[0]) === true) {
                node = parent[0]
            } else if(lodash.isObject(parent) === true) {
                node = parent
            } else {
                return
            }

            if(lodash.isString(node.type)) {
                if(lodash.isString(node.reference)) {
                    let referencedScheme = this.state.get(node.reference)?.scheme?.schemeDescription
                    if(referencedScheme != null) {
                        node.referencedScheme = referencedScheme
                    }
                }
            } else {
                for(let [key,child] of Object.entries(node)) {
                    traverse(child,indent+3)
                }
            }
        }

        for(let [id,entry] of this.state.entries()) {
            traverse(entry.scheme.schemeDescription, 0)
        }
    }






    // DATABASE ABSTRACTION LAYER

    // params
    //    fields gibt bei select queries die felder an (analog zu mongodb/mongoose query)
    //    selector soll den auswahl filter (analog zu mongodb/mongoose?) ermöglichen
    //    order by, wie?



    /*
    async find(target,params) {
        let { model } = this.getModel(target)
        try {
            let result = await model.find().lean()
            postprocessLeanObjects(result)                
            return result
        } catch(error) {
            throw new Error(`could not execute find query${targetErrMsg(target)}`, { cause: error })
        }
    }
    */


    prepareParams(params) {

        if(lodash.isObject(params) === false) {
            params = {}
        }

        if(lodash.isObject(params.filter) === false) {
            params.filter = {}
        }

        if(lodash.isString(params.fields) === false) {
            params.fields = ''
        }

        if(lodash.isObject(params.sort) === false) {
            params.sort = {}
        }

        let isPopulateValid = true
        if(params.populate == null) {

            params.populate = []
            
        } else if(lodash.isString(params.populate) === true) {

            // Ein einfacher string wird als pfad interpretiert, der an populate übergeben werden soll.
            // Das ganze wird in ein array umgebaut, damit später keine falunterscheidung mehr notwendig ist und 
            // einfach .populate(params.populate) aufgerufen werden kann
            params.populate = [params.populate]

        } else if(lodash.isArray(params.populate)) {

            // es liegt ein array vor

            if(lodash.every(params.populate, lodash.isString)) {

                // Ein array of strings wird als mehrere pfade interpretiert, die alle an populate übergeben werden sollen
                // Das ganze muss umformatiert werden, damit es von mongoose akzeptiert wird. Ein array mit zwei strings
                // wird von mongoose üblicherweise als ['<pfad>', '<field select syntax>'] interpretiert, was hier aber
                // nicht gewollt ist
                params.populate = params.populate.map(path => ({ path }))

            } else if(lodash.every(params.populate,lodash.isObject)) {

                // in diesem fall sollte ein array von objects vorliegen, bei dem multiple populates über
                // das format { <path>, <field select>, etc. } definiert werden. Hier kann man jetzt noch den syntax
                // prüfen
                isPopulateValid = lodash.every(params.populate, item => {
                    return lodash.isString(item.path) && (item.select == null || lodash.isString(item.select))
                })

            } else {
                
                // kein valides params.populate array format
                isPopulateValid = false

            }

        } else if(lodash.isObject(params.populate)) {

            // wie oben: das object muss dem format { <path>, <field select>, etc. } entsprechen
            isPopulateValid = lodash.isString(params.populate.path) && (params.populate.select == null || lodash.isString(params.populate.select))

        } else {

            // kein valider params.populate type
            isPopulateValid = false

        }

        if(isPopulateValid === false) {
            throw new Error(`Wrong params.populate format ${os.EOL}       ${JSON.stringify(params.populate)}`)
        }

        return params
    }


    async find(target, params) {
        let model = this.getModel(target)
        let scheme = this.getScheme(target)

        params = this.prepareParams(params)
        // console.log(params)

        try {

            let result = {
                scheme: {
                    definition: scheme.schemeDescription,
                    layouts: scheme.layouts
                },
                data: null
            }

            let data = await model.find(params.filter, params.fields).sort(params.sort).lean().populate(params.populate)

            postprocessLeanObjects(data)

            result.data = data
            
            return result

        } catch(error) {
            throw new Error(`could not execute find query${targetErrMsg(target)}`, { cause: error })
        }
    }




    

    async findOneAndUpdate(target, params, update) {
        let model = this.getModel(target)
        let scheme = this.getScheme(target)

        params = this.prepareParams(params)

        try {

            let result = {
                scheme: {
                    definition: scheme.schemeDescription,
                    layouts: scheme.layouts
                },
                data: null
            }
            
            let data = await model.findOneAndUpdate(
                params.filter,
                update,
                {
                    fields: params.fields,
                    returnDocument: 'after'
                }).lean().populate(params.populate)

            postprocessLeanObjects(data)

            result.data = data
            
            return result

        } catch(error) {
            console.log(error)
            throw new Error(`could not execute findOneAndUpdate query${targetErrMsg(target)}`, { cause: error })
        }
    }









    async insert(target,item) {

        // when inserting new items, there must be no id present in the item
        // if(item._id != null) {
        //     throw new Error(`the item to be inserted already has an id${targetErrMsg(target)}${this.itemErrMsg(item)}`)
        // }

        // get model (throws on error)
        let model = this.getModel(target)

        try {

            // model.create(docs) is a Shortcut for saving one or more documents to the database. It does new model(doc).save()
            // for every doc in docs. This function triggers the following middleware: save()
            let inserted = (await model.create(item)).toObject()

            // return the inserted item as reproted from the database (assigend id can be fetched from this)
            postprocessLeanObjects(inserted)
            return inserted            

        } catch(error) {
            throw new Error(`could not insert new item into database: ${targetErrMsg(target)}`, { cause: error })
        }
    }





    async insertOne(target,item) {
        // get model (throws on error)
        let model = this.getModel(target)

        try {
            model.collection.insertOne(item)

        } catch(error) {
            throw new Error(`could not insert new item into database: ${targetErrMsg(target)}`, { cause: error })
        }
    }









    async findByIdAndUpdate(target, id, update) {
        let model = this.getModel(target)
        try {
            await model.findByIdAndUpdate(id,update)
        } catch(error) {
            throw new Error(`could not update by id ${targetErrMsg(target)}${itemErrMsg(update)}`, { cause: error })
        }
    }

    
    

    async deleteAll(target) {
        let model = this.getModel(target)
        try {
            await model.deleteMany({})
        } catch(error) {
            throw new Error(`error`, { cause: error })
        }
    }




    async deleteOne(target,fields) {
        let model = this.getModel(target)
        try {
            await model.deleteOne(fields)
        } catch(error) {
            throw new Error(`error`, { cause: error })
        }
    }

    


    /*
    TODO: der allgemeinere Fall basiert auf dem allgemeine selector
    async findOneAndUpdate(target, selector, data) {

        let { model } = this.getModel(target)

        try {
            await model.findOneAndUpdate()

            let result = await model.find().lean()
            postprocessLeanObjects(result)                
            return result
        } catch(error) {
            throw new Error(`could not execute find query${targetErrMsg(target)}`, { cause: error })
        }


        

        
    }
    */



    


}




const instance = new Connector(config.mongo)

module.exports = {
    connector: instance
}
