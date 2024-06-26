




class Entry {

    constructor(field, message, cause=null) {
        this.field = field
        this.message = message
        this.cause = cause
    }

    getField() {
        return this.field
    }

    getMessage() {
        return this.message
    }

    getCause() {
        return this.cause == null ? null : this.cause
    }
}

class Report {

    constructor() {
        this.topLevelErrors = []
        this.fieldErrors = []
        this.importErrors = []
    }

    addTopLevelError(msg,cause=null) {
        this.topLevelErrors.push(new Entry(null,msg,cause))
    }

    hasTopLevelErrors() {
        return this.topLevelErrors.length > 0
    }

    addFieldError(field,msg,cause=null) {
        this.fieldErrors.push(new Entry(field,msg,cause))
    }

    hasFieldErrors() {
        return this.fieldErrors.length > 0
    }

    addImportError(msg) {
        this.importErrors.push(new Entry(null,msg))
    }

    hasImportErrors() {
        return this.importErrors.length > 0
    }

    hasErrors() {
        return this.hasTopLevelErrors() === true || this.hasFieldErrors() === true || this.hasImportErrors() === true
    }
}

module.exports = {
    createInstance: () => {
        return new Report()
    }
}



