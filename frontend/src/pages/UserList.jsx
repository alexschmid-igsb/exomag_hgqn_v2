import * as React from 'react'
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import Button from '@mui/material/Button'

import HomeIcon from '@mui/icons-material/HomeRounded'
import AdminIcon from '@mui/icons-material/AdminPanelSettingsRounded'
// import UsersIcon from '@mui/icons-material/Group'
import AddUserIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'

import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import DialogTitle from '../components/DialogTitle'
import BooleanCellRenderer from '../components/aggrid/BooleanCellRenderer';

import VerticalSeparator from '../components/VerticalSeparator'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import API from '../api/fetchAPI'

import './UserList.scss'

function UsersIcon() {
    return <IconifyIcon icon="ph:user-list-fill"/>
}








export default function UserList() {

    const dispatch = useDispatch()

    const gridRef = React.useRef()
    const currentUser = useSelector((state) => state.user)
    const [userList, setUserList] = React.useState(null)

    const breadcrumbs = [
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        },
        {
            key: 'users',
            label: 'Users',
            path: '/users',
            icon: UsersIcon
        }
    ]

    const valueGetter = params => {
        let colId = params.colDef.colId
        return params.data[colId]
    }

    const columnDefs = [
        /*
        {
            colId: 'id',
            field: 'User ID',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        */
        {
            colId: 'firstname',
            field: 'Firstname',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'lastname',
            field: 'Lastname',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'username',
            field: 'Username',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'email',
            field: 'Email',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'site',
            field: 'Site',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'role',
            field: 'Role',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'isAdmin',
            field: 'Admin',
            filter: false,
            resizable: true,
            valueGetter: valueGetter,
            cellRenderer: BooleanCellRenderer
        },
        {
            colId: 'isRegistered',
            field: 'Registration Completed',
            filter: false,
            resizable: true,
            valueGetter: valueGetter,
            cellRenderer: BooleanCellRenderer
        },
        /*
        {
            colId: 'registrySendWhen',
            field: 'Invite date',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        },
        {
            colId: 'registryToken',
            field: 'Registry token',
            filter: false,
            resizable: true,
            valueGetter: valueGetter
        }
        */
    ]

    const defaultColDef = React.useMemo(() => ({
        sortable: true
    }))

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(renderToolbar()))
        loadUserData()
    }, [])

    const loadUserData = () => {
        API.get('/api/user/list-public/').then(data => {
            setUserList(data)
        })
    }

    const gridSizeChanged = () => {
        gridRef.current.api.sizeColumnsToFit()
    }

    const renderToolbar = () =>
        <>

            {/* <VerticalSeparator color={'#888'} />
            nix */}
            {/* <Button
                size="small"
                startIcon={<AddUserIcon />}
                onClick={openAddUserDialog}
            >
                Add User
            </Button> */}
        </>




    const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false)

    const openAddUserDialog = () => {
        setAddUserDialogOpen(true)
    }

    const closeAddUserDialog = () => {
        setAddUserDialogOpen(false)
    }

    const onAddUserSuccess = () => {
        setAddUserDialogOpen(false)
        loadUserData()
    }




    // const renderAddUserDialog = () =>
    //     <Dialog
    //         scroll='body'
    //         // fullWidth={true}
    //         // fullWidth={fullWidth}
    //         // maxWidth={maxWidth}
    //         maxWidth={false}
    //         open={addUserDialogOpen}
    //         onClose={closeAddUserDialog}
    //     >
    //         <DialogTitle onClose={closeAddUserDialog}>
    //             <AddUserIcon style={{marginRight: '8px'}} />
    //             <span style={{marginBottom: '-4px'}}>Add User</span>
    //         </DialogTitle>
    //         <DialogContent>
    //             <AddUserForm
    //                 usernames={userList !== null ? userList.map(user => user.username) : []}
    //                 emails={userList !== null ? userList.map(user => user.email) : []}
    //                 onSuccess={onAddUserSuccess}
    //             />
    //         </DialogContent>
    //     </Dialog>



    const renderView = () =>
        <div className="grid-container ag-theme-alpine ag-theme-alpine-modified">
            <AgGridReact
                ref={gridRef}

                columnDefs={columnDefs}             // Column Defs for Columns
                defaultColDef={defaultColDef}       // Default Column Properties

                rowData={userList}

                animateRows={true}
                // rowSelection='multiple'

                // onCellClicked={cellClickedListener}

                onGridSizeChanged={gridSizeChanged}
                // getRowId={getRowId}

                suppressCellSelection={true}
            />
        </div>



    return (
        <>
            {currentUser ? renderView() : <Navigate replace to="/home" />}
        </>
    )

}


