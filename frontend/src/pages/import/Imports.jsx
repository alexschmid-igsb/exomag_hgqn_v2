import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import API from '../../api/fetchAPI'
import ErrorMessage from '../../components/util/ErrorMessage'

import CreateDateTimeFormatter from '../../components/aggrid/DateTimeFormatter.js'

import LargeSpinnerOverlay from '../../components/util/LargeSpinnerOverlay'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import HomeIcon from '@mui/icons-material/HomeRounded'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import '../../components/aggrid/CustomTheme.scss'
import './Imports.scss'




import UploadFormats from './UploadFormats'


const DateFormatter = CreateDateTimeFormatter({type: 'datetime'})




const CreateImport = ({onConfirm}) => {
    const fieldRef = React.useRef()
    const [name, setName] = React.useState('');
    const [open, setOpen] = React.useState(false)
    const handleClickOpen = () => {
        setName('')
        setOpen(true)
        setTimeout(() => {
            if(fieldRef.current) {
                fieldRef.current.focus()
            }
        }, 50)
    }
    const confirm = () => {
        if(name.length > 0) {
            onConfirm(name)
            setOpen(false)
        }
    }
    const cancel = () => {
        setOpen(false)
    }
    return (
        <>
            <Button
                className="create-import-button"
                size="large"
                startIcon={<IconifyIcon icon="tabler:text-plus" />}
                onClick={handleClickOpen}
            >
                Create Import
            </Button>
            <Dialog className="create-import-dialog" open={open} onClose={() => setOpen(false)}>
                <DialogContent className="content">
                    <TextField
                        // focused
                        inputRef={fieldRef}
                        className="name-input"
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        fullWidth
                        variant="standard"
                        value={name}
                        onChange={event => {
                            setName(event.target.value)
                        }}
                    />
                </DialogContent>
                <DialogActions className="actions">
                    <Button
                        startIcon={<IconifyIcon icon='basil:cancel-solid' />}
                        onClick={cancel
                    }>
                        Cancel
                    </Button>
                    <Button
                        startIcon={<IconifyIcon icon='tabler:text-plus' />}
                        onClick={confirm}
                    >
                        Create Import
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}











export default function Imports() {

    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const gridRef = React.useRef()

    const [error, setError] = React.useState(null)

    const [imports, setImports] = React.useState([])
    const [columnDefs, setColumnDefs] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true)


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
            key: 'imports',
            label: 'Imports',
            path: '/imports',
            icon: () => <IconifyIcon icon='bi:database-up' />
        }
    ]



    const loadImports = () => {

        console.log("loadImports")
        setIsLoading(true)

        API.get('/api/import/get-import-list').then( response => {
            console.log(response.data)
            setImports(response.data)
            setIsLoading(false)
        })

        setImports(imports)
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
                field: 'state',
                valueGetter: valueGetter,
                headerName: 'Status',
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
                valueGetter: params => params?.data['user']?.firstname + ' ' + params?.data['user']?.lastname,
                headerName: 'User',
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



    const createImport = name => {
    
        API.post('/api/import/create', {
            params: {
                name: name
            }
        }).then( response => {
            loadImports()
        })
    }


    const rowDoubleClickHandler = event => {
        navigate(event.data._id)
    }




    return (

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


            <CreateImport onConfirm={createImport} />




        </div>
    )
}