// Wegen node.js wird das hier als CommonJS module implementiert.
// ES6 module im node.js project zu verwenden ist problematisch, vorallem wenn der Rest des codes
// auf CommonJS baisert.
// Umgekehrt ist es (wegen webpack) unproblematisch, CommonJS module in react einzubinden. Das shared folder muss
// dazu lediglich per symlink in den src ordner des frontends gelinkt werden und kann direkt verwendet werden.

// cd frontend/src
// ln -s ../../shared shared

module.exports = ( rowKeyFields, checkErrors=true ) => {

    const RowKeyDef = class {
        constructor() {
            this._fields = rowKeyFields.sort()
        }
        has(field) {
            return this._fields.includes(field)
        }
        get fields() {
            return this._fields
        }
        [Symbol.iterator]() {
            var index = -1
            var fields  = this._fields
            return {
                next: () => ({ value: fields[++index], done: !(index in fields) })
            }
        }
    }

    const rowKeyDef = new RowKeyDef()

    const RowKey = class {
        constructor(values) {
            this._rowKeyDef = rowKeyDef
            this.values = {}
            for (const field of rowKeyDef) {
                const value = values[field]
                if( (typeof value == 'string' || value instanceof String) && value.length > 0 ) {
                    this.values[field] = value
                } else {
                    if(checkErrors) {
                        console.log(`ERROR: Missing RowKey field '${field}'`)
                    }
                }
            }
            if(checkErrors) {
                for (const field in values) {
                    if(rowKeyDef.has(field) == false) {
                        console.log(`WARNING: RowKey has unknown fieldname '${field}'`)
                    }
                }
            }
            this._hash = JSON.stringify(this.values, rowKeyDef.fields, 0)
        }
        get hash() {
            return this._hash
        }
        get rowKeyDef() {
            return this._rowKeyDef
        }
    }

    const RowKeyHashtable = class {
        constructor() {
            this.map = new Map()
        }
        set(key,value) {
            if(checkErrors) this.checkKey(key)
            this.map.set(key.hash,value)
        }
        get(key) {
            if(checkErrors) this.checkKey(key)
            return this.map.get(key.hash)
        }
        has(key) {
            if(checkErrors) this.checkKey(key)
            return this.map.has(key.hash)
        }
        checkKey(key) {
            if(key instanceof RowKey == false || key.rowKeyDef !== rowKeyDef) {
                console.log("ERROR: The given row key does not have the right format (or originates from a different context)")
            }
        }
    }

    return {
        rowKeyDef: rowKeyDef,
        RowKeyDef: RowKeyDef,
        RowKey: RowKey,
        RowKeyHashtable: RowKeyHashtable
    }
}








