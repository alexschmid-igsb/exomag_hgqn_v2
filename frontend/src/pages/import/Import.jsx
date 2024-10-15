import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import lodash from 'lodash'

import API from '../../api/fetchAPI'

import Button from '@mui/material/Button'

import HomeIcon from '@mui/icons-material/HomeRounded'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import { SimpleStepper as Stepper, Step } from '../../components/util/SimpleStepper'
import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'

import UploadView from './UploadView.jsx'
import DataMappingView from './DataMappingView'
import DataValidationView from './DataValidationView'


import './Import.scss'



export default function Import() {

    const routeParams = useParams()
    const importId = routeParams.importId

    const navigate = useNavigate()

    const user = useSelector((state) => state.user)

    const dispatch = useDispatch()

    const renderToolbar = () => null

    const [activeStepId, setActiveStepId] = React.useState(null)
    const [importInstance, _setImportInstance] = React.useState({})
    const [rejectedFiles, setRejectedFiles] = React.useState([])
    const [uiBlockMsg, setUIBlockMsg] = React.useState(null)
    const [uiErrorMsg, setUIErrorMsg] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [mappingIsValid, setMappingIsValid] = React.useState(false)
    const [processingIntervalId, setProcessingIntervalId] = React.useState(null)

    const breadcrumbs = React.useMemo(() => ([
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        },
        {
            key: 'imports',
            label: 'Imports',
            path: '/imports',
            icon: () => <IconifyIcon icon='bi:database-up' />
        },
        {
            key: 'import',
            label: importInstance != null ? importInstance.name : '',
            path: `/imports/${importId}`,
            icon: () => <IconifyIcon icon='tabler:text-plus' />
        }
    ]), [importInstance])


    React.useEffect(() => {
        dispatch(setToolbar(renderToolbar()))
        loadImportInstance()
    }, [importId])


    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
    }, [importInstance])


    const loadImportInstance = (blocking = true) => {
        console.log('loadImportInstance')
        if(blocking === true) setIsLoading(true)
        if (importId != null) {
            // Habe hier doNotThrowFor eingefüg, weil auch irgendwelchen gründen beim ersten request die auth nicht funktioniert
            // das das ignore hat man kein fehlerhandling, ab dem zweiten request geht die auth dann.....
            API.post('/api/import/get-import', { doNotThrowFor: [401], params: { importId: importId } }).then(response => {
                if (response == null || lodash.isArray(response.data) === false || response.data.length < 1 || response.data[0] == null) {
                    throw new Error(`could not get import for id ${importId}`)
                } else {
                    // console.log(response.data[0])
                    setImportInstance(response.data[0])
                    if(blocking === true) setIsLoading(false)
                }
            })
        }
    }



    const setImportInstance = importInstance => {
        // TODO: das hier weg, immer direkt an importInstance.progress binden

        let nextActiveStepId = ''
        switch(importInstance.progress) {
            case 'file_upload':
                nextActiveStepId = 'file_upload'
                break;
            case 'field_mapping':
                nextActiveStepId = 'field_mapping'
                break;
            case 'data_validation':
                nextActiveStepId = 'data_validation'
                break;
            default:
                nextActiveStepId = 'file_upload'
                break;
        }
        setActiveStepId(nextActiveStepId)
        _setImportInstance(importInstance)
    }



    




    // control the background interval to update the import instance while data validation processing

    const processingIntvervalFunction = () => {
        console.log("update interval")
        loadImportInstance(false)
    }

    React.useEffect( () => {

        console.log("USE EFFECT ON importInstance")
        console.log(processingIntervalId)

        // console.log(importInstance)

        if(importInstance.uploadFormat === 'excel_template' || importInstance.uploadFormat === 'csv') {

            let state = importInstance?.processing?.excel?.state

            if(importInstance.progress === 'data_validation') {

                if(processingIntervalId == null && (state === 'PENDING' || state === 'RUNNING')) {
                    if(state === 'PENDING') {
                        // console.log("TRIGGER PROCESSING IN BACKEND")
                        triggerProcessing()
                    }
                    // console.log("TRIGGER PROCESSING INTERVAL")
                    setProcessingIntervalId( setInterval( () => processingIntvervalFunction(), 1000 ) )
                } else if(processingIntervalId != null && state !== 'PENDING' && state != 'RUNNING') {
                    // console.log("CLEAR INTERVAL ON BECAUSE STATE CHANGE")
                    clearInterval(processingIntervalId)
                    setProcessingIntervalId(null)
                }

            } else {

                // in jeder anderer view sollte das interval deaktiviert sein
                if(processingIntervalId != null) {
                    // console.log("CLEAR INTERVAL BECAUSE VIEW CHANGE")
                    clearInterval(processingIntervalId)
                    setProcessingIntervalId(null)
                }
            }
        }

    }, [importInstance])

    React.useEffect( () => {
        return () => {
            clearInterval(processingIntervalId)
        }
    },[processingIntervalId])











    // UPLOAD HANDLING

    
    // const [uploadFormat, setUploadFormat] = React.useState()

    const changeUploadFormat = newUploadFormat => {
        console.log(`change upload format to '${newUploadFormat}'`)

        // setImportInstance({...importInstance, uploadFormat: newUploadFormat})

        setUIBlockMsg('set upload format ...')
        API.post('/api/import/set-upload-format', {
            params: {
                importId: importId,
                uploadFormat: newUploadFormat
            }
        }).then( response => {
            console.log(response)
            setImportInstance(response.data)
            setRejectedFiles([])
            setUIBlockMsg(null)
        })
    }


    const changeUploadFormatConfig = newUploadFormatConfig => {
        console.log(`change upload format config to`)
        console.log(newUploadFormatConfig)

        setUIBlockMsg('set upload format config ...')
        API.post('/api/import/set-upload-format-config', {
            params: {
                importId: importId,
                uploadFormat: importInstance.uploadFormat,
                uploadFormatConfig: newUploadFormatConfig
            }
        }).then( response => {
            console.log(response)
            setImportInstance(response.data)
            setRejectedFiles([])
            setUIBlockMsg(null)
        })
    }







    const handleFileUpload = files => {

        console.log("handleFileUpload")


        console.log("handle upload")
        console.log(files)

        setUIBlockMsg('uploading files ...')

        API.sendFiles('/api/import/upload-files', files, { params: { importId: importId }}).then(response => {

            setUIBlockMsg(null)

            setImportInstance(response.updatedImport)
            setRejectedFiles(response.rejectedFiles)
        })
    }

    

    const changeExcelSheet = newExcellSheet => {
        // setImportInstance({...importInstance, uploadFormat: newUploadFormat})
        setUIBlockMsg('setting excel sheet')
        API.post('/api/import/excel-template-set-sheet', {
            params: {
                importId: importId,
                excelSheet: newExcellSheet
            }
        }).then( response => {
            setImportInstance(response.data)
            setUIBlockMsg(null)
        })
    }


    const changeMapping = newMapping => {
        // setImportInstance({...importInstance, uploadFormat: newUploadFormat})
        setUIBlockMsg('update value mapping')
        API.post('/api/import/excel-template-set-mapping', {
            params: {
                importId: importId,
                mapping: newMapping
            }
        }).then( response => {
            setImportInstance(response.data)
            setUIBlockMsg(null)
        })
    }


    const loadCSVHeader = () => {
        // setImportInstance({...importInstance, uploadFormat: newUploadFormat})
        setUIBlockMsg('loading csv header')
        API.post('/api/import/load-csv-header', {
            doNotThrowFor: [500],
            params: {
                importId: importId
            }
        }).then( response => {
            setImportInstance(response.data)
            setUIBlockMsg(null)
        }).catch( err => {
            setUIBlockMsg(null)

            let details = []
            let rec = err
            while(rec != null) {
                details.push(rec.message)
                rec = rec?.cause
            }
            setUIErrorMsg({
                title: 'CSV Parsing Error',
                message: 'Could not parse uploaded CSV file.',
                details: details
            })

            console.log("HIER wlkeä lkwnew")
            console.dir(err, { depth: null })
        })
    }




    const [fileUploadMessge,setFileUploadMessage] = React.useState({ type: 'info', text: 'Set the upload format and upload data files to complete this step.'})

    const confirmFileUploadStep = event => {
        // validate
        let message = null
        if(importInstance.uploadFormat == null) {
            message = {
                type: 'error',
                text: 'No upload format selected!'
            }
        } else if(importInstance.uploadedFiles == null || importInstance.uploadedFiles.length <= 0) {
            message = {
                type: 'error',
                text: 'No files uploaded!'
            }
        }
        if(message) {
            setFileUploadMessage(message)
            return
        }
        // execute update
        setIsLoading(true)
        API.post('/api/import/set-progress', {
            params: {
                importId: importId,
                progress: 'field_mapping'
            }
        }).then( response => {
            setImportInstance(response.data)
            setIsLoading(false)
        })
    }


    const goBackToFileUpload = event => {
        setIsLoading(true)
        setUIBlockMsg(null)
        setUIErrorMsg(null)
        API.post('/api/import/set-progress', {
            params: {
                importId: importId,
                progress: 'file_upload'
            }
        }).then( response => {
            setImportInstance(response.data)
            setIsLoading(false)
        })
    }


    const confirmFieldMappingStep = event => {
        setIsLoading(true)
        setUIBlockMsg(null)
        setUIErrorMsg(null)
        API.post('/api/import/set-progress', {
            params: {
                importId: importId,
                progress: 'data_validation'
            }
        }).then( response => {
            setImportInstance(response.data)
            setIsLoading(false)
        })
    }


    const goBackToFieldMapping = event => {
        setIsLoading(true)
        setUIBlockMsg(null)
        setUIErrorMsg(null)
        API.post('/api/import/set-progress', {
            params: {
                importId: importId,
                progress: 'field_mapping'
            }
        }).then( response => {
            setImportInstance(response.data)
            setIsLoading(false)
        })
    }







    const confirmFileUploadDisabled = React.useMemo(() => (importInstance.uploadFormat == null || importInstance.uploadedFiles == null || importInstance.uploadedFiles.length <= 0), [importInstance])





    // TODO: HIER PRÜFEN, OB EXCEL_TEMPLATE UND PROCESSING AUF PENDING IST. WENN JA, DANN WIRD HIER
    // EINFACH DER THREAD GESTARTET. DIESER ÄNDERT DANN SELBST 
    // DIE SUB KOMPONENTEN VAIDALTION VIEW MACHT SELBST DAS PULLING BASIEREND AUF DEM STATE DER IMPORT INSTANCE
    // WELCHER WIEDERUM DURCH DEN THEREAD GESETZT WIRD
    // WICHTIG: DAS PULLING WIRD IN DER HAUPTKOMPONENTE DEFINIERT (logic) UND NUR VON DER SUBKOMPONENTEN GECALLT
    // ABER DORT NICHT DEFINIERT


    // trigger the processing if not yet running
    const triggerProcessing = () => {
        console.log("triggerProcessing")
        console.log(importInstance)
        switch(importInstance.uploadFormat) {
            case 'excel_template':
            case 'csv':
                if(importInstance?.processing?.excel?.state === 'PENDING') {
                    setIsLoading(true)
                    API.post('/api/import/excel-template-trigger-processing', {
                        params: {
                            importId: importId
                        }
                    }).then( response => {
                        // Wieso bekommt man hier keine geupdatete importInstance zurück?
                        // triggerProcessing() wird beim next step handler aufgerufen (also wenn
                        // man zur data validation view wechselt). Dort wird dann auch der
                        // timout für das pulling der importInstance gestartet. Darüber kommt
                        // dann die geupdatete import instance. Auf diese weise kann man die
                        // importInstance im worker updaten und muss das nicht im endpoint machen.
                        setIsLoading(false)
                    })
                }
                break;
        }
    }


    const cancelValidation = () => {
        console.log("cancelValidation")
        console.log(importInstance)
        switch(importInstance.uploadFormat) {
            case 'excel_template':
            case 'csv':
                if(importInstance?.processing?.excel?.state === 'RUNNING') {
                    setIsLoading(true)
                    API.post('/api/import/excel-template-cancel-processing', {
                        params: {
                            importId: importId
                        }
                    }).then( response => {
                        // hier braucht man auch kein return der import instance, weil das
                        // bei einem laufenden processing über den timeout geholt wird und
                        // dann der timout beim nächsten update gestoppt wird.
                        setIsLoading(false)
                    })
                }
                break
        }
    }



    const restartValidation = () => {
        console.log("restartValidation")
        console.log(importInstance)
        switch(importInstance.uploadFormat) {
            case 'excel_template':
            case 'csv':
                // if(importInstance?.processing?.excel?.state === 'CANCELED') {
                    if(importInstance?.processing?.excel?.state === 'CANCELED' || importInstance?.processing?.excel?.state === 'FINISHED') {
                    setIsLoading(true)
                    API.post('/api/import/excel-template-clear-canceled', {
                        params: {
                            importId: importId
                        }
                    }).then( response => {
                        setImportInstance(response.data)
                        setIsLoading(false)
                    })
                }
                break
        }
    }










    const isDataValidationRunning = React.useMemo(() => {
        // TODO: bei weitern upload mehtoden muss das hier ergänzt werden
        return (
            importInstance?.processing?.excel?.state === 'RUNNING' || 
            importInstance?.processing?.excel?.state === 'FINISHED' || 
            processingIntervalId != null
        )
    })

    


    return (

        <div className="import-container">

            { isLoading === true ?
                <LargeSpinnerOverlay label="loading..."/>
            :
                null
            }

            {/* {activeStepId} */}

            <Stepper
                className="main"
                activeStepId={activeStepId}
                setActiveStepId={setActiveStepId}
            >
                <Step
                    id='file_upload'
                    label='Data Upload'
                    onNext={{
                        disabled: confirmFileUploadDisabled,
                        label: 'continue',
                        icon: <IconifyIcon icon='tabler:arrow-big-right' />,
                        onClick: confirmFileUploadStep
                    }}
                    message={fileUploadMessge}
                >
                    <UploadView
                        uploadFormat={importInstance.uploadFormat}
                        onUploadFormatChange={changeUploadFormat}

                        uploadFormatConfig={importInstance.uploadFormatConfig}
                        onUploadFormatConfigChange={changeUploadFormatConfig}

                        onFileUpload={handleFileUpload}
                        uiBlockMsg={uiBlockMsg}
                        uiErrorMsg={uiErrorMsg}
                        uploadedFiles={importInstance.uploadedFiles}
                        rejectedFiles={rejectedFiles}
                    />
                </Step>

                <Step
                    id='field_mapping'
                    label='Field Mapping'
                    onPrevious={{
                        label: 'go back',
                        icon: <IconifyIcon icon='tabler:arrow-big-left' />,
                        onClick: goBackToFileUpload
                    }}
                    onNext={{
                        disabled: mappingIsValid === false,
                        label: 'continue',
                        icon: <IconifyIcon icon='tabler:arrow-big-right' />,
                        onClick: confirmFieldMappingStep
                    }}
                >
                    { importInstance.uploadFormat === 'excel_template' || importInstance.uploadFormat === 'csv' ?
                        <DataMappingView
                            uiBlockMsg={uiBlockMsg}
                            uiErrorMsg={uiErrorMsg}
                            importInstance={importInstance}
                            onExcelSheetChange={changeExcelSheet}
                            onMappingChange={changeMapping}
                            loadCSVHeader={loadCSVHeader}
                            mappingIsValid={mappingIsValid}
                            onMappingIsValidChange={setMappingIsValid}
                        />
                    : 
                        <span>no field mapping for this upload format</span>
                    }
                </Step>


                <Step
                    id='data_validation'
                    label='Validation & Import'
                    onPrevious={{
                        disabled: isDataValidationRunning,
                        label: 'go back',
                        icon: <IconifyIcon icon='tabler:arrow-big-left' />,
                        onClick: goBackToFieldMapping
                    }}
                    onNext={{
                        disabled: false,
                        label: 'leave import',
                        icon: <IconifyIcon icon='bitcoin-icons:exit-filled' />,
                        onClick: () => { navigate('/imports') }

                    }}
                >
                    <DataValidationView
                        uiBlockMsg={uiBlockMsg}
                        uiErrorMsg={uiErrorMsg}
                        importInstance={importInstance}
                        cancelValidation={cancelValidation}
                        restartValidation={restartValidation}
                    />
                </Step>

                {/* <Step
                    id='execute'
                    label='Execute Import'
                >
                    <div>
                        vier
                    </div>
                </Step> */}

            </Stepper>



        </div>




        // <div style={{padding: '20px', height: '100%', display: 'flex', flexFlow: 'column'}}>
        //     {importId}
        // </div>
    )


}