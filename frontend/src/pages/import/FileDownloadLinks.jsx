import React from 'react'

import lodash from 'lodash'
import download from 'downloadjs'
import { Buffer } from 'buffer';


import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './FileDownloadLinks.scss'



export default function FileDownloadLinks({importInstance}) {

    const downloadFile = (file) => {
        download(Buffer.from(file.data, 'base64').buffer, file.name)
    }

    const renderLinks = files => {
        let ret = []
        for(let file of files) {
            ret.push(
                <a className="link file-download-link" onClick={() => downloadFile(file)}>{file.name}</a>
            )
        }
        // ret.push(
        //     <a className="file-download-link" href="">dummy</a>
        // )
        return ret
    }





    return (
        lodash.isArray(importInstance?.uploadedFiles) && importInstance?.uploadedFiles.length > 0 ? 
            <div className="file-download-links">
                { renderLinks(importInstance.uploadedFiles) }
            </div>
        :
            null
    )


    /*

    const resultCount = React.useMemo(() => {
        const entries = importInstance?.processing?.processedEntries
        if(entries != null && lodash.isArray(entries)) {
            return {
                success: entries.reduce( (sum,item) => sum + (item?.state?.importSuccessful === true ? 1 : 0), 0),
                error: entries.reduce( (sum,item) => sum + (item?.state?.importSuccessful == false ? 1 : 0), 0),
            }
        } else {
            return {
                success: 0,
                error: 0
            }
        }
    }, [importInstance])
    

    const renderDetails = () => {

        const entries = importInstance?.processing?.processedEntries
        if(entries == null || lodash.isArray(entries) === false) {
            return null
        }

        let list = []
        let i = 1
        for(let entry of entries) {
            let errors = []

            for(let fieldError of entry.report.fieldErrors) {
                errors.push(
                    <div className="error">
                        <IconifyIcon className="icon" icon="ph:caret-double-right-duotone"/>
                        <span>
                            <b>{fieldError.field}:</b> {fieldError.message}
                        </span>
                    </div>
                )
            }

            for(let topLevelError of entry.report.topLevelErrors) {
                errors.push(
                    <div className="error">
                        <IconifyIcon className="icon" icon="ph:caret-double-right-duotone"/>
                        <span>
                            {topLevelError.message}:
                        </span>
                    </div>
                )
            }

            for(let importError of entry.report.importErrors) {
                errors.push(
                    <div className="error">
                        <IconifyIcon className="icon" icon="ph:caret-double-right-duotone"/>
                        <span>
                            {importError.message}:
                        </span>
                    </div>
                )
            }

            list.push(
                <div className="entry-detail">
                    <div className="label">Datensatz {i}:</div>
                    { errors.length === 0 && entry.state != null && entry.state.importSuccessful === true ? 
                        <div className="success">
                            <IconifyIcon className="icon" icon="ph:caret-double-right-duotone"/>
                            <span><b>importiert</b></span>
                        </div>
                    :
                        null
                    }
                    {errors}
                </div>
            )
            i++
        }

        return list
    }


    return(

        importInstance?.processing?.excel?.state === 'FINISHED' ?

        <div className="processing-log">
            <div className="box">
                <div className="label">Zusammenfassung</div>
                <p>
                    Importierte Datensätze: <b>{ resultCount.success }</b>
                </p>
                <p>
                    Fehlerhafte Datensätze:  <b>{ resultCount.error }</b>
                </p>
            </div>
            <div className="box scroll">
                <div className="label">Detailansicht</div>
                { renderDetails() }
            </div>
        </div>

        :
            null
    )

    */


}



