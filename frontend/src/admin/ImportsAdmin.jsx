import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import API from '../api/fetchAPI'
import ErrorMessage from '../components/util/ErrorMessage'

import CreateDateTimeFormatter from '../components/aggrid/DateTimeFormatter.js'

import LargeSpinnerOverlay from '../components/util/LargeSpinnerOverlay'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import HomeIcon from '@mui/icons-material/HomeRounded'
import AdminIcon from '@mui/icons-material/AdminPanelSettingsRounded'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import UploadFormats from '../pages/import/UploadFormats'
import ProcessingLog from '../pages/import/ProcessingLog'
import FileDownloadLinks from '../pages/import/FileDownloadLinks.jsx'

import '../components/aggrid/CustomTheme.scss'
import './ImportsAdmin.scss'



const DateFormatter = CreateDateTimeFormatter({type: 'datetime'})





const ImportView = ({importId,isOpen,onClose}) => {

    const [currentImport, setCurrentImport] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if(importId != null) {
            console.log("LOAD IMPORT: " + importId)
            loadImport()
        }
    }, [importId])

    const loadImport = () => {
        setIsLoading(true)
        API.post('/api/import/get-full-import-admin', {
            params: {
                importId: importId
            }
        }).then( response => {
            console.log(response.data[0])
            setCurrentImport({...response.data[0], state: response.data?.[0].processing?.excel?.state} )
            setIsLoading(false)
        })
    }

    const close = () => {
        onClose()
        setCurrentImport(null)
    }

    return (
        <Dialog
            className="import-view-dialog"
            open={isOpen}
            onClose={close}
            fullWidth={true}
            maxWidth='lg'
        >
            <DialogTitle>Import Details</DialogTitle>            
            <DialogContent className="content">
            {
                isLoading === true ?
                    <LargeSpinnerOverlay label="loading..."/>
                :
                currentImport != null ?
                    <table>
                        <tr><td>Name</td><td>{currentImport?.name}</td></tr>
                        <tr><td>Created</td><td>{DateFormatter({value: currentImport?.created})}</td></tr>
                        <tr><td>User</td><td>{currentImport?.user?.firstname + ' ' + currentImport?.user?.lastname}</td></tr>
                        <tr><td>Upload Format</td><td>{UploadFormats[currentImport?.uploadFormat]?.label ? UploadFormats[currentImport?.uploadFormat]?.label : 'undefined'}</td></tr>
                        <tr><td>Status</td><td>{currentImport?.state}</td></tr>
                        <tr><td>Uploaded Files</td><td>
                            <FileDownloadLinks importInstance={currentImport} />
                        </td></tr>
                        <tr><td>Log</td><td className="log">
                            <ProcessingLog importInstance={currentImport} />
                        </td></tr>
                    </table>
                :
                    null
            }
            </DialogContent>
            <DialogActions className="actions">
                <Button
                    startIcon={<IconifyIcon icon='basil:cancel-solid' />}
                    onClick={() => onClose()}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}















export default function ImportsAdmin() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const gridRef = React.useRef()
    const currentUser = useSelector((state) => state.user)

    const [error, setError] = React.useState(null)

    const [imports, setImports] = React.useState([])
    const [columnDefs, setColumnDefs] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true)

    const [importId, setImportId] = React.useState(null)
    const [importViewOpen, setImportViewOpen] = React.useState(false)

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(renderToolbar()))
        setColumnDefs(buildColumnDefs)
        loadImports()
    }, [])


    const renderToolbar = () => null

    
    const breadcrumbs = [
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        },
        {
            key: 'admin',
            label: 'Admin',
            path: '/admin',
            icon: AdminIcon
        },
        {
            key: 'imports',
            label: 'Imports',
            path: '/imports',
            icon: () => <IconifyIcon icon='bi:database-up' />
        }
    ]



    const loadImports = () => {

        console.log("loadImports")
        setIsLoading(true)

        API.get('/api/import/get-all-imports-admin').then( response => {
            // console.log(response.data)
            response.data = response.data.map(item => ({...item, state: item?.processing?.excel?.state}))

            setImports(response.data)
            setIsLoading(false)
        })
    }



    const buildColumnDefs = () => {
        let ret = [
            {
                autoHeight: true,
                field: 'name',
                valueGetter: valueGetter,
                headerName: 'Name',
                filter: false,
                resizable: true,
            },
            {
                autoHeight: true,
                field: 'created',
                valueGetter: valueGetter,
                headerName: 'Created',
                filter: false,
                resizable: true,
                valueFormatter: DateFormatter
            },
            {
                autoHeight: true,
                valueGetter: params => params?.data['user']?.firstname + ' ' + params?.data['user']?.lastname,
                headerName: 'User',
                filter: false,
                resizable: true,
            },
            {
                autoHeight: true,
                field: 'uploadFormat',
                valueGetter: valueGetter,
                cellRenderer: ({value}) => UploadFormats[value]?.label ? UploadFormats[value]?.label : 'undefined',
                headerName: 'Upload Format',
                filter: false,
                resizable: true,
            },
            {
                autoHeight: true,
                field: 'state',
                valueGetter: valueGetter,
                headerName: 'Status',
                filter: false,
                resizable: true,
            },
        ]
        return ret
    }



    const valueGetter = params => {
        return params.data[params.colDef.field]
    }



    const defaultColDef = React.useMemo(() => ({
        sortable: false
    }))



    const getRowId = params => params.data._id



    const rowClassRules = {
        'open': params => params.data.status === 'OPEN',
        'closed': params => params.data.status === 'CLOSED'
    }



    const closeImportView = () => {
        setImportId(null)
        setImportViewOpen(false)
    }


    const rowDoubleClickHandler = event => {
        setImportId(event.data._id)
        setImportViewOpen(true)
    }


    const renderView = () =>
        <>
            <div className="imports">

                <div className={`grid-container ag-theme-alpine ag-theme-alpine-modified`} style={{position: 'relative'}}>

                    { isLoading === true ?
                        <LargeSpinnerOverlay label="loading..."/>
                    :
                        null
                    }

                    <AgGridReact

                        // overlayNoRowsTemplate='<b>No imports available</b>'
                        overlayNoRowsTemplate='&nbsp;'

                        domLayout='autoHeight'

                        // className={`${hasExpandedRows ? 'has-expanded-rows' : ''}`}

                        ref={gridRef} // Ref for accessing Grid's API

                        columnDefs={columnDefs}             // Column Defs for Columns
                        defaultColDef={defaultColDef}       // Default Column Properties

                        rowData={imports} // Row Data for Rows

                        animateRows={true}

                        // rowSelection='multiple'
                        suppressRowClickSelection={true}                    // keine row selection by click

                        // onCellClicked={cellClickedListener}             // Optional - registering for Grid Event
                        // onCellDoubleClicked={ event => {alert('double')}}

                        onRowDoubleClicked={rowDoubleClickHandler}

                        // onGridSizeChanged={gridSizeChanged}

                        getRowId={getRowId}

                        rowClassRules={rowClassRules}

                        suppressCellSelection={true}

                    // context={{
                    //     gridId: gridId,
                    //     toggleExpand: toggleExpand
                    // }}

                    // onFilterChanged={ event => {
                    //     console.log("onFilterChanged")
                    //     dispatch(GridStore.incrementGridFilterUpdateCount(gridId))
                    // }}

                    // onSortChanged={ event => {
                    //     const columnState = event.columnApi.getColumnState()
                    //     const sortings = []
                    //     for(let state of columnState) {
                    //         if(state.sort != null) {
                    //             let column = event.columnApi.getColumn(state.colId)
                    //             let sorting = {
                    //                 colId: state.colId,
                    //                 headerName: column.colDef.headerName,
                    //                 sortDirection: state.sort,
                    //                 sortIndex: state.sortIndex
                    //             }
                    //             sortings.push(sorting)
                    //             // console.log(state)
                    //         }
                    //     }
                    //     sortings.sort( (a,b) => a.sortIndex > b.sortIndex ? 1 : a.sortIndex < b.sortIndex ? -1 : 0 )
                    //     dispatch(GridStore.setGridSortings(gridId,sortings))
                    // }}

                    // onColumnVisible={updateColumnStateControl}
                    // onColumnMoved={updateColumnStateControl}

                    // braucht man nicht, wenn man autoHeight verwendet
                    // getRowHeight={getRowHeight}
                    />


                </div>

            </div>        

            <ImportView
                importId={importId}
                onClose={closeImportView}
                isOpen={importViewOpen}
            />

        </>

    return currentUser && currentUser.isSuperuser ? renderView() : <Navigate replace to="/home" />
}