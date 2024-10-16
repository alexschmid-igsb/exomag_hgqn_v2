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
import LargeErrorOverlay from '../../components/util/LargeErrorOverlay'
import FileList from './FileList'

import UploadFormats from './UploadFormats'
import ColumnMapping from '../../components/ColumnMapping'

import './DataMappingView.scss'








// WICHTIG: CSV UND TSV WERDEN AB DEM MAPPING ALS GLEICH ANGESEHEN. DIE COLUMN NAMES UND DAS MAPPING WERDEN FÜR CSV AN
//          DER GLEICHEN STELLE ABGELEGT WIE FÜR excel_template




// auch für csv

const ExcelTemplateMapping = ({
    importInstance,
    onExcelSheetChange,
    onMappingChange,
    loadCSVHeader,
    mappingIsValid,
    onMappingIsValidChange
}) => {

    // für csv muss nur einmal 
    React.useEffect(() => {
        console.log("INIT EXCEL TEMPLATE MAPPING")
        if(importInstance?.uploadFormat === 'csv' && importInstance.valueMapping.excel.columnNames == null) {
            console.log("JA")
            loadCSVHeader()
        } else {
            console.log("NEIN")
        }
    }, [])

    const handleExcelSheetChange = event => {
        let value = event.target.value
        onExcelSheetChange(value)
    }

    const handleMappingChange = newMapping => {
        if(lodash.isEqual(importInstance.valueMapping.excel.mapping, newMapping) === false) {
            onMappingChange(newMapping)
        }
    }

    return (
        <>
            { importInstance?.uploadFormat === 'excel_template' ? 
                <>
                    <div className='label first'>
                        <div className='index'>a</div>
                        <span className='text'>select data sheet</span>
                    </div>
                    <FormControl
                        fullWidth
                        variant="filled"
                        size="small"
                    >
                        <Select
                            className="select-excel-sheet"
                            value={importInstance?.valueMapping?.excel?.dataSheet == null ? '' : importInstance?.valueMapping?.excel?.dataSheet}
                            onChange={handleExcelSheetChange}
                        >
                            {
                                lodash.isArray(importInstance?.valueMapping?.excel?.sheets) && importInstance?.valueMapping?.excel?.sheets.length > 0 ? 
                                    importInstance?.valueMapping?.excel?.sheets.map( entry => <MenuItem value={entry}>{entry}</MenuItem>)
                                :
                                    <MenuItem value={''}><em>&lt;None&gt;</em></MenuItem>
                            }
                        </Select>
                    </FormControl>
                </>
            :
                null
            }

            {
                (importInstance?.uploadFormat === 'excel_template' && importInstance?.valueMapping?.excel?.dataSheet && importInstance.valueMapping.excel.columnNames != null) || 
                (importInstance?.uploadFormat === 'csv' && importInstance.valueMapping.excel.columnNames != null) ?
                <>
                    <div className={`label field ${importInstance?.uploadFormat === 'csv' ? 'first' : ''}`}>
                        <div className='index'>{importInstance?.uploadFormat === 'excel_template' ? 'b' : importInstance?.uploadFormat === 'csv' ? 'a' : ''}</div>
                        <span className='text'>field mapping</span>
                    </div>
                    <ColumnMapping
                        // disabled={mapColumnsState !== 'active'}

                        mappingData={importInstance.valueMapping.excel.mapping}
                        setMappingData={handleMappingChange}

                        isValid={mappingIsValid}
                        setIsValid={onMappingIsValidChange}

                        sourceColumnNames={importInstance.valueMapping.excel.columnNames}
                        // targetColumnDefs={gridColumnDefs}
                        targetFields={importInstance.valueMapping.excel.dataDesc}
                    />
                </>
            :
                null
            }

        </>

        
        




        // <FormControl className="select-sheet-form" disabled={selectSheetState === 'done'} size="small" variant="filled" style={{display: 'flex', flexFlow: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
        //     <Select
        //         value={sheet}
        //         onChange={handleSheetChange}
        //         label="Sheet"
        //         style={{width:'200px', backgroundColor: 'white'}}
        //     >
        //         { sheetNames.map( sheetName => <MenuItem key={sheetName} value={sheetName}>{sheetName}</MenuItem> ) }
        //     </Select>
        //     <Button
        //         size="small"
        //         disabled={selectSheetState === 'done'}
        //         onClick={confirmSheet}
        //         style={{
        //             marginLeft: '8px',
        //             backgroundColor: 'rgba(255,255,255,0.9)'
        //         }}
        //         endIcon={<IconifyIcon icon="ic:round-keyboard-double-arrow-right" />}
        //     >
        //             continue
        //     </Button>
        // </FormControl>



        // <div>hello</div>
        


    )
}













export default function DataMappingView(props) {

    const {
        importInstance,
        onExcelSheetChange,
        onMappingChange,
        loadCSVHeader,
        mappingIsValid,
        onMappingIsValidChange,
        uiBlockMsg,
        uiErrorMsg
    } = props



    return (

        <div className='data-mapping-view'>

            { uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg}/>
            :
                null
            }

            { uiErrorMsg != null ?
                <LargeErrorOverlay title={uiErrorMsg.title} message={uiErrorMsg.message} details={uiErrorMsg.details}/>
            :
                null
            }

            { importInstance?.uploadFormat === 'excel_template' || importInstance?.uploadFormat === 'csv' ? 
                <ExcelTemplateMapping
                    importInstance={importInstance}
                    onExcelSheetChange={onExcelSheetChange}
                    onMappingChange={onMappingChange}
                    loadCSVHeader={loadCSVHeader}
                    mappingIsValid={mappingIsValid}
                    onMappingIsValidChange={onMappingIsValidChange}
                 />

            : importInstance?.uploadFormat === 'excel_clinvar' ? 
                <div>The upload format '<b>Excel</b> (Clinvar)' will be available only from the next version of this application. Please go back and use the "Excel Template" upload format in the meantime.</div>

            : importInstance?.uploadFormat === 'phenopacket' ? 
                <div>The upload format '<b>Phenopacket</b>' will be available only from the next version of this application. Please go back and use the "Excel Template" upload format in the meantime.</div>
            :
                null
            } 





            



            

        </div>
    )
}





