
const Report =  require("../Report")
const BackendError = require("../../util/BackendError")
const FetchAPI = require('../FetchAPI')

const lodash = require('lodash')

// create the base object to apply all the sucessive processing steps on
const createEmptyRecord = () => {
    return {
        targetFields: [],
        excel: null,
        generic: null,
        report: Report.createInstance()
    }
}





async function vvQuery(build,variant,transcripts = 'all') {
    // const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    // const url = `https://rest.variantvalidator.org/VariantValidator/variantvalidator/${build}/${variant}/${transcripts}`
    // const url = `http://localhost:8000/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`

    const url = `https://exomag.meb.uni-bonn.de/vv/VariantValidator/variantvalidator/${encodeURI(build)}/${encodeURI(variant)}/${encodeURI(transcripts)}`
    console.log(url)
    return FetchAPI.get(url)
}




const parseInteger = any => {
    if(lodash.isString(any)) {
        if(/^[-+]?\d+$/.test(any) === true) {
            return parseInt(any)
        }
    } else {
        if(Number.isInteger(any) === true) {
            return any
        }
    }
    return null
}




const prepareScheme = scheme => {

    let fields = {
        case: {},
        variant: {}
    }

    const traversal = (node, path) => {
        for(let [key,entry] of Object.entries(node)) {
            let childPath = path == null ? key : path + '.' + key
            if(lodash.isArray(entry) && entry.length === 1 && lodash.isObject(entry[0])) {
                if(lodash.isString(entry[0].type)) {
                    if(childPath.startsWith('variants.')) {
                        fields.variant[childPath.substring('variants.'.length)] = { ...entry[0], isArrayType: true }

                    } else {
                        fields.case[childPath] = { ...entry[0], isArrayType: true }
                    }
                } else {
                    traversal(entry[0], childPath)
                }
            } else if(lodash.isObject(entry)) {
                if(lodash.isString(entry.type)) {
                    if(childPath.startsWith('variants.')) {
                        fields.variant[childPath.substring('variants.'.length)] = entry

                    } else {
                        fields.case[childPath] = entry
                    }
                } else {
                    traversal(entry, childPath)
                }
            }
        }
    }
    traversal(scheme.schemeDescription)

    return fields
}







const validateEnum = (record, fullPath, value, desc) => {

    // check enum values
    for(let enumEntry of desc.enum) {
        if(enumEntry.value.localeCompare(value, 'de', { sensitivity: 'base' }) === 0) {
            // matched enum value
            return value
        }
    }

    // check the alias values
    for(let enumEntry of desc.enum) {
        let match = false
        if(lodash.isArray(enumEntry.alias)) {
            for(let alias of enumEntry.alias) {
                if(alias.localeCompare(value, 'de', { sensitivity: 'base' }) === 0) {
                    // matched enum alias
                    return enumEntry.value
                }
            }
        }
    }

    // invalid enum value
    record.report.addFieldError(fullPath, `The value '${value}' is not allowed at path '${fullPath}'. Allowed values are ${desc.enum.map(item => `'${item.value}'`)}`)
    return null
}





const validateDecimal = (record, fullPath, value, desc) => {
    if(value != null) {
        let number = Number.parseFloat(value)
        if(isNaN(number) === false) {
            return value
        }
    }

    // invalid decimal value
    record.report.addFieldError(fullPath, `The value '${value}' can not be interpreted as a decimal value at path '${fullPath}'.`)
    return null
}




const validateInteger = (record, fullPath, value, desc) => {
    const parsed = parseInteger(value)
    if(parsed == null) {
        // invalid integer value
        record.report.addFieldError(fullPath, `The value '${value}' can not be interpreted as an integer value at path '${fullPath}'.`)
        return null
    }
    return parsed
}







const validateDate = (record, fullPath, value, desc) => {
    const dateTest = /^\d\d\.\d\d\.\d\d\d\d$/
    if(dateTest.test(value)) {
        let date = DateTime.fromFormat(value, 'dd.MM.yyyy').toUTC()
        return new Date(date).toISOString()
    } else {
        let date = Date.parse(value)
        if(isNaN(date) === false) {
            return new Date(date).toISOString()
        }
    }

    // invalid date value
    record.report.addFieldError(fullPath, `The value '${value}' can not be interpreted as a date value at path '${fullPath}'.`)
    return null
}






const validateString = (record, fullPath, value, desc) => {
    if(lodash.isString(value) === false) {
        value = String(value)
    }
    if(lodash.isArray(desc.enum) === true && desc.enum.length > 0) {
        return validateEnum(record, fullPath, value.trim(), desc)
    } else {
        return value.trim()
    }
}






const validateField = (record, root, localPath, fullPath, desc) => {

    // get value for the field
    let value = lodash.get(root, localPath)

    // check if field empty
    if(value == null || (lodash.isString(value) && value.trim().length === 0)) {
        if(desc.required === true) {
            record.report.addFieldError(fullPath, `Missing required value at path '${fullPath}'`)
            record.report.addTopLevelError(`Missing required value at path '${fullPath}'`)
        }
        lodash.unset(root, localPath)
        return
    }

    // split string values for array types
    if(desc.isArrayType === true && lodash.isString(value)) {
        if(lodash.isString(desc.delimiter) && desc.delimiter.length > 0) {
            let parts = value.split(new RegExp(desc.delimiter))
            value = parts.map(item => item != null ? item.trim() : '').filter(item => item.length > 0)
        } else {
            value = [value]
        }
    }

    // main validation
    if(desc.isArrayType === true) {

        // array type
        let values = []
        for(let val of value) {

            // value check based on type
            switch(desc.type) {
                case 'string':
                    val = validateString(record, fullPath, val, desc)
                    break
                case 'integer':
                    val = validateInteger(record, fullPath, val, desc)
                    break
                case 'decimal':
                    val = validateDecimal(record, fullPath, val, desc)
                    break
                case 'date':
                    val = validateDate(record, fullPath, val, desc)
                    break
                case 'UUID':
                    // ignore
                    break
                default: 
                    record.report.addTopLevelError(`Validation for field type '${desc.type}' is not implemented at path '${fullPath}'`)
            }

            if(val == null || (lodash.isString(val) && val.trim().length === 0)) {
                // ignore
            } else {
                values.push(val)
            }
        }

        // set value
        lodash.set(root, localPath, values)

    } else {
        // non-array type

        switch(desc.type) {
            case 'string':
                value = validateString(record, fullPath, value, desc)
                break
            case 'integer':
                value = validateInteger(record, fullPath, value, desc)
                break
            case 'decimal':
                value = validateDecimal(record, fullPath, value, desc)
                break
            case 'date':
                value = validateDate(record, fullPath, value, desc)
                break
            case 'UUID':
                // ignore
                break
            default: 
                record.report.addTopLevelError(`Validation for field type '${desc.type}' is not implemented at path '${fullPath}'`)
        }

        // check if value is null
        if(value == null || (lodash.isString(value) && value.trim().length === 0)) {
            if(desc.required === true) {
                record.report.addFieldError(fullPath, `Missing required value at path '${fullPath}'`)
                record.report.addTopLevelError(`Missing required value at path '${fullPath}'`)
            }
            lodash.unset(root, localPath)
            return
        }

        // set value
        lodash.set(root, localPath, value)
    }
}




const parse_primary_assembly_loci = (item) => {

    console.log(item)
    
    let parsed = {
        variant: {}
    }
    
    parsed.variant = {
        GRCh37: {
            gDNA: item?.grch37?.hgvs_genomic_description,
            build: 'GRCh37',
            chr: item?.grch37?.vcf?.chr,
            pos: parseInteger(item?.grch37?.vcf?.pos),
            ref: item?.grch37?.vcf?.ref,
            alt: item?.grch37?.vcf?.alt
        },
        GRCh38: {
            gDNA: item?.grch38?.hgvs_genomic_description,
            build: 'GRCh38',
            chr: item?.grch38?.vcf?.chr,
            pos: parseInteger(item?.grch38?.vcf?.pos),
            ref: item?.grch38?.vcf?.ref,
            alt: item?.grch38?.vcf?.alt
        }
    }

    let isValid =
        parsed.variant.GRCh37.gDNA != null &&
        parsed.variant.GRCh37.build != null &&
        parsed.variant.GRCh37.chr != null &&
        parsed.variant.GRCh37.pos != null &&
        parsed.variant.GRCh37.ref != null &&
        parsed.variant.GRCh37.alt != null &&
        parsed.variant.GRCh38.gDNA != null &&
        parsed.variant.GRCh38.build != null &&
        parsed.variant.GRCh38.chr != null &&
        parsed.variant.GRCh38.pos != null &&
        parsed.variant.GRCh38.ref != null &&
        parsed.variant.GRCh38.alt != null

    if(isValid === true) {
        parsed.variant._id = `GRCh38-${parsed.variant.GRCh38.chr}-${parsed.variant.GRCh38.pos}-${parsed.variant.GRCh38.ref}-${parsed.variant.GRCh38.alt}`
    } else {
        parsed.error = `primary_assembly_loci could not be parsed: ${JSON.stringify(item)}`
    }

    console.log(parsed)

    return parsed
}





class Processing {


    constructor(context) {
        this.fieldDescriptions = prepareScheme(context.scheme)
        this.sequencingLab = context.sequencingLab
    }


    validateFieldFormat(record) {

        // set sequencing lab
        record.generic['sequencingLab'] = this.sequencingLab
        
        // case fields
        for(let [path,desc] of Object.entries(this.fieldDescriptions.case)) {
            if(path === '_id') {
                continue
            }
            validateField(record, record.generic, path, path, desc)
        }

        // variant fields
        for(let [path,desc] of Object.entries(this.fieldDescriptions.variant)) {

            let i = 0
            for(let variantEntry of record.generic['variants']) {

                // set full path for error report 
                const fullPath = `variants[${i}].${path}`

                // validate field
                validateField(record, variantEntry, path, fullPath, desc)

                i++
            }
        }

    }



    async normalizeVariants(record) {

        let i = 0
        for(let variantEntry of record.generic['variants']) {
            


            // parse cDNA

            let cDNA_processed = {
                source: variantEntry['HGVS_cDNA'],
                vvOutput: null,
                hasError: false,
                parsed: null
            }

            if(cDNA_processed.source != null) {

                const fullPath = `variants[${i}].HGVS_cDNA`

                console.log()
                console.log(cDNA_processed.source)

                try {
                    cDNA_processed.vvOutput = await vvQuery('GRCh38',cDNA_processed.source,'mane_select')
                } catch(err) {
                    const msg = `Could not generate VariantValidator Output for cDNA (Error Code 1): ${cDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    cDNA_processed.hasError = true
                }

                if(cDNA_processed.vvOutput == null) {
                    const msg = `Could not generate VariantValidator Output for cDNA (Error Code 2): ${cDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    cDNA_processed.hasError = true
                }

                if(cDNA_processed.vvOutput.flag !== 'gene_variant') {
                    const msg = `VariantValidator returned error for cDNA (Error Code 3): ${cDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    cDNA_processed.hasError = true
                }

                if(Object.keys(cDNA_processed.vvOutput).length !== 3 || cDNA_processed.vvOutput.flag == null || cDNA_processed.vvOutput.metadata == null) {
                    const msg = `VariantValidator returned ambigious results for cDNA (Error Code 4): ${cDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    cDNA_processed.hasError = true
                }

                if(cDNA_processed.vvOutput != null && cDNA_processed.hasError === false) {
                    let vvKey = null
                    let vvEntry = null
                    for(let [key,entry] of Object.entries(cDNA_processed.vvOutput)) {
                        if(key !== 'flag' && key !== 'metadata') {
                            vvKey = key
                            vvEntry = entry
                            break
                        }
                    }
                    
                    cDNA_processed.parsed = parse_primary_assembly_loci(vvEntry.primary_assembly_loci)

                    if(cDNA_processed.parsed.error != null) {
                        const msg = `Could not parse loci from VariantValidator output for cDNA (Error Code 5): ${cDNA_processed.source}`
                        record.report.addFieldError(fullPath, msg)
                        record.report.addTopLevelError(msg)
                        cDNA_processed.hasError = true
                    }
                }
            }



            // parse gDNA

            let gDNA_processed = {
                source: variantEntry['HGVS_gDNA'],
                vvOutput: null,
                hasError: false,
                parsed: null
            }

            if(gDNA_processed.source != null) {

                const fullPath = `variants[${i}].HGVS_gDNA`

                console.log()
                console.log(gDNA_processed.source)

                try {
                    gDNA_processed.vvOutput = await vvQuery('GRCh38',gDNA_processed.source,'mane_select')
                } catch(err) {
                    const msg = `Could not generate VariantValidator Output for gDNA (Error Code 1): ${gDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    gDNA_processed.hasError = true
                }

                if(gDNA_processed.vvOutput == null) {
                    const msg = `Could not generate VariantValidator Output for gDNA (Error Code 2): ${gDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    gDNA_processed.hasError = true
                }

                if(gDNA_processed.vvOutput != null && gDNA_processed.vvOutput.flag !== 'gene_variant') {
                    const msg = `VariantValidator returned error for gDNA (Error Code 3): ${gDNA_processed.source}`
                    record.report.addFieldError(fullPath, msg)
                    record.report.addTopLevelError(msg)
                    gDNA_processed.hasError = true
                }
                
                if(gDNA_processed.vvOutput != null && gDNA_processed.hasError === false) {
                    for(let [vvKey,vvEntry] of Object.entries(gDNA_processed.vvOutput)) {
                        if(vvEntry.primary_assembly_loci != null) {
                            let parsed = parse_primary_assembly_loci(vvEntry.primary_assembly_loci)
                            if(gDNA_processed.parsed == null) {
                                if(parsed.error == null) {
                                    gDNA_processed.parsed = parsed
                                } else {
                                    // es gibt noch keins, aber das eben geparste ist fehlerhaft
                                    // diesen fall einfach ignorieren, in der hoffnung, dass die nächsten entries korrekt geparst werden können
                                    // ein fehler wird so oder so generiert, wenn nach dem for loop kein gDNA_processed.parsed vorhanden ist
                                }
                            } else {
                                // es gibt breits ein geparsten loci, der soeben geparset muss identisch sein, alles andere ist als fehler zu werten
                                let isEqual = isEqual_primary_assembly_loci(gDNA_processed.parsed, parsed)
                                if(isEqual === false) {
                                    const msg = `VariantValidator returned ambigious results for gDNA (Error Code 17): ${gDNA_processed.source}`
                                    record.report.addFieldError(fullPath, msg)
                                    record.report.addTopLevelError(msg)
                                    gDNA_processed.hasError = true
                                    break
                                }
                            }
                        }
                    }

                    if(gDNA_processed.parsed == null) {
                        const msg = `Could not parse loci from VariantValidator output for gDNA (Error Code 19): ${gDNA_processed.source}`
                        record.report.addFieldError(fullPath, msg)
                        record.report.addTopLevelError(msg)
                        gDNA_processed.hasError = true
                    }
                }

            }





            // process parsed cDNA and gDNA

            // SIEHE AUCH AB 03_import_data Zeile 1313

            // wenn cDNA einen fehler hat, dann sollte gDNA zwar geprüft werden, aber der die variante ist nicht erfolgreich und damit auch der case nicht


            /*
            const gDNA = variantEntry['HGVS_gDNA']
            let vv_gDNA = null
            if(gDNA != null) {
                console.log()
                console.log(gDNA)
                vv_gDNA = await vvQuery('GRCh38',gDNA,'auth_all')
                console.log(vv_gDNA)
            }
            */


            // BEI gDNA PRÜFE ICH KOMPLETT DURCH, OB ALLE EINTRÄGE DIE GLEICHE POSITION BESCHREIBEN



            /*
                cDNA und gDNA jeweils getrennt voneinander normalisieren

                Fälle

                cDNA x
                gDNA x
                Fehler, da eins von beiden vorhanden sein sollte

                cDNA o
                gDNA x
                ID aus cDNA holen

                cDNA x
                gDNA o
                ID aus gDNA holen

                cDNA o
                gDNA o
                ID aus gDNA holen, cDNA Id vergleichen mit der aus gDNA geholt


                checks todo:
                    1. es ist ein problem, wenn an VV diese multiform übergeben wird.. das muss man im output erkennen

                Probleme:
                Manche legalen abfragen bringen den variant validator zu einem ffehler 500 ohne fehlerinfos.. wie soll man damit umgehen??

                komischerweise geht es im webservice

                https://rest.variantvalidator.org/VariantValidator/variantvalidator/GRCh38/NC_000023.10%3Ag.64743962T%3EC/auth_raw
                https://exomag.meb.uni-bonn.de/vv/VariantValidator/variantvalidator/GRCh38/NC_000023.10%3Ag.64743962T%3EC/auth_raw

                vielleicht liegt das an einem timeout oder so?

            */

            











            // console.log(gDNA)




            


            i++
        }


        /*
            pahse 1

            gDNA und cDNA durch den variant validator


            phase 2
            interpretation der results




        */




    }


    async process(record) {

        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }

        this.validateFieldFormat(record)
        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }

        await this.normalizeVariants(record)
        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }





    }
}


module.exports = {
    createInstance: (context) => {
        return new Processing(context)
    },
    createEmptyRecord: () => createEmptyRecord()
}










