import React from 'react'

import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import SuccessIcon from '@mui/icons-material/Done'
import RefreshIcon from '@mui/icons-material/Refresh'
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import LoadingButton from '@mui/lab/LoadingButton'

import API from '../api/fetchAPI'
import generateKey from '../util/generateKey'
import FileUpload from '../components/FileUpload'
import ColumnMapping from '../components/ColumnMapping'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import { v4 as uuidv4 } from 'uuid'

import './FileUpload.scss'
import './ExcelUpload.scss'



export default function ExcelUpload({gridId,onClose}) {



    const [uploadId, setUploadId] = React.useState(uuidv4())
    // const uploadId = uuidv4()   // so eine variable wird bei desem fucking rerender (auch wenn es nur um kleine teile geht) NEU gesetzt








    const [uploadDisabled, setUploadDisabled] = React.useState(false)
    const [uploadInProgress, setUploadInProgress] = React.useState(false)
    const [filename, setFilename] = React.useState(null)
    const [uploadErrorMessage, setUploadErrorMessage] = React.useState(null)

    const [selectSheetState, setSelectSheetState] = React.useState('hidden')
    const [mapColumnsState, setMapColumnsState] = React.useState('hidden')
    const [previewState, setPreviewState] = React.useState('hidden')

    const [sheetNames, setSheetNames] = React.useState(null)
    const [sheet, setSheet] = React.useState(null)
    const [gridColumnDefs, setGridColumnDefs] = React.useState(undefined)
    const [excelColumnNames, setExcelColumnNames] = React.useState(undefined)

    const [columnMappingIsValid, setColumnMappingIsValid] = React.useState(false)
    const [columnMapping, setColumnMapping] = React.useState([])

    const [executionInProgress, setExecutionInProgress] = React.useState(false)
    const [showExecutionFinishedDialog, setShowExecutionFinishedDialog] = React.useState(false)

    const [uploadPreview, setUploadPreview] = React.useState(null)

    /*
        TODO WICHTIG: clear temp sollte nur temp files entfernen, die älter als eine stunde (oder ähnlich) sind
    */
    React.useEffect(() => {
        return () => {
            API.post('/api/grid/upload/clear-temp', { params: { uploadId: uploadId } })
        }
    }, [])


    


    const handleSheetChange = (event) => {
        setSheet(event.target.value);
    }
  




    // handler called when a file has been selected for upload
    const handleUpload = (file) => {

        // TODO: file type checken
        // TODO: file size checken

        console.log(file)

        console.log("UPLADO ID: " + uploadId)

        setUploadDisabled(true)
        setUploadInProgress(true)

        // TODO: request errors abfangen / ignore und als error message anzeigen
        API.sendFile('/api/grid/upload/file', file, { params: { uploadId: uploadId } }).then((data) => {
            setUploadInProgress(false)
            setFilename(file.name)
            setSelectSheetState('active')
            initSelectSheet(file.name)
        }).catch((err) => {
            setUploadInProgress(false)
            setFilename(file.name)
            setUploadErrorMessage("ERROR")      // TODO: aus der API holen
        })
    }





    const initSelectSheet = (filename) => {
        API.post('/api/grid/upload/sheet-names', { params: { uploadId: uploadId } }).then((data) => {
            setSheetNames(data)
            if(data.length > 0) {
                setSheet(data[0])
            }
        }).catch((err) => {
            // setUploadErrorMessage("ERROR")         // TODO: dieser unwahrscheinlicher fehler muss irgendwo angezegeiget werden
        })
    }



    const confirmSheet = () => {
        setSelectSheetState('done')
        setMapColumnsState('active')

        API.post('/api/grid/upload/sheet-columns', { params: { gridId: gridId, uploadId: uploadId, sheetName: sheet } }).then((data) => {
            setGridColumnDefs(data.gridColumns)
            setExcelColumnNames(data.excelColumns)

            console.log("JA KEJWFNK JWENFKJ NEWKJFN EWs")
            console.log(data)
        }).catch((err) => {
            console.log("ERROR")
            // setUploadErrorMessage("ERROR")         // TODO: dieser unwahrscheinlicher fehler muss irgendwo angezegeiget werden
        })
    }





    const goBackToSelectSheet = () => {
        setMapColumnsState('hidden')
        setSelectSheetState('active')
    }


    const confirmColumnMapping = () => {
        setMapColumnsState('done')
        setPreviewState('active')

        API.post('/api/grid/upload/preview', { params: { gridId: gridId, uploadId: uploadId, sheetName: sheet, columnMapping: columnMapping } }).then((data) => {
            setUploadPreview(data)
        })
    }




    const goBackToColumnMapping = () => {
        setMapColumnsState('active')
        setPreviewState('hidden')
    }

    
    const executeUpload = () => {
        setExecutionInProgress(true)
        API.post('/api/grid/upload/execute', { params: { gridId: gridId, uploadId: uploadId, sheetName: sheet, columnMapping: columnMapping } }).then((data) => {


            setShowExecutionFinishedDialog(true)
        })
    }


    const closeExecutionFinishedDialog = () => {
        setShowExecutionFinishedDialog(false)
        onClose()
    }



    const resetAll = () => {
        setFilename(null)
        setUploadErrorMessage(null)
        setUploadDisabled(false)
        setSelectSheetState('hidden')
        setMapColumnsState('hidden')
        setPreviewState('hidden')
        setSheetNames(null)
        setColumnMapping([])
        setUploadId(uuidv4())
    }




    


    const modifiedColumns = React.useMemo( () => {
        let ret = []
        if(uploadPreview == null || uploadPreview.columnInfo == null || uploadPreview.columnInfo.modifiedColumns == null) {
            return ret            
        }
        for(let column of gridColumnDefs.columns) {
            let columnId = column.id
            let columnLabel = column.label
            if(uploadPreview.columnInfo.modifiedColumns[columnId] != null) {
                ret.push({
                    label: columnLabel,
                    count: uploadPreview.columnInfo.modifiedColumns[columnId]
                })
            }
        }
        return ret
    }, [uploadPreview,gridColumnDefs]);






    return (

        <>

        <div className="file-upload excel-upload">
            <Stepper orientation="vertical">

                <Step key='upload' active={true}>
                    <StepLabel>
                        Upload Excel File
                    </StepLabel>
                    <StepContent style={{width: '60%'}}>
                        <FileUpload
                            disabled={uploadDisabled}
                            onFileSelect={handleUpload}
                        />
                        {
                            filename || uploadInProgress ?
                                uploadErrorMessage ?
                                    <div className="upload-result error">
                                        <span style={{ fontWeight: 'bold', color: 'red' }}>ERROR: </span>
                                        Message
                                    </div>
                                    :
                                    <div className="upload-result success">
                                        { uploadInProgress ?
                                            <CircularProgress size="1rem" style={{alignSelf: "center"}}/>
                                        :
                                            null
                                        }
                                        { filename ?
                                            <>{filename} <SuccessIcon style={{ marginTop: '-4px', marginLeft: '4px', color: 'green' }} /></>
                                        :
                                            null
                                        }
                                    </div>
                            :
                                null
                        }
                    </StepContent>
                </Step>






                <Step key='select-sheet' active={selectSheetState === 'active' || selectSheetState === 'done'}>
                    <StepLabel>
                        Select Sheet
                    </StepLabel>
                    <StepContent>
                        { sheetNames ? 
                            <FormControl className="select-sheet-form" disabled={selectSheetState === 'done'} size="small" variant="filled" style={{display: 'flex', flexFlow: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                                <Select
                                    value={sheet}
                                    onChange={handleSheetChange}
                                    label="Sheet"
                                    style={{width:'200px', backgroundColor: 'white'}}
                                >
                                    { sheetNames.map( sheetName => <MenuItem key={sheetName} value={sheetName}>{sheetName}</MenuItem> ) }
                                </Select>
                                <Button
                                    size="small"
                                    disabled={selectSheetState === 'done'}
                                    onClick={confirmSheet}
                                    style={{
                                        marginLeft: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.9)'
                                    }}
                                    endIcon={<IconifyIcon icon="ic:round-keyboard-double-arrow-right" />}
                                >
                                        continue
                                </Button>
                            </FormControl>
                        :
                            <div><CircularProgress size="1rem"/></div>
                        }   
                    </StepContent>

                </Step>




                <Step key='column-mapping' active={mapColumnsState === 'active' || mapColumnsState === 'done'}>
                    <StepLabel>
                        Column Mapping
                    </StepLabel>
                    <StepContent>
                        { typeof gridColumnDefs !== 'undefined' && typeof excelColumnNames !== 'undefined' && gridColumnDefs.columns.length > 0 && excelColumnNames.length > 0 ?
                            <>
                                <ColumnMapping
                                    disabled={mapColumnsState !== 'active'}
                                    mappingData={columnMapping}
                                    setMappingData={setColumnMapping}
                                    isValid={columnMappingIsValid}
                                    setIsValid={setColumnMappingIsValid}
                                    targetColumnDefs={gridColumnDefs}
                                    sourceColumnNames={excelColumnNames}
                                />
                                <FormControl
                                    size="small"
                                    variant="standard"
                                    style={{
                                        display: 'flex',
                                        flexFlow: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                    <Button
                                        disabled={mapColumnsState === 'done'}
                                        size="small"
                                        onClick={goBackToSelectSheet}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                        }}
                                        startIcon={<IconifyIcon icon="fluent:arrow-reply-all-16-regular" />}
                                    >
                                            go back
                                    </Button>
                                    <Button
                                        disabled={columnMappingIsValid === false || mapColumnsState === 'done'}
                                        size="small"
                                        onClick={confirmColumnMapping}
                                        style={{
                                            marginLeft: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                        }}
                                        endIcon={<IconifyIcon icon="ic:round-keyboard-double-arrow-right" />}
                                    >
                                        continue
                                    </Button>
                                </FormControl>
                            </>
                        :
                            <div><CircularProgress size="1rem"/></div>
                        }
                    </StepContent>
                </Step>




                <Step key='preview' active={previewState === 'active' || previewState === 'done'}>
                    <StepLabel>
                        Upload Preview
                    </StepLabel>
                    <StepContent>
                        <>
                            { uploadPreview == null ?
                                <CircularProgress/>
                            :
                                <div className="upload-preview">
                                    <div className="block">
                                        <div className="label">
                                            Rows
                                        </div>
                                        <div className="entry">
                                            Newly inserted rows: <span className="value">{uploadPreview.rowInfo.newlyInsertedRows}</span>
                                        </div>
                                        <div className="entry">
                                            Rows with modified values: <span className="value">{uploadPreview.rowInfo.modifiedRows}</span>
                                        </div>
                                        <div className="entry">
                                            Rows with unchanged values: <span className="value">{uploadPreview.rowInfo.unchangedRows}</span>
                                        </div>
                                    </div>
                                    <div className="block">
                                        <div className="label">
                                            Cells
                                        </div>
                                        <div className="entry">
                                            Newly inserted cells: <span className="value">{uploadPreview.cellInfo.newlyInsertedCells}</span>
                                        </div>
                                        <div className="entry">
                                            Cells with modified values: <span className="value">{uploadPreview.cellInfo.modifiedCells}</span>
                                        </div>
                                        <div className="entry">
                                            Cells with unchanged values: <span className="value">{uploadPreview.cellInfo.unchangedCells}</span>
                                        </div>
                                    </div>
                                    { modifiedColumns != null && modifiedColumns.length > 0 ?
                                        <div className="block">
                                            <div className="label">
                                                Columns with inserted or modified cells
                                            </div>
                                            { modifiedColumns.map(entry => 
                                                <div className="entry">
                                                    <span>{entry.label}: </span><span className="value">{entry.count}</span>
                                                </div>
                                            )}
                                        </div>
                                    :
                                        null
                                    }
                                    { uploadPreview.errors.illegalRowKeys != null && uploadPreview.errors.illegalRowKeys.length > 0 ?
                                        <div className="block">
                                            <div className="label">
                                                Errors
                                            </div>
                                            { uploadPreview.errors.illegalRowKeys.map(entry => 
                                                <div className="entry">
                                                    <span><b style={{color: 'red'}}>INVALID ROW KEY</b>: Row: {entry.rowIndex}. Source column: {entry.sourceColumn}. Target column: {entry.targetColumn.label}</span>
                                                </div>
                                            )}
                                        </div>
                                    :
                                        null
                                    }
                                </div>
                            }
                            <FormControl
                                disabled={mapColumnsState === 'done'}
                                size="small"
                                variant="standard"
                                style={{
                                    display: 'flex',
                                    flexFlow: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                <Button
                                        size="small"
                                        onClick={goBackToColumnMapping}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                        }}
                                        startIcon={<IconifyIcon icon="fluent:arrow-reply-all-16-regular" />}
                                    >
                                        go back
                                </Button>
                                <LoadingButton
                                    size="small"
                                    loading={executionInProgress}
                                    loadingPosition="end"
                                    // variant="contained"                                    
                                    // disabled={columnMappingIsValid === false}
                                    onClick={executeUpload}
                                    style={{
                                        marginLeft: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.9)'
                                    }}
                                    endIcon={<IconifyIcon icon="fluent:send-copy-20-filled" />}
                                >
                                    { executionInProgress ?
                                        <span>Upload In Progress</span>
                                    :
                                        <span>Execute Upload</span>
                                    }
                                </LoadingButton>
                            </FormControl>
                            <Dialog
                                className="execute-upload-finished"
                                open={showExecutionFinishedDialog}
                                onClose={closeExecutionFinishedDialog}
                            >
                                <DialogTitle
                                    style={{
                                        fontSize: '14px',
                                        color: '#222',
                                        fontWeight: 'bold',
                                        padding: '16px 0px 0px 16px'
                                    }}
                                >
                                    <span>Upload finished</span>
                                </DialogTitle>
                                <DialogContent>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#444',
                                            fontWeight: 'normal',
                                            padding: '8px 16px 0px 16px'
                                        }}
                                    >
                                        The upload process has been finished. Please close this view to go back to the grid view.
                                    </div>
                                </DialogContent>
                                <DialogActions>
                                    <Button size="small" onClick={closeExecutionFinishedDialog}>Close</Button>
                                </DialogActions>
                            </Dialog>

                        </>
                    </StepContent>
                </Step>


            </Stepper>








        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#EEE', display: 'flex', flexFlow: 'column' }}>
            <Button size="small" style={{ margin: '2px', alignSelf: 'center' }} startIcon={<RefreshIcon />} onClick={resetAll}>Reset All</Button>
        </div>

        </>

    )







}









