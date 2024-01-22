




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




