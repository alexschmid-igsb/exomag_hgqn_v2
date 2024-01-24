const BackendError = require("../../util/BackendError")

const lodash = require('lodash')
const { entriesIn } = require("lodash")




const RECORD_LEVEL_ERROR = "__RECORD_LEVEL_ERRORS__"





const mapRow = (row,mapping) => {

    // TODO: hier muss man irgendwie den updateMode mitnehmen..

    let mappedRow = {}

    let i = 1
    for(let mappingEntry of mapping) {

        if(mappingEntry.activated === true) {

            console.log(i + " " + mappingEntry.targetColumn.path)

            let cell = row[mappingEntry.sourceColumn]
            if(cell == null) {
                continue
            }

            let value = cell.value
            if(value == null) {
                continue
            }

            lodash.set( mappedRow, mappingEntry.targetColumn.path, {
                __TARGETFIELD__: true,
                value: {
                    new: value
                }
            })
        }

        i++
    }

    return mappedRow
}




/*
    TODO

    Die vier felder der variante müssen irgendwie 
    als mapping targets im mapping angesteuert werden können

    später muss es ein variant processinggeben, aber bis dahin müssen diese 

*/




const splitMultiCells = (row) => {

    let source = row['variants']
    if(source == null) {
        row[RECORD_LEVEL_ERROR] = [ "The record has no clinical/variant information (like gene, HGVS variants descriptions, ACMG clssification, ...)" ]
        return row
    }

    let size = 0
    const calcSize = (entry) => {
        for(let [key,child] of Object.entries(entry)) {
            if(child['__TARGETFIELD__'] === true) {
                const str = String(child.value.new)
                const parts = str.split('/')
                if(parts.length > size) {
                    size = parts.length
                }
            } else if(lodash.isObject(child)) {
                calcSize(child)
            }
        }
    }
    calcSize(source)

    console.log("SIZE: " + size)
    if(size === 1) {
        row['variants'] = [row['variants']]
        return row
    }

    let errors = []
    const checkErrors = (entry,path) => {
        for(let [key,child] of Object.entries(entry)) {
            let childPath = path != null ? path + '.' + key : key
            if(child['__TARGETFIELD__'] === true) {
                const str = String(child.value.new)
                const parts = str.split('/')
                if(parts.length !== 1 && parts.length !== size) {
                    errors.push(`The cell value "${str}" in path "${childPath}" splits in ${parts.length} parts (but ${size} required)`)
                }
            } else if(lodash.isObject(child)) {
                checkErrors(child, childPath)
            }
        }
    }
    checkErrors(source)
    
    console.log("ERRORS:")
    for(let error of errors) {
        console.log(error)
    }

    if(errors.length > 0) {
        row[RECORD_LEVEL_ERROR] = errors
        row['variants'] = [row['variants']]
        return row
    }

    let splitted = Array(size).fill(0).map(() => ({}))

    const split = (entry,path) => {
        for(let [key,child] of Object.entries(entry)) {
            let childPath = path != null ? path + '.' + key : key
            if(child['__TARGETFIELD__'] === true) {
                const str = String(child.value.new)
                const parts = str.split('/')
                for(let j=0; j<size; j++) {
                    let part = parts.length === 1 ? parts[0] : parts[j]
                    lodash.set(splitted[j], childPath, {
                        __TARGETFIELD__: true,
                        value: {
                            new: part
                        }
                    })
                }
            } else if(lodash.isObject(child)) {
                split(child, childPath)
            }
        }
    }
    split(source)

    // set split
    row['variants'] = splitted
    return row
}



const splitCompHet = (row) => {




    // hier muss man die arrays durchgehen und item für item diese processierung machen, wenn =1 dann enfach anfügen
    // wenn nicht ,dann


    hier anfangen indem der gleiche code von oben kopiert und angepasst wird
    WICHTIG:
    variants ist jetzt ein Array, jedes array entry kann so prozessiertwerden wie vorher
    wenn nicht gesplittet wird, dann wird das array item kopiert (in ein neues)
    wenn gesplittet wird, dann werden die gesplitteten items an das neue angehängt

    1. wenn gesplittet wurde, dann muss geprüft werden, ob ALLE gesplitteten einträge comp het sind
    2. es kann sein, dass halbe cDNA und gDNA einträge durch die spezielle notation entstanden sind.
       das muss man prüfen und korrigieren

    return row

    
    /*
        wie oben versucht man aufzusplitten bezüglich ';'
        wenn es zwei oder mehrere sind, dann müssen die anderen auch wieder diese anzahl haben oder aber nur eine die
        dann für alle gilt

        alle müssen comp het haben bei zygosity

        Bei cDNA und gDNA müssen die varianten durch ';' getrennt werden können.
        Folgende Beschreibung ist erlaubt und bei comp het durchaus üblich:

        NC_000023.10:g.[30683643A>G];[33038273T>G]

        Wenn man das trennt, dann erhält man 
        NC_000023.10:g.[30683643A>G]
        [33038273T>G]

        Hier muss man dann den vorterteil ergänzen!


        Das hier ist bei comp het nicht ok:

        NC_000023.10:g.[30683643A>G;33038273T>G]


        https://hgvs-nomenclature.org/stable/recommendations/DNA/alleles/





        

    */

}


class Processing {

    constructor(context) {
        this.mapping = context.mapping
    }



    process(sourceRow) {
        
        console.log(sourceRow)
        console.log("COUNT: " + Object.keys(sourceRow).length)

        // mapping
        let targetEntry = mapRow(sourceRow, this.mapping)

        // split multiple fields
        targetEntry = splitMultiCells(targetEntry)
        if(lodash.isArray(targetEntry[RECORD_LEVEL_ERROR]) && targetEntry[RECORD_LEVEL_ERROR].length > 0) {
            // processing wird aufgrund der top level fehler abgebrochen
            return targetEntry
        }

        // split comp het fields
        targetEntry = splitCompHet(targetEntry)
        if(lodash.isArray(targetEntry[RECORD_LEVEL_ERROR]) && targetEntry[RECORD_LEVEL_ERROR].length > 0) {
            // processing wird aufgrund der top level fehler abgebrochen
            return targetEntry
        }



        // hier jetzt das comp het splitten ???



        /*
            was fehlt noch?

            Alle bekanten felder duchgehen,
            versuchen den wert zu lokalisieren,
            dann den type prüfen
            enum, usw
            array of enum,
            array of string
            array of specific (z.b. HPO Terms)
            usw.

            Hier die fehler direkt in die cells setzen

            Das wäre dann bereit für die rückgabe..
        */


        
        // console.log("prozessiere")
        console.dir(targetEntry, {depth: null})
        console.log("COUNT: " + Object.keys(targetEntry).length)

        return {test: 123}

    }






}




module.exports = {
    createInstance: (context) => {
        return new Processing(context)
    }
}










/*
      
  01 Internal Case ID
  02 External Case ID
  03 GestaltMatcher ID
  04 Face2Gene ID
  05 Sex
  06 Age (in months)
  07 Age (in years)
  08 Prenatal
  09 Date of Birth
  10 Start der Diagnostik
  11 Befunddatum
  12 Disease Category
  13 Case Status
  14 HPO Terms
  15 Bisherige Diagnostik
  16 Single / Duo / Trio
  17 Referring Clinician
  18 Autozygosity
  19 Test Conducted
  20 Changes in Management / Therapy after Test
  21 Secondary or incidental Findings
  22 Relevant findings for research
  23 Selectivvertrag
  24 Wetlab Metainfo
  25 AutoCasc
  26 Kommentar


  01 Gene
  02 Variant solves case
  03 Level of Evidence (for new disease genes)
  04 ACMG Class
  05 ACMG Criteria
  06 Zygosity
  07 Segregationsanalyse
  08 Mode of Inheritance
  09 PubMed ID
  10 Clinvar Accession ID
  11 ISCN
  12 HGVS_cDNA
  13 HGVS_gDNA
  14 HGVS_protein

*/



/*
    

WICHTIG: Hier nur die validation, das vergleiche mit vorhanden usw usw kann man auf ein eigensctändiges moduel aufbteilen



    Ein Modul, welches sowohl im import als auch von der API verwendet werden kann

    Funktionalität:
        1. Processierung von roh daten in records
            a) generierung von input daten
                bei gegebenen mapping werden roh datensätze (excel rows) in eingabe datensätze (json) umgebaut
                    * das datenmapping wird durchgeführt
                    * die excel trennzeichen semanitk wird auseinandergenommen und ggf. fehler auf top level ebene des
                      erzeugten datensatzes generiert
                Der output ist dann ein json objekt, welches nur noch einzelfelder hat und korrekt in feldern gemäß
                dem Datasscheme abgelegt ist.

            b) daten validierung
                Für alle felder anhand des data schemes prüfen, ob einfabe korrekt validierbar ist
                Enum Check braucht noch alias definitionen im scheme
                Date, intger, number usw usw
                Required felder auf top-level ebene testen
            
            c) Prozessierung von referenzierten datensätzen, hier geht es hardgecodet um variants!
               Variant validator laufen lassen
               Validierung der ergebnisse, wenn fehler beim prozessing, diese glboal oder in die felder ablegen
               Hier auch spezifisches processing ala comp het (die möglichkeit im kopf behalten, das noch andere checks kommen werden)

               die results werden in ___error__ oder __<was auch immer>___ properties abgelegt

            d) Der abgleich mit der Datenbank. Record schon vorhanden? Wenn ja, gibt es überhaupt änderungen?
               Wenn ja, welche Felder verden verändert? Wird ein alter wwert überschrieben? Oder wird ein Feld
               gesetzt wo vorher nichts war? Oder wird ein Wert gelöscht?

            e) Am ende sollen hier records erzeugt worden sein, die sowohl im frontend als AGGrid source dienen
               um für den User zur konrolle bzw. fehler report (ebenos für API) ABER dann auch einfach importiert
               werden können ohne das noch viel gemacht werden muss
    
    WICHTIG: Jeder noch so kleine schritt in function hierarchieen auslagern.

    WICHTIG: das ganze soll auch verwendet werden könne, um den Import nochmal komplett neu machen und daraus einfach
    Listen zu erzeugen, welche Probleme wo aufgetreten sind, dazu brauchen die Errors dann IDs oder nummern, um dass
    wieder auseinandernehmen zu können. Diese nummern sind auch sinnvoll für die API und das backend.


    Requirements:
        1. Muss in einem backend context ausgeführt werden, d.h. config, envirnment paths, initialized database, user modules, redis, usw usw müssen laufen


*/




