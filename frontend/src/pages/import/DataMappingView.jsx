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
import ColumnMapping from '../../components/ColumnMapping'

import './DataMappingView.scss'











const ExcelTemplateMapping = ({
    importInstance,
    onExcelSheetChange,
    onMappingChange,
    mappingIsValid,
    onMappingIsValidChange
}) => {

    


    /*
    React.useEffect( () => {
        // console.log("EXCEL TEMPLATE MAPPING")
        // console.log("importInstance effect")
        console.log(importInstance.valueMapping.excel.casesScheme)

        // problem:
        // man macht setMapping -> reneder der componenten -> setMapping nach außen (andere reference)


    }, [importInstance])
    */







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

            { importInstance?.valueMapping?.excel?.dataSheet == null ? null : 
                <>
                    <div className='label'>
                        <div className='index'>b</div>
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
        mappingIsValid,
        onMappingIsValidChange,
        uiBlockMsg
    } = props








    return (

        <div className='data-mapping-view'>


            { uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg}/>
            :
                null
            }


            { importInstance?.uploadFormat === 'excel_template' ? 
                <ExcelTemplateMapping
                    importInstance={importInstance}
                    onExcelSheetChange={onExcelSheetChange}
                    onMappingChange={onMappingChange}
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





