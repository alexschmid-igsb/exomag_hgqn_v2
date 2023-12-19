
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


/*

    generisches schemes format
  	    - soll zentral definiert sein, um die datenquelle zu definieren
            --> datenbank
            --> aggrid
            --> usw
        - ich brauche nur das generische datenformat




    TODO:
        * linkings und subdocument definieren, wie?

        * register file, track file changes
          https://thisdavej.com/how-to-watch-for-files-changes-in-node-js/
          DIE PACKAGE LÖSUNG WÄHLEN



        * instance methods, was kann man damit machen?
        * static methods
        * query helpers
        * 


                  // references/links
        // Maps


        Für unterdokumnte gibt es drei möglichkeiten:
          path, nested schemas, subdocumsntes


            In Mongoose sind subschemas möglich. Hier werden schemas angelegt, welche dann für einen Pfad verwendet werden können.
            Aber das sind keine Links oder references auf andere collecitons, glaube ich. Das dient einfach nur, wenn man ein
            sub schema wiederholt anwenden möchte.
            Eventuell sollte man dieses Feature auch auf generischer ebenen zur verfügung stellen





            TODO PRODUCTION
            https://thecodebarbarian.com/slow-trains-in-mongodb-and-nodejs

        






            DOCUMENTS ERSTELLEN

            Verschiedne mögliche wege:

            const Tank = mongoose.model('Tank', yourSchema);


            1. 

            const small = new Tank({ size: 'small' });
            small.save(function(err) {
                if (err) return handleError(err);
                // saved!
            });
            
            oder
            
            await small.save()



            2. 

            Tank.create({ size: 'small' }, function(err, small) {
                if (err) return handleError(err);
                // saved!
            });

            oder 

            await Tank.create({ size: 'small' }



            // or, for inserting large batches of documents     
            Tank.insertMany([{ size: 'small' }], function(err) {
            });

            oder 

            await Tank.insertMany([...])


            
            Mit den den ganzen validation options und dem nötigen fehlerhandling
            ist es klar, dass man das wegabstrahieren sollte und eine möglichst einfaches interface
            bauen sollte

*/











// HANDLING VON IDs

// Die Kommunikation und die Darstellung auf Frontend Seite basiert auf strings, deswegen sollten UUIDs und ObjectIDs 
// praktischerweise aufEbene der Databenkabstraktion in strings umgewandelt und wieder zurückgeparst werden.
// Auch wenn es nicht zu hundertprozent effizent ist, sollte man u.a. aus Gründen der Lesbarkeit keine binary buffers
// durch die Gegend schicken und anzeigen müssen.



/*
function idToString(doc, obj, options) {
    console.dir(doc, { depth: null })
    console.dir(obj, { depth: null })
    return obj
}
*/









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




    async find(target, params = {}) {
        let model = this.getModel(target)
        let scheme = this.getScheme(target)

        let populateParams = params.populate ? params.populate : []

        try {

            let result = {
                scheme: {
                    definition: scheme.schemeDescription,
                    layouts: scheme.layouts
                },
                data: null
            }

            let data = await model.find(params.filter, params.fields).sort(params.sort).lean().populate(...populateParams)

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

        let paramsPopulate = params.populate ? params.populate : []
        let paramsFilter = params.filter ? params.filter: {}
        let paramsFields = params.fields ? params.fields : ''

        try {

            let result = {
                scheme: {
                    definition: scheme.schemeDescription,
                    layouts: scheme.layouts
                },
                data: null
            }
            
            let data = await model.findOneAndUpdate(
                paramsFilter,
                update,
                {
                    fields: paramsFields,
                    returnDocument: 'after'
                }).lean().populate(...paramsPopulate)

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
        if(item._id != null) {
            throw new Error(`the item to be inserted already has an id${targetErrMsg(target)}${this.itemErrMsg(item)}`)
        }

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
