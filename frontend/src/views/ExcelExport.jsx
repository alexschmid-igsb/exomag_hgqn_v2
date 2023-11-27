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
// import DialogTitle from '@mui/material/DialogTitle'
import DialogTitle from '../components/DialogTitle'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import { v4 as uuidv4 } from 'uuid'

import './FileUpload.scss'
import './ExcelExport.scss'

// import { read, utils, writeFileXLSX } from 'xlsx'
// import * as xlsx from 'xlsx'
import * as xlsx from 'xlsx-js-style'
import download from 'downloadjs'







export default function ExcelExport({open,onClose,columnDefs,api,columnApi}) {



    const generateExcelFile = () => {

        // get visible columns
        const columnState = columnApi.getColumnState()
        // console.log(columnState)
        console.log(columnDefs)

        const getType = originalType => {
            switch(originalType) {
                case 'decimal': 
                case 'integer': 
                    return {t: 'n'}
                case 'date':
                    return {t: 'd', z: 'dd.mm.yyyy'}
                default:
                    return {t: 's'}
            }
        }

        const exportColumns = []
        for(let state of columnState) {
            if(state.hide === true) {
                continue
            }
            let colId = state.colId
            let column = columnApi.getColumn(colId)
            let headerName = column.colDef.headerName


            exportColumns.push({
                colId: colId,
                label: headerName,
                type: getType(column.colDef.originalType)
            })
        }

        // export data
        const exportData = []

        // create column headers
        exportData.push( exportColumns.map( col => {
            return {
                v: col.label,
                t: 's',
                s: {
                    font: {
                        bold: true,
                        color: {
                            rgb: "FFFFFF"
                        }
                    },
                    fill: {
                        fgColor: {
                            rgb: "AABBCC"
                        }
                    },
                    border: {
                        bottom: {
                            style: 'thin',
                            color: {
                                rgb: "000000"
                            }                         
                        }
                    }
                }
            }
        }))

        // iterate rows
        api.forEachNodeAfterFilterAndSort( (rowNode,index) => {
            let rowData = rowNode.data[1]
            let exportRow = []
            for(let col of exportColumns) {
                // console.log(col)
                let value = rowData[col.colId]?.value
                let cell = {
                    v: value,
                    ...col.type,
                    s: {
                        font: {
                            bold: false,
                            color: {
                                rgb: "444444"
                            }
                        }
                    }
                }
                exportRow.push(cell)
            }
            exportData.push(exportRow)
        })



        // create workbook
        const sheetname = 'exported data'
        const workbook = xlsx.utils.book_new()
        workbook.SheetNames.push(sheetname)
        const worksheet = xlsx.utils.aoa_to_sheet(exportData)
        worksheet['!cols'] = exportColumns.map(col => ({wch:25}))
        worksheet['!rows'] = [{hpx:30}, ...exportData.map(row => ({hpx:20}))]
        workbook.Sheets[sheetname] = worksheet
    
        // https://docs.sheetjs.com/docs/api/write-options/

        // das hier hat keinen vorteil?
        // const buffer = xlsx.write(workbook, {type: 'base64', bookType: 'xlsx'})
        // download(atob(buffer), 'data.xlsx', { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        // ansonsten gäbe es noch die möglichkeit type 'buffer' ...

        const buffer = xlsx.write(workbook, {
            type: 'binary',
            bookType: 'xlsx',
            cellDates: true
        })
        console.log("JETZT")
        console.log(typeof buffer)
        console.log(buffer)
        download(buffer, 'data.xlsx', { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

        setTimeout(() => onClose(), 500)
    }



    return (

        <Dialog
            scroll='body'
            // maxWidth={false}
            fullWidth={true}
            maxWidth={'md'}
            open={open}
            onClose={onClose}
        >
            <DialogTitle
                onClose={onClose}
            >
                <IconifyIconInline icon="file-icons:microsoft-excel" style={{ fontSize: '1.2rem', marginRight: '8px' /* color: '#227245'*/ }} /><span>Excel Export</span>
            </DialogTitle>

            <DialogContent>

                <div className="excel-export">

                    
                    <div className="message">
                        <div className="icon">
                            <IconifyIconInline icon="bxs:info-square"/>
                        </div>
                        <div className="text">
                            The excel export is based on the current <b>column settings</b>, the <b>filter settings</b> and the <b>data sortings</b>. Please adjust these settings to get the desired excel output results.
                        </div>
                    </div>

                    <Button
                            onClick={generateExcelFile}
                            style={{
                                marginTop: '20px'
                            }}
                            startIcon={<IconifyIcon icon="file-icons:microsoft-excel" />}
                        >
                            Generate Excel File
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    )

}









