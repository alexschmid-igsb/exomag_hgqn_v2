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
            <FormControl
                fullWidth
                variant="filled"
                size="small"
            >
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
                <span className="warning"><b>Warning:</b> Changing the import format will reset the list of uploaded files</span>
            </FormControl>

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





