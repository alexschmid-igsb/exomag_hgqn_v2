import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import lodash from 'lodash'

import API from '../../api/fetchAPI'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import FileUpload from '../../components/FileUpload'

import JSONView from '../../components/util/JSONView'
import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'
import FileList from './FileList'

import UploadFormats from './UploadFormats'

import './UploadView.scss'








export default function UploadView(props) {


    const {
        uploadFormat,
        onUploadFormatChange,
        uploadFormatConfig,
        onUploadFormatConfigChange,
        onFileUpload,
        uiBlockMsg,
        uploadedFiles,
        rejectedFiles
    } = props


    const uploadedFilesColumns = [
            // { id: 'id', label: 'ID' },
            { id: 'name', label: 'Name' },
            { id: 'size', label: 'Size' },
            { id: 'type', label: 'Source' }
        ]

    const rejectedFilesColumns = [
        // { id: 'id', label: 'ID' },
        { id: 'name', label: 'Name' },
        { id: 'size', label: 'Size' },
        { id: 'message', label: 'Reason' }
    ]


    const handleUploadFormatChange = event => {
        let value = event.target.value
        onUploadFormatChange(value)
    }

    const handleUpload = (files) => {
        onFileUpload(files)
    }



    // custom handling der CSV config

    // Falls dann später noch andere konfigurierbare upload formats hinzukommen, dann kann das ganz
    // genauso gemacht werden:

    // 1. Für das upload format das entsprechende config formular rendern

    // 2. Die Input Components werden an ihre entsprechenden werte in der updateFormatConfig gebunden.
    //    Das initialisieren der Werte übernimmt das backend, hier liegt die verantwortung über die deklarierten
    //    Felder und die zugehörigen init und default werte. Im frontend werden lediglich die formular
    //    komponenten angelegt um die Werte zu bearbeiten, aber es finden im frontend keine deklarationen
    //    der möglichen felder statt.

    // 3. In den handlern der input componenten immer das aktuell config objekt kopieren, den geänderten
    //    wert überschreiben und über onUploadFormatConfigChange übergeben. Die API query bekommt die ganze
    //    importInstance zurück und aktualisiert darüber dann auch die 

    // Wichtig: Das backend entscheidet über die korrektheit der übergebenen feldwerte und korrigiert
    // diese gegebenfalls (z.b. wenn sich preset und delimiter werte widersprechen)

    const handleDelimiterPresetChange = event => {
        let value = event?.target?.value
        let updated = lodash.cloneDeep(uploadFormatConfig)
        updated.csv.preset = value
        // console.log("preset change")
        // console.log(value)
        onUploadFormatConfigChange(updated)
    }

    const handleFieldDelimiterChange = event => {
        let value = event?.target?.value
        let updated = lodash.cloneDeep(uploadFormatConfig)
        updated.csv.field_delimiter = value
        // console.log("field delimiter change")
        // console.log(value)
        onUploadFormatConfigChange(updated)
    }

    // der record terminator ist eigentlich immer ein newline. csv-parse bietet ein autodetect, das wir hier verwenden wollen
    // um die anzahl der fehler quellen minimal zu halten
    // const handleRecordTerminatorChange = event => {
    //     let value = event?.target?.value
    //     let updated = lodash.cloneDeep(uploadFormatConfig)
    //     updated.csv.record_terminator = value
    //     // console.log("record terminator change")
    //     // console.log(value)
    //     onUploadFormatConfigChange(updated)
    // }




    return (


        <div className='upload-view'>

            { uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg}/>
                /*
                <div className="upload-in-progress">
                </div>
                */
            :
                null
            }

            <div className='label first'>
                <div className='index'>a</div>
                <span className='text'>select upload format</span>
            </div>
            <FormControl fullWidth variant="filled">

                <FormLabel>Format</FormLabel>

                {/* <InputLabel id='select-upload-format-label'>Import Format</InputLabel> */}

                <Select
                    className="select-upload-format"
                    // id="select-upload-format"
                    // labelId='select-upload-format-label'
                    value={uploadFormat == null ? Object.values(UploadFormats)[0].id : uploadFormat}
                    onChange={handleUploadFormatChange}
                >
                    {/* <MenuItem value={'none'}><em>&lt;None&gt;</em></MenuItem> */}
                    { Object.values(UploadFormats).map(entry => <MenuItem value={entry.id}>{entry.label}</MenuItem>) }
                </Select>

            </FormControl>

            { uploadFormat === 'csv' ?
                <>
                    <FormControl variant="filled">
                        <FormLabel>Delimiter Settings</FormLabel>
                        <RadioGroup
                            row
                            value={uploadFormatConfig.csv.preset}
                            onChange={handleDelimiterPresetChange}
                        >
                            <FormControlLabel value="csv" control={<Radio size="small"/>} label="CSV" />
                            <FormControlLabel value="tsv" control={<Radio size="small"/>} label="TSV" />
                            <FormControlLabel value="custom" control={<Radio size="small"/>} label="Custom" />
                        </RadioGroup>

                        <div class="row">
                            <TextField
                                value={uploadFormatConfig.csv.field_delimiter}
                                label="Field Delimiter"
                                variant="filled"
                                onChange={handleFieldDelimiterChange}
                                disabled={uploadFormatConfig.csv.preset === 'csv' || uploadFormatConfig.csv.preset === 'tsv'}
                            />
                            {/* <TextField
                                value={uploadFormatConfig.csv.record_terminator}
                                label="Record Terminator"
                                variant="filled"
                                onChange={handleRecordTerminatorChange}
                                disabled={uploadFormatConfig.csv.preset === 'csv' || uploadFormatConfig.csv.preset === 'tsv'}
                            /> */}
                        </div>

                    </FormControl>
                </>

                : null
            }

            <span className="warning"><b>Warning:</b> Changing the upload format or basic import settings will clear all uploaded files</span>



            <div className='label'>
                <div className='index'>b</div>
                <span className='text'>upload files</span>
            </div>
            <FileUpload
                multiple={true}
                disabled={ (uploadFormat === 'excel_template' || uploadFormat === 'excel_clinvar') && uploadedFiles.length > 0 }
                onFileSelect={handleUpload}
            />

            <div className='label'>
                <div className='index'>c</div>
                <span className='text'>overview</span>
            </div>
            <FileList
                title={<span style={{color: 'rgba(0,0,0,0.6)'}}>failed uploads</span>}
                titleIcon={<IconifyIcon className="signal-red" icon="entypo:cross"/>}
                titleIconPos='right'
                columns={rejectedFilesColumns}
                files={rejectedFiles}
                renderWhenEmpty={false}
            />

            <FileList
                title={<span style={{color: 'rgba(0,0,0,0.6)'}}>Uploaded Files</span>}
                titleIcon={<IconifyIcon className="signal-green" icon="entypo:check"/>}
                titleIconPos='right'
                columns={uploadedFilesColumns}
                files={uploadedFiles}
                renderWhenEmpty={true}
                emptyMessage='no uploaded files'
            />
            
        </div>


    )
}





