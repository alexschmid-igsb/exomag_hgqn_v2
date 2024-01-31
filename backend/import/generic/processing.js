
const Report =  require("../Report")
const BackendError = require("../../util/BackendError")

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
    if(lodash.isString(value)) {
        if(/^[-+]?\d+$/.test(value) === true) {
            return parseInt(value)
        }
    } else {
        if(Number.isInteger(value) === true) {
            return value
        }
    }

    // invalid integer value
    record.report.addFieldError(fullPath, `The value '${value}' can not be interpreted as an integer value at path '${fullPath}'.`)
    return null
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
                    value = null
                    break
                default: 
                    record.addTopLevelError(`Validation for field type '${desc.type}' is not implemented at path '${fullPath}'`)
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
                value = null
                break
            default: 
                record.addTopLevelError(`Validation for field type '${desc.type}' is not implemented at path '${fullPath}'`)
        }

        // check if value is null
        if(value == null || (lodash.isString(value) && value.trim().length === 0)) {
            lodash.unset(root, localPath)
            return
        }

        // set value
        lodash.set(root, localPath, value)
    }
}







class Processing {


    constructor(context) {
        this.fieldDescriptions = prepareScheme(context.scheme)
    }


    validateFieldFormat(record) {
        
        // case fields
        for(let [path,desc] of Object.entries(this.fieldDescriptions.case)) {
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



    normalizeVariants(record) {


        for(let variantEntry of record.generic['variants']) {

            console.log(variantEntry['HGVS_cDNA'])


            


        }


        /*
            pahse 1

            gDNA und cDNA durch den variant validator


            phase 2
            interpretation der results




        */




    }


    process(record) {

        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }

        this.validateFieldFormat(record)

        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }


        this.normalizeVariants(record)

        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }


        console.log(record.report.fieldErrors)

    }
}


module.exports = {
    createInstance: (context) => {
        return new Processing(context)
    },
    createEmptyRecord: () => createEmptyRecord()
}










