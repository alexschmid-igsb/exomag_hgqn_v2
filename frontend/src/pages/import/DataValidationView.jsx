import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import lodash from 'lodash'

import API from '../../api/fetchAPI'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'

import JSONView from '../../components/util/JSONView'
import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'

import ValidationGrid from './ValidationGrid'

import './DataValidationView.scss'


/*
    Komponenten:

    Status Box / controll panel
      * aktuellen state 
      * ggf start/stop buttons?
      * fotschritts balken
      * zusammenfassung anzahl fehler

    Mehrere Grids:

        GENERELL: ALLES DATENSÄTZE WERDEN IMMER ALS OPEN GERENDERT UND KÖNNEN NICHT GESCHLOSSEN WERDEN

        1. Fehlerhafte, nicht-import-fähige Datensätze

            * Datensätze mit nicht mapbaren, falschen enum werten sind nicht import fähig
              Die fehlerhaften Felder werden durch hintergrundfarbe markiert und durch popover der fehler erklärt
            * Gleiches gilt für nicht parsbare (interger, decimal, date) felder
            * Ebenso bei fehlern der multiplizität, d.h. der felder die mehrere werte beinhalten dürfen
            * Genauso wenn varianten nicht geparst werden können
            * Erstmal keine korrektur möglichkeiten (feature für später mal) 

        2. Datensätze ready to import

          * Hier alles datensätze, die für den Import bereit sind
          * über einen button können alle importieret werden (der aber erst frei ist, wenn das prozessing abgeschlossen ist)
          * Dieses Grid zeigt für jeden record an, ob es ein neuer Datensatz ist (alles ist grün)
          * oder ob der Datensatz schon existiert hat
             - hier werden nicht veränderte felder nicht hervorgehoben oder sogar ausgegraut
             - veränderte felder werden hervorgehoben (eventuell mit old value / new value anzeige)
             - gelösche felder werden rot hervorgehoben (eventuell mit anzeige der old value)
             - für die varianten felder kann man das einfach auch so nehmen

    Prozessierung:

      1. die Daten müssen aus dem Excel sheet geholt werden
         wenn das nicht klappt, oder keine daten da sind, dann wird eine fehlermeldung gesetzt, welche dann im frontend im control panel
         angezeigt wird.
         Das mapping sorgt schon dafür, dass z.b. wichtige felder wie internal case id aufjedenfall gemappt sind
    
      2. Das backend startet einen prozessierungs "thread". Hier wird nach jedem record die datenbank geupdatet
         Solange das processing läuft, läuft im frontend der fetch (z.b. alle 500ms)

*/







/*
    states:
        PEDNING
        RUNNING
        FINISHED
        CANCELED
        UNEXPECTED_ERROR

    Wo wird das processing angestoßen?
    Eigentlich in dieser komponente, diese prüft, 


    
*/
const ControlPanel = props => {
        

    return (
        <div className="control-panel">

            HALO

        </div>
    )


}






export default function DataValidationView(props) {

    const {
        importInstance,
        uiBlockMsg
    } = props


    React.useEffect(() => {

    }, [])


    React.useEffect(() => {
        // console.log("Data Validation")
        // console.log(importInstance)
    }, [importInstance])






    return (

        <div className='data-validation-view'>


            { uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg}/>
            :
                null
            }


            <ControlPanel>

            </ControlPanel>



            <JSONView target={importInstance}/>







            {/* <ValidationGrid
                dataValidated={importInstance.data.validated}
            /> */}



            {/* 

            { importInstance?.uploadFormat === 'excel_template' ? 
                <ExcelTemplateMapping
                    importInstance={importInstance}
                    onExcelSheetChange={onExcelSheetChange}
                    onMappingChange={onMappingChange}
                 />

            : importInstance?.uploadFormat === 'excel_clinvar' ? 
                <div>The upload format '<b>Excel</b> (Clinvar)' will be available only from the next version of this application. Please go back and use the "Excel Template" upload format in the meantime.</div>

            : importInstance?.uploadFormat === 'phenopacket' ? 
                <div>The upload format '<b>Phenopacket</b>' will be available only from the next version of this application. Please go back and use the "Excel Template" upload format in the meantime.</div>
            :
                null
            }  */}

            



            

        </div>
    )
}





