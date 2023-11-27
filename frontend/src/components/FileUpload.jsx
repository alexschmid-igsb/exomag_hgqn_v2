import React from 'react'
import Dropzone from 'react-dropzone'

import API from '../api/fetchAPI'
import BlockIcon from '@mui/icons-material/Block'

import './FileUpload.scss'

FileUpload.defaultProps = {
    multiple: false
}

export default function FileUpload({onFileSelect,disabled,multiple}) {
    
    const handleDrop = (acceptedFiles) => {
        if(multiple === false && acceptedFiles.length === 1) {
            onFileSelect(acceptedFiles[0])
        } else if(multiple === true && acceptedFiles.length >= 1) {
            onFileSelect(acceptedFiles)
        }
    }

    return (

        <Dropzone
            disabled={disabled}
            onDrop={handleDrop}
            multiple={multiple}
        >
            {
                ({getRootProps, getInputProps, isDragActive, isDragReject}) => (
                    <div className={`file-upload-dropzone ${disabled ? 'disabled' : ''} ${!disabled && isDragActive ? 'drag-active' : ''}`} {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className="inner">
                            <p>
                                {
                                    !disabled ? 
                                        isDragActive ?
                                            'Drop file to upload' :
                                            'Drag file here oder click to upload'
                                        :
                                        <BlockIcon className='blocked'/>
                                }
                            </p>
                        </div>
                    </div>
                )
            }
        </Dropzone>
    )

}




// https://upmostly.com/tutorials/react-dropzone-file-uploads-react
// https://www.digitalocean.com/community/tutorials/react-react-dropzone



