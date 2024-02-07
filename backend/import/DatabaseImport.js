
const Report =  require("./Report")
const BackendError = require("../util/BackendError")

const db = require('../database/connector').connector
const users = require('../users/manager')

const lodash = require('lodash')

const { v4: uuidv4 } = require('uuid')

const performColumnMapping = (record,mapping) => {
}

class DatabaseImport {

    constructor() {
    }

    async importVariants(variants) {

        if(variants == null || lodash.isArray(variants) === false) {
            return
        }

        for(let variant of variants) {

            let dbRes = await db.find('GRID_variants', { filter: { _id: variant._id }})
            let item = dbRes?.data?.[0]

            if(item != null) {

                // schon vorhanden
                let check =
                    item._id === variant._id &&
                    item.GRCh37.gDNA === variant.GRCh37.gDNA &&
                    item.GRCh37.build === variant.GRCh37.build &&
                    item.GRCh37.chr === variant.GRCh37.chr &&
                    item.GRCh37.pos === variant.GRCh37.pos &&
                    item.GRCh37.ref === variant.GRCh37.ref &&
                    item.GRCh37.alt === variant.GRCh37.alt &&
                    item.GRCh38.gDNA === variant.GRCh38.gDNA &&
                    item.GRCh38.build === variant.GRCh38.build &&
                    item.GRCh38.chr === variant.GRCh38.chr &&
                    item.GRCh38.pos === variant.GRCh38.pos &&
                    item.GRCh38.ref === variant.GRCh38.ref &&
                    item.GRCh38.alt === variant.GRCh38.alt

                if(check === false) {

                    // nicht identisch
                    let msg = `Variant with id '${variant._id}' already exist but differs from the variant to be imported. Existing variant: ${JSON.stringify(item)}. Variant to be uploaded: ${JSON.stringify(variant)}.`
                    throw new Error(msg)

                } else {
                    // variante für diese id existiert schon und ist identisch
                }
    
            } else {

                // variante existiert noch nicht und wird eingefügt
                await db.insert('GRID_variants',variant)
            }
        }
    }

    async importRecords(records) {

        await db.initPromise
        await users.initPromise

        for(let record of records) {

            record.state = {
                ...record.state,
                importSuccessful: false
            }

            if(record.report.hasErrors() === false) {

                // sollte der case später nicht eingefügt werden können, es es trotzdem ok, die eingefügten varianten zu behalten,
                // da diese verifizierten variant validator ausgaben entsprechen und der datenbank nicht schaden

                try {
                    await this.importVariants(record.parsedVariants)
                } catch(err) {
                    record.report.addImportError(err.message)
                    continue
                }

                // import case
                const internalCaseId = record.genericCase.internalCaseId
                const sequencingLab =  record.genericCase.sequencingLab

                if(internalCaseId == null || sequencingLab == null) {
                    record.report.addImportError(`Unexpected Error. internalCaseId or sequencingLab is missing. internalCaseId is '${internalCaseId}'. sequencingLab is ${sequencingLab}`)
                    continue
                }

                let dbRes = await db.find('GRID_cases', { filter: { internalCaseId: internalCaseId, sequencingLab: sequencingLab }})
                let existingCase = dbRes?.data?.[0]

                if(existingCase == null) {
                    record.genericCase._id = uuidv4()
                    try {
                        await db.insert('GRID_cases', record.genericCase)
                    } catch(err) {
                        record.report.addImportError(`Unexcpected error while inserting new case into database. Message is '${err.message}'`)
                        continue
                    }

                    record.state = {
                        ...record.state,
                        importSuccessful: true
                    }
                    
                } else {

                    // DIESER UPDATE MECHANISMUS SCHEINT SOWEIT ZU FUNKTIONIEREN
                    
                    let i = 0
                    for(let variantEntry of record.genericCase['variants'] ) {
                        let found = []
                        let variantId = variantEntry.variant.reference
                        for(let existingVariantEntry of existingCase['variants']) {
                            let existingVariantId = existingVariantEntry.variant.reference
                            if(variantId === existingVariantId) {
                                found.push(existingVariantEntry._id)
                            }
                        }
                        if(found.length === 1) {
                            variantEntry._id = found[0]
                        } else if(found.length > 1) {
                            record.report.addImportError(`Ambigious variant row mapping between update and existing record. Variant id is ${variantId}. Mapped array items are ${found}.`)
                            continue
                        } else {
                            // die variant id konnte keinem array eintrag zugeordnet werden, ist also nicht vorhanden und wird durch das update neu eingetragen
                        }
                    }

                    // TODO
                    // bei keep muss man gar nichts machen, alles wird behalten
                    // bei delete muss man alle pfade durchgehen und bei nicht vorhandenen werten muss ein undefined gesetzt werden, dass sollte dann den wert entfernen??

                    try {
                        await db.findOneAndUpdate('GRID_cases', { filter: { _id: existingCase._id } }, record.genericCase)

                        record.state = {
                            ...record.state,
                            importSuccessful: true
                        }
                    } catch(err) {
                        record.report.addImportError(`Unexcpected error while updating existing case in database. Message is '${err.message}'`)
                        continue
                    }
                }

            }

        }



    }
}

module.exports = {
    createInstance: () => {
        return new DatabaseImport()
    }
}



        // TODO:
        // DAS COMPE HET CHECKING


        // IMPORT:

        // für alle variants: prüfen ob variant vorhanden? wenn nein, importieren (die kann man impirtiert lassen, selbst wenn der case import fehlschlägt)
        // prüfen ob der case schon vorhanden ist

        // wenn nein, import, wenn ja, muss ein update konstruiert werden WICHTIG ist hier zu verstehen, wie das variant array dabei geupdatet wird
        // 1. neue variants, 
        // 2. update in vorhandenen variants spalten.
        // WICHTIG: Die schon vorhandenen array entries haben eine objekt id. Wenn also ein update passiert, dann muss diese id im update object stehen
        // wie soll man das aber zuordnen? die variant id ist die einzige möglichkeit
        // HIER GIBT ES EIN GROßES PROBLEM, WEIL DAS NICHT eindeutig ist, wenn man keine variant id hat
        // variant id, gene, transcript, eines von denen muss vorhanden sein (bei update) sonst lässt sich das nicht zuordnen
        // man könnte auch noch sagen: Solange nur ein array eintrag vorhanden ist, dann handelt es sich immer um diesen einen vorhandenen eintrag!
