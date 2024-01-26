



/*
    Hier alles rein, was das reporting unterstützt
    
    Fehler und warning hinzufügen zu top level oder field spezifisch
    diese abfragen hasError

    Am besten eine klasse "report"

    ZIEL IST ES, DASS DIESES MODUL ÜBERALL VERWENDET WERDEN KANN!!


    Wie können 


*/






class Entry {
    // type warning, error
    // man kann auch eine phase zuweisen, damit man später fehler filtern kann je nachdem wo sie entstanden sind
}

class Report {



    addTopLevelError(msg) {
        console.log("TODO TODO TODO TODO TODO: add top level error")
    }


}

module.exports = {
    createInstance: () => {
        return new Report()
    }
}



