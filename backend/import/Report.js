



/*
    Hier alles rein, was das reporting unterstützt
    
    Fehler und warning hinzufügen zu top level oder field spezifisch
    diese abfragen hasError

    Am besten eine klasse "report"

    ZIEL IST ES, DASS DIESES MODUL ÜBERALL VERWENDET WERDEN KANN!!


    Wie können 


*/






class Entry {

    constructor(field,message) {
        this.field = field
        this.message = message
    }

    getField() {
        return this.field
    }

    getMessage() {
        return this.message
    }





}

class Report {

    constructor() {
        this.topLevelErrors = []
        this.fieldErrors = []
    }

    addTopLevelError(msg) {
        this.topLevelErrors.push(new Entry(null,msg))
    }

    hasTopLevelErrors() {
        return this.topLevelErrors.length > 0
    }

    addFieldError(field,msg) {
        this.fieldErrors.push(new Entry(field,msg))
    }
}

module.exports = {
    createInstance: () => {
        return new Report()
    }
}



