import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import lodash from 'lodash'

import API from '../../api/fetchAPI'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"
import IconButton from '@mui/material/IconButton'

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import ErrorView from '../../error/ErrorView'

import jQuery from 'jquery'

import JSONView from '../../components/util/JSONView'
import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'

import ValidationGrid from './ValidationGrid'

import bla from '../../util/bla2.svg'

import './DataValidationView.scss'

/*
    Diese Komponente ist jetzt nur auf den excel template upload angepasst.
    Hier sollte man fallunterscheidungen einbauen sobald die anderen uploads implementiert werden.
    Oder aber direkt unterschiedliche components für unterschiedliche uploads bauen, das ist wahrscheinlich sauberer.
*/





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
        PENDING
        RUNNING
        FINISHED
        CANCELED
        ERROR
*/







const ControlPanel = ({ processing, cancelValidation, restartValidation }) => {

    const componentRef = React.useRef(null)

    const progressPercent = React.useMemo(() => {
        let processed = processing?.excel?.progress?.processed
        let total = processing?.excel?.progress?.total
        if (processed == null || total == null) {
            return 0.0
        } else {
            let percent = 100.0 * (processed / total)
            if (percent < 0 || isNaN(percent)) {
                percent = 0.0
            } else if (percent > 100) {
                percent = 100.0
            }
            return percent
        }
    })

    const progressCount = React.useMemo(() => {
        let processed = processing?.excel?.progress?.processed
        let total = processing?.excel?.progress?.total
        if (processed == null || total == null) {
            return null
        } else {
            return <>{processed}&nbsp;/&nbsp;{total}</>
        }
    })

    const state = React.useMemo(() => {
        let value = processing?.excel?.state
        if (value == null) {
            return 'PENDING'
        } else {
            return value
        }
    })


    /*
    const [progressPercent, setProgressPercent] = React.useState(0.0)
    const [state, setState] = React.useState('PENDING')

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgressPercent((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
            setState(() => {
                return lodash.sample(['PENDING', 'RUNNING', 'CANCELED', 'FINISHED', 'ERROR'])
                // return lodash.sample(['CANCELED','ERROR'])
                // return lodash.sample(['PENDING','RUNNING','FINISHED'])
            })
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);
    */


    React.useEffect(() => {
        let current = componentRef.current
        if (current != null) {
            let labelCells = jQuery(current).find('div.cell.label')
            let maxWidth = 0
            labelCells.each((index, element) => {
                if (element.clientWidth > maxWidth) {
                    maxWidth = element.clientWidth
                }
            })
            labelCells.width(maxWidth)
        }
    }, [componentRef])


    const handleCancel = () => {
        cancelValidation()
    }

    const handleRestart = () => {
        restartValidation()
    }

    const renderState = () => {
        switch (state) {
            case 'RUNNING':
                return (
                    <span className={`state ${state}`}>
                        IN PROGRESS
                        <Tooltip title="Cancel Validation" placement="bottom">
                            <IconButton
                                className="cancel-button inline-button"
                                size="normal"
                                onClick={handleCancel}
                            >
                                <IconifyIcon icon="mingcute:stop-fill" />
                            </IconButton>
                        </Tooltip>
                    </span>
                )
            case 'FINISHED':
                // return (<span className={`state ${state}`}>FINISHED</span>)
                return (
                    <span className={`state ${state}`}>
                        FINISHED
                        <IconButton
                            style={{ display: 'none' }}
                            className="restart-button inline-button"
                            size="normal"
                            onClick={handleRestart}
                        >
                            <IconifyIcon icon="mingcute:play-fill" />
                        </IconButton>
                    </span>
                )
            case 'CANCELED':
                return (
                    <span className={`state ${state}`}>
                        CANCELED
                        <Tooltip title="Restart Validation" placement="bottom">
                            <IconButton
                                className="restart-button inline-button"
                                size="normal"
                                onClick={handleRestart}
                            >
                                <IconifyIcon icon="mingcute:play-fill" />
                            </IconButton>
                        </Tooltip>
                    </span>
                )
            case 'ERROR':
                return (<span className={`state ${state}`}>ERROR</span>)
            case 'PENDING':
            default:
                return (<span className={`state ${state}`}>PENDING</span>)
        }
    }


    const renderProgressRow = () => {
        switch (state) {
            case 'RUNNING':
            case 'FINISHED':
            case 'ERROR':
                return (
                    <div className="row">
                        <div className="cell label">
                            Progress:
                        </div>
                        <div className="cell progress grow">
                            <div className="progress-bar-container">
                                <LinearProgress
                                    className='progress-bar'
                                    variant='determinate'
                                    value={progressPercent}
                                />
                                <span className="progress-count">{progressCount}</span>
                            </div>
                        </div>
                    </div>
                )
            case 'CANCELED':
            case 'PENDING':
            default:
                return null
        }
    }



    const renderErrorRow = () => {
        switch (state) {
            // case 'RUNNING':
            // case 'FINISHED':
            // case 'CANCELED':
            // case 'PENDING':
            case 'ERROR':
                return (
                    <div className="row">
                        <div className="cell error grow">
                            {/* TODO: top level error report rendern<br/>
                            Hier nur unexpected, fatal oder errors beim init der processings, alle datenbezogenend fehler gehen in den context des feldes */}
                        </div>
                    </div>
                )
            case 'RUNNING':
            case 'FINISHED':
            case 'CANCELED':
            case 'PENDING':
            default:
                return null
        }
    }



    return (
        <div ref={componentRef} className="control-panel">
            <div className="row">
                <div className="cell label">
                    Data Validation:
                </div>
                <div className="cell state grow">
                    {renderState()}
                </div>
            </div>
            {renderProgressRow()}
            {renderErrorRow()}
        </div>
    )
}







// TODO: das hier sollte sicherlich als eine eigenständige Komponente implemnetiert werden.


const ErrorModal = ({error}) => {

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    return (
        <>
            <Button onClick={handleOpen} size="small" endIcon={<IconifyIcon size="small" icon="solar:folder-error-bold"/>}>Details</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="error-modal">
                    {/* <ErrorView title={error.message} error={error.cause} /> */}
                    <h1>{error.message}</h1>
                    <span>{error.cause.message}</span>
                </Box>
            </Modal>
        </>
    )
}








export default function DataValidationView(props) {

    const {
        importInstance,
        uiBlockMsg,
        cancelValidation,
        restartValidation
    } = props


    React.useEffect(() => {

    }, [])


    React.useEffect(() => {
        // console.log("Data Validation")
        // console.log(importInstance)
    }, [importInstance])






    return (

        // TODO
        // Fallunterscheidgung je nach upload_format

        <div className='data-validation-view'>

            {uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg} />
                :
                null
            }

            <ControlPanel
                processing={importInstance.processing}
                cancelValidation={cancelValidation}
                restartValidation={restartValidation}
            />


            {
                importInstance?.processing?.excel?.state === 'FINISHED' ?
                    <div className="summary">
                        <div className="box">
                            <p>
                                <b>Übersicht</b>
                            </p>
                            <p>
                                Datensätze importiert: 3
                            </p>
                        </div>
                    </div>
                    : importInstance?.processing?.excel?.state === 'ERROR' ?
                        <div className="summary">
                            <div className="bla">
                                <img className="bla" src={bla} />
                            </div>
                            <div className="box">
                                <p>
                                    <b>Leider ist bei der Bearbeitung der hochgeladenen Daten ein unerwartetes Problem aufgetreten.</b>
                                </p>
                                <p>&nbsp;</p>
                                <p>
                                    Das Problem wurde an das Entwicklerteam übermittelt und wird in Kürze behoben werden.
                                </p>
                                {importInstance?.processing?.excel?.error != null ?
                                    <div className="error">
                                        <ErrorModal error={importInstance?.processing?.excel?.error}/>

                                        {/* {importInstance?.processing?.excel?.error?.message} */}


                                    </div>
                                    : null}
                            </div>
                        </div>
                        :
                        null
            }




            {/* <JSONView target={importInstance} /> */}





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
            }
            */}







        </div>
    )
}





