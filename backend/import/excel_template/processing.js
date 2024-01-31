
const Report =  require("../Report")
const BackendError = require("../../util/BackendError")

const lodash = require('lodash')


// const RECORD_LEVEL_ERRORS = "__RECORD_LEVEL_ERRORS__"


/*
    Eine Bibliothek zur Transformation der Eingaben entsprechend den Regeln und Beschränkenen der Methode 'excel_template'

    Eine Excel Zeile wird mit Hilfe vom ValueMapping in das generischen Inputformat konvertieren.

    Das Mapping wird im Frontend durch den User erzeugt (oder es muss auf Programmebene hardgecodet angegeben werden).
    Es besteht aus:
        1. Den Spaltennamen der Excel Daten
        2. Target Fields die sich aus dem Data Scheme/Layout ableiten lassen
        3. Eine eins-zu-eins Zuordnung zwischen Excel Spaltennamen und target fields

    Eine Excel Zeile entspricht der Methode 'excel_template', d.h. in diesem Fall einem Object (key-value pairs).
    Die Felder, die der klinischen Interpretation bzw. Varianten zugeordneten sind, dürfen entsprechend wie im Excel
    Template beschrieben, durch Trennzeichen in den entsprechenden Zellen untergebracht sein.

    Das generisches Inputformat definiert sich dadurch, dass die Felder hier bereits entsprechend des Data Schemes
    angelegt sein müssen. Das betrifft vorallem die Benennung der Datenpfade und die korrekte Struktur entsprechend
    des Schemes. Insbesondere ist im generische inputformat auch bereits das array unter 'variants' vorhanden, das
    heißt, die durch trennzeichen getrennten Zellenwerte müssen gesplittet werden.
    
    Die Varianteninformationen liegen im generischen Inputformat noch als Pseudofelder vor.
    Grund: Das interface für den User (egal ob Excel, API, Phenopacket, etc) sieht immer vor, dass der User HGVS
    Beschreibungen übermittlen kann. Das umsetzten dieser Beschreibungen passieren dann erst in der Phase 2, wenn
    daten im generische Inportformat validiert und importiert werden sollen.

    TODO: Diese pseudofelder müssen noch über das layout definiert werden, damit sie im mapping als target fields
    adressiert werden können. Die vier Pseudofelder sind: HGVS_cDNA, HGVS_gDNA, HGVS_protein, ISCN

    WICHTIG: Das generische input format bildet die allgemeine Schnittstelle um Daten zu importieren. Das heißt,
    Daten die über die API kommen, sollten direkt diesem Format entsprechen. Alle potentiellen zukünftigen Import
    Methoden müssen zunächst in dieses generische Importformat konvertieren, um dann weiterverarbeitet (d.h. validiert
    und importiert zu werden). Ab dem generische Importformat ist der weiter Importverlauf unabhängig von der
    Import Methode


    Einzelschritte der Phase 1:

        1. ExcelRow --> MappedRow
            Mit Hilfe des Mappings werden die Excel Zellewerte in die Struktur des Schemes gemappt.
            Hier werden die durch trennzeichen getrennten felder noch nicht gesplittet

        2. Splitting auf der ersten Ebene anhand der Trennzeichens '/'

        3. Splitting auf der zweiten Ebene anhand des Trennzeichens ';'
            Hier wird die spezifische comp_het problematik geprüft und ggf. korrigiert.
*/





// create the base object to apply all the sucessive processing steps on
const createEmptyRecord = () => {
    return {
        targetFields: [],
        excel: null,
        generic: null,
        report: Report.createInstance()
    }
}





const performColumnMapping = (record,mapping) => {

    record.generic = {}

    let i = 1
    for(let mappingEntry of mapping) {

        if(mappingEntry.activated === true) {

            let cell = record.excel[mappingEntry.sourceColumn]
            if(cell == null) {
                continue
            }

            let value = cell.value
            if(value == null) {
                continue
            }

            record.targetFields.push(mappingEntry.targetColumn.path)
            lodash.set(record.generic, mappingEntry.targetColumn.path, value)

            /*
            lodash.set(record.generic, mappingEntry.targetColumn.path, {
                __TARGETFIELD__: true,
                value: value
            })
            */
        }

        i++
    }
}







const performCellSplitting = (record) => {

    const variantValues = record.generic['variants']
    if(variantValues == null) {
        record.report.addTopLevelWarning('The record does not seem to have clinical/variant information (like gene, HGVS variants descriptions, ACMG clssification, ...)')
        record.generic['variants'] = []
        return
    }

    // get target path strings
    let targetFields = record.targetFields.filter(entry => entry.length > 'variants.'.length && entry.startsWith('variants.')).map(entry => entry.substring('variants.'.length))

    // determine the miximum number of merged values of all the variant fields
    let count = 0
    for(let targetField of targetFields) {
        let str = String(lodash.get(variantValues, targetField))
        const parts = str.split('/')
        if(parts.length > count) {
            count = parts.length
        }
    }

    // if no merged values found, no splitting is necessary, the variant array will have one entry only
    if(count === 1) {
        record.generic['variants'] = [ record.generic['variants'] ]
        return
    }

    // otherwise, if merged values found, check consistency first
    let hasErrors = false
    for(let targetField of targetFields) {
        let str = String(lodash.get(variantValues, targetField))
        const parts = str.split('/')
        if(parts.length !== 1 && parts.length !== count) {
            hasErrors = true
            record.report.addTopLevelError(`Merged cell value inconsistency: Cell value "${str}" in path "${'variants.'+targetField}" splits into ${parts.length} parts (expected ${count} parts)`)
        }
    }

    // on top level errors, set unsplitted values to variant array and return
    if(hasErrors === true) {
        record.generic['variants'] = [ record.generic['variants'] ]
        return
    }

    // otherwise, perform the actual splitting
    let splittedValues = Array(count).fill(0).map(() => ({}))
    for(let targetField of targetFields) {
        let str = String(lodash.get(variantValues, targetField))
        const parts = str.split('/')
        for(let j=0; j<count; j++) {
            let part = parts.length === 1 ? parts[0] : parts[j]
            if(lodash.isString(part)) {
                part = part.trim()
            }
            if(lodash.isString(part) && part.length > 0) {
                lodash.set(splittedValues[j], targetField, part)
            }
        }
    }

    // set splitted values as variant array
    record.generic['variants'] = splittedValues
}




const performCompHetSplitting = (record) => {

    // get target path strings
    let targetFields = record.targetFields.filter(entry => entry.length > 'variants.'.length && entry.startsWith('variants.')).map(entry => entry.substring('variants.'.length))

    // resulting rows
    let resultingRows = []

    // iterate variant entries
    for(let variantValues of record.generic['variants']) {

        // determine the miximum number of merged values of all the variant fields
        let count = 0
        for(let targetField of targetFields) {
            let str = String(lodash.get(variantValues, targetField))
            const parts = str.split(';')
            if(parts.length > count) {
                count = parts.length
            }
        }

        // if no merged values found, no splitting is necessary, the variant values will be pushed to the resulting array
        if(count === 1) {
            resultingRows.push(variantValues)
            continue
        }

        // otherwise, if merged values found, check consistency first
        let hasErrors = false
        for(let targetField of targetFields) {
            let str = String(lodash.get(variantValues, targetField))
            const parts = str.split(';')
            if(parts.length !== 1 && parts.length !== count) {
                hasErrors = true
                record.report.addTopLevelError(`Merged cell value inconsistency: Cell value "${str}" in path "${'variants.'+targetField}" splits into ${parts.length} parts (expected ${count} parts)`)
            }
        }

        // on top level errors, set unsplitted values to variant array and return
        if(hasErrors === true) {
            resultingRows.push(variantValues)
            continue
        }

        // otherwise, perform the actual splitting
        let splittedValues = Array(count).fill(0).map(() => ({}))
        for(let targetField of targetFields) {
            let str = String(lodash.get(variantValues, targetField))
            const parts = str.split(';')
            for(let j=0; j<count; j++) {
                let part = parts.length === 1 ? parts[0] : parts[j]
                if(lodash.isString(part)) {
                    part = part.trim()
                }
                if(lodash.isString(part) && part.length > 0) {
                    lodash.set(splittedValues[j], targetField, part)
                }
            }
        }

        // TODO:
        // 1. alle gesplitteten rows müssen comp het sein (hier hat die werte korrektur noch nicht stattgefunden, vielleicht muss man als ausnahme zuerst durchführen)
        // 2. die spezielle hgvs notation kann zu falsch gesplitteten einträgen führen, dass muss abgefangen und korrigiert werden

        // add splitted rows
        resultingRows.push(...splittedValues)
    }

    // set resulting rows as variant rows
    record.generic['variants'] = resultingRows
}









class Processing {

    constructor(context) {
        this.mapping = context.mapping
    }

    process(record) {

        // perform the column mapping
        performColumnMapping(record, this.mapping)
        // console.log(JSON.stringify(record.generic,null,4))

        // perform the top-level cell splitting
        performCellSplitting(record)
        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }

        // console.log("NCAH SPLIT")
        // console.log(JSON.stringify(record.generic,null,4))

        performCompHetSplitting(record)
        if(record.report.hasTopLevelErrors() === true) {
            record.report.addTopLevelError(`Can not continue processing this record due to previous errors`)
            return
        }

        

        // console.log("NCAH COMP HET")
        // console.log(JSON.stringify(record.generic,null,4))


        // TODO:
        // DAS COMPE HET CHECKING MACHEN



        // DAS GENERIC PROCESSING MOUDEL

        // enum korrektur und checking
        // zellen fehlerhandling

        // variant validator abfragen
        // feherhandling für den variant validator output

        // ALLES WAS KORREKT DURCHLÄUFT MUSS IMPORTIERTBAR SEIN

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


    }






}




module.exports = {
    createInstance: (context) => {
        return new Processing(context)
    },
    createEmptyRecord: () => createEmptyRecord()
}


















    // TODO: hier muss man irgendwie den updateMode mitnehmen..


    /*
        TODO

        Die vier felder der variante müssen irgendwie 
        als mapping targets im mapping angesteuert werden können

        später muss es ein variant processinggeben, aber bis dahin müssen diese 

    */


    // hier muss man die arrays durchgehen und item für item diese processierung machen, wenn =1 dann enfach anfügen
    // wenn nicht ,dann


    /*
    hier anfangen indem der gleiche code von oben kopiert und angepasst wird
    WICHTIG:
    variants ist jetzt ein Array, jedes array entry kann so prozessiertwerden wie vorher
    wenn nicht gesplittet wird, dann wird das array item kopiert (in ein neues)
    wenn gesplittet wird, dann werden die gesplitteten items an das neue angehängt

    1. wenn gesplittet wurde, dann muss geprüft werden, ob ALLE gesplitteten einträge comp het sind
    2. es kann sein, dass halbe cDNA und gDNA einträge durch die spezielle notation entstanden sind.
       das muss man prüfen und korrigieren

    */


    
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


        /*

            TODO:

                DAS HIER SOLLTE UNBEDINGT NOCH MAL AUFGETEILT WERDEN IN EINEN TEIL, DER EXCEL SPEZIFISCH IST,
                NÄMLICH
                1. 
                  * MAPPING DER EXCEL ROW AUF DIE FIELD TARGET
                  * EXPAND DER MUTI ROWS
                  * EXPAND DER COMP HET ROWS
                OUTPUT IST DANN EIN GENERISCHES JSON (ANGEPASST AN DIE COLUMN NAMES, NOCH OHNE HGVS PROZESSIERUNG)
                DAS SOLLTE DANN DAS GLEICHE WIE FÜR DIE API SEIN

                2. DANACH KOMMEN DIE SCHRITTE, DIE GENERISCH UND NICHT MEHR EXCEL RELEVANT SIND
                    * feld validierung
                    * HGVS parsing
                    * import in datenbank

                WICHTIG: Fehlerhandling muss generisch sein, das heißt über beide phasen fehler sammeln könnnen




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
        // console.log()
        // console.log()
        // console.dir(targetEntry, {depth: null})

        // console.log("COUNT: " + Object.keys(targetEntry).length)





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




