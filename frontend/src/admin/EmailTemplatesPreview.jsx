import * as React from 'react'

/*
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

import HomeIcon from '@mui/icons-material/HomeRounded'
import AdminIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import UsersIcon from '@mui/icons-material/Group'
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

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import VerticalSeparator from '../components/VerticalSeparator'

import BooleanCellRenderer from '../components/aggrid/BooleanCellRenderer'

import API from '../api/fetchAPI'
*/

import templates from '../util/mail/base/Templates'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import './EmailTemplatesPreview.scss'


/*
const desc = [
    {
        id: 'activation',
        data: {}
    },
    {
        id: 'passwordreset',
        data: {}
    },
]
*/


const desc = Object.keys(templates).map( item => ({ id: item, data: {}}) )




function TabPanel(props) {
    const { children, value, index, ...other } = props;



    const renderText = text => <>{ text.split('\n').map(line => <>{line}<br/></>) }</>

    return (
        <div
            className={'tabpanel' + (value !== index ? ' hidden' : '') }
            role="tabpanel"
            // hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div className="content-container">
                    <iframe className="html-content" srcdoc={templates[desc[value].id].html}/>
                    <div className="text-content">{renderText(templates[desc[value].id].text)}</div>
                </div>
            )}
        </div>
    )
}

export default function EmailTemplatesPreview() {

    const [value, setValue] = React.useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    

    return (

        <div className="email-template-preview">

            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                {desc.map(item => <Tab label={item.id}></Tab>)}
            </Tabs>

            {desc.map((item, index) => <TabPanel value={value} index={index}></TabPanel>)}
        </div>






    )

    /*
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
            key: 'admin',
            label: 'Admin',
            path: '/admin',
            icon: AdminIcon
        },
        {
            key: 'usermanagement',
            label: 'User Management',
            path: '/admin/usermanagement',
            icon: UsersIcon
        }
    ]

    const rowGetter = params => {
        return params.data
    }

    const valueGetter = params => {
        let colId = params.colDef.colId
        return params.data[colId]
    }

    const columnDefs = [
        {
            colId: 'id',
            field: 'User ID',
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
            field: 'Password',
            filter: false,
            resizable: true,
            valueGetter: valueGetter,
            cellRenderer: BooleanCellRenderer
        },
        {
            colId: 'registryToken',
            field: 'Actions',
            filter: false,
            resizable: true,
            valueGetter: rowGetter,
            cellRenderer: ActionsCellRenderer
        }
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
        API.get('/api/user/list/').then(data => {
            // TODO: hier aus dem json feld die json felder in sinvolle states konvertieren
            setUserList(data)
        })
    }

    const gridSizeChanged = () => {
        gridRef.current.api.sizeColumnsToFit()
    }

    const renderToolbar = () =>
        <>
            <Button
                size="small"
                startIcon={<AddUserIcon />}
                onClick={openAddUserDialog}
            >
                Add User
            </Button>

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





    const [registryInfoDialogOpen, setRegistryInfoDialogOpen] = React.useState(false)
    const [registryInfo, setRegistryInfo] = React.useState({})

    const openRegistryInfoDialog = (registryInfo) => {
        console.log("OPEN REGISTRY INFO DIALOG")
        console.log(registryInfo)
        setRegistryInfo(registryInfo)
        setRegistryInfoDialogOpen(true)
    }

    const closeRegistryInfoDialog = () => {
        setRegistryInfoDialogOpen(false)
        setRegistryInfo({})
    }

    const registryEmail = React.useMemo(() => registryInfo.email ? registryInfo.email : '', [registryInfo])
    const registrySubject = `${process.env.REACT_APP_NAME} Registration`
    const registryBody = React.useMemo(() => `Your account at the ${process.env.REACT_APP_NAME} has been created (or has been reset).\nPlease use the following link to complete the registration:\nhttp://${process.env.REACT_APP_HOST}/register/${registryInfo.registryToken}`, [registryInfo])

    



    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = React.useState(false)
    const [resetPasswordUser, setResetPasswordUser] = React.useState({})

    const openResetPasswordDialog = (resetPasswordUser) => {
        setResetPasswordUser(resetPasswordUser)
        setResetPasswordDialogOpen(true)
    }

    const closeResetPasswordDialog = () => {
        setResetPasswordDialogOpen(false)
        setResetPasswordUser({})
    }




    const executePasswordReset = () => {
        API.post('/api/user/resetpassword', {
            params: resetPasswordUser
        }).then(() => {
            setTimeout(() => {
                closeResetPasswordDialog()
                loadUserData()
            }
            , 500)
        })
    }

    












    const renderRegistryInfoDialog = () =>
        <Dialog
            scroll='body'
            // fullWidth={true}
            // fullWidth={fullWidth}
            // maxWidth={maxWidth}
            maxWidth={false}
            open={registryInfoDialogOpen}
            onClose={closeRegistryInfoDialog}
        >
            <DialogTitle onClose={closeRegistryInfoDialog}>
                <IconifyIcon icon="mdi:account-cog" style={{fontSize: '28px', marginRight: '8px'}}/>
                <span>Registration Info</span>
            </DialogTitle>
            <DialogContent className="registry-info-dialog-content">
                <table className="registry-info-table">
                    <tbody>
                        <tr>
                            <td>Email</td>
                            <td>{registryEmail}</td>
                            <td>
                                <Tooltip title="Copy to Clipboard" placement="right">
                                    <IconButton className="action-button" aria-label="refresh" size="small" onClick={event => { navigator.clipboard.writeText(registryEmail) }}>
                                        <IconifyIcon icon="ph:clipboard-text"/>
                                    </IconButton>
                                </Tooltip>
                            </td>
                        </tr>
                        <tr>
                            <td>Subject</td>
                            <td>{registrySubject}</td>
                            <td>
                                <Tooltip title="Copy to Clipboard" placement="right">
                                    <IconButton className="action-button" aria-label="refresh" size="small" onClick={event => { navigator.clipboard.writeText(registrySubject) }}>
                                        <IconifyIcon icon="ph:clipboard-text"/>
                                    </IconButton>
                                </Tooltip>
                            </td>
                        </tr>
                        <tr>
                            <td>Body</td>
                            <td>{ registryBody.split('\n').map((item,key) => <React.Fragment key={key}>{item}<br/></React.Fragment> )}</td>
                            <td>
                                <Tooltip title="Copy to Clipboard" placement="right">
                                    <IconButton className="action-button" aria-label="refresh" size="small" onClick={event => { navigator.clipboard.writeText(registryBody.replaceAll('<br/>','\n')) }}>
                                        <IconifyIcon icon="ph:clipboard-text"/>
                                    </IconButton>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </DialogContent>
        </Dialog>







    const renderAddUserDialog = () =>
        <Dialog
            scroll='body'
            // fullWidth={true}
            // fullWidth={fullWidth}
            // maxWidth={maxWidth}
            maxWidth={false}
            open={addUserDialogOpen}
            onClose={closeAddUserDialog}
        >
            <DialogTitle onClose={closeAddUserDialog}>
                <AddUserIcon style={{marginRight: '8px'}} />
                <span>Add User</span>
            </DialogTitle>
            <DialogContent>
                <AddUserForm
                    usernames={userList !== null ? userList.map(user => user.username) : []}
                    emails={userList !== null ? userList.map(user => user.email) : []}
                    onSuccess={onAddUserSuccess}
                />
            </DialogContent>
        </Dialog>





    const renderResetPasswordDialog = () =>
        <Dialog
            scroll='body'
            // fullWidth={true}
            // fullWidth={fullWidth}
            // maxWidth={maxWidth}
            maxWidth={false}
            open={resetPasswordDialogOpen}
            onClose={closeResetPasswordDialog}
        >
            <DialogTitle onClose={closeResetPasswordDialog}>
                <IconifyIcon icon="fluent:key-reset-24-filled" style={{marginRight: '8px', marginLeft: '-4px', fontSize: '28px'}}/>                
                <span>Password Reset</span>
            </DialogTitle>
            <DialogContent className="reset-password-dialog-content">
                <div>
                    Do you want to reset the password for user <b>{resetPasswordUser.username}</b>?
                </div>
                <Button
                    style={{ marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.08)' }}
                    onClick={executePasswordReset}
                >
                    Confirm
                </Button>
            </DialogContent>
        </Dialog>











    const renderView = () =>
        <div className="grid-container ag-theme-alpine ag-theme-alpine-modified">
            <AgGridReact
                className="users-grid"
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


                context={{
                    openRegistryInfoDialog: openRegistryInfoDialog,
                    openResetPasswordDialog: openResetPasswordDialog
                }}
            />
        </div>



    return (
        <>
            {
                currentUser && currentUser.isAdmin ? renderView() : <Navigate replace to="/home" />
            }
            { renderAddUserDialog() }
            { renderRegistryInfoDialog() }
            { renderResetPasswordDialog() }
        </>
    )

    */

}


