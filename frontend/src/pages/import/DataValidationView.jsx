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

import JSONView from '../../components/util/JSONView'
import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'

import ValidationGrid from './ValidationGrid'

import './DataValidationView.scss'












export default function DataValidationView(props) {

    const {
        importInstance,
        uiBlockMsg
    } = props

    

    React.useEffect(() => {

        console.log("HIER JETZT weöm föewä fwefk welkfä ")
        console.log(importInstance)
        
    }, [importInstance])






    return (

        <div className='data-validation-view'>


            { uiBlockMsg != null ?
                <LargeSpinnerOverlay label={uiBlockMsg}/>
            :
                null
            }


            <ValidationGrid
                dataValidated={importInstance.data.validated}
            />



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
            }  */}

            



            

        </div>
    )
}





