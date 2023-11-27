import * as React from 'react'
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
import RemoveUserIcon from '@mui/icons-material/PersonOff'

// import RemoveUserIcon from '@mui/icons-material/PersonOff'
// import ResetPasswordIcon from '@mui/icons-material/LockResetRounded'
// import ResetActivationIcon from '@mui/icons-material/RestartAltRounded'

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

import templates from '../util/mail/base/Templates'
import API from '../api/fetchAPI'

import './UserManagement.scss'


const ActionsCellRenderer = (props) => {
    const user = {
        id: props.value.id,
        username: props.value.username,
        email: props.value.email
    }
    return (
        <>

            <Tooltip title="Reset Activation" placement="top">
                <IconButton className="action-button" aria-label="refresh" size="small" onClick={() => props.context.openResetActivationDialog(user)} >
                    <IconifyIcon icon="material-symbols:restart-alt-rounded"/>
                </IconButton>
            </Tooltip>
            { props.value.actions.activation.token == null ? 
                <Tooltip title="Reset Password" placement="top">
                    <IconButton className="action-button" aria-label="refresh" size="small" onClick={() => props.context.openResetPasswordDialog(user)} >
                        <IconifyIcon icon="material-symbols:lock-reset-rounded"/>
                    </IconButton>
                </Tooltip>
            : null }
            <Tooltip title="Delete User" placement="top">
                <IconButton className="action-button" aria-label="refresh" size="small" onClick={() => props.context.openDeleteUserDialog(user)} >
                   <IconifyIcon icon="material-symbols:person-off"/>
                </IconButton>
            </Tooltip>
        </>
    )
}



const StateRenderer = (props) => {
    const color = props.value == 'ACTIVATED' ? 'darkgreen' : '#888'
    return (
        <span style={{fontWeight: 'bold', color: color}}>
            {props.value}
        </span>
    )
}











function AddUserForm({usernames,emails,onSuccess}) {

    const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    const [username, setUsername] = React.useState(null)
    const [email, setEmail] = React.useState(null)
    const [sendActivationLink, setSendActivationLink] = React.useState(true)

    const [errorMessage, setErrorMessage] = React.useState(null)
    const [successMessage, setSuccessMessage] = React.useState(null)

    const handleUsernameChange = (event) => setUsername(event.target.value)
    const handleEmailChange = (event) => setEmail(event.target.value)
    const handleSendActivationLinkChange = (event) => setSendActivationLink(event.target.checked)

    const addUser = () => {
        // console.log(`username: ${username}`)
        // console.log(`email: ${email}`)
        // console.log(`send registry: ${sendRegistryLink}`)

        if(typeof username !== 'string' || username.trim().length == 0) {
            setErrorMessage('Username is required')
            return
        }

        if(typeof email !== 'string' || email.trim().length == 0) {
            setErrorMessage('Email is required')
            return
        }

        if(usernames.includes(username)) {
            setErrorMessage('Username already exists!')
            return
        }

        if(emails.includes(email)) {
            setErrorMessage('Email already exists!')
            return
        }

        const isEmail = EMAIL_REGEX.test(email)
        console.log(isEmail)
        if(!isEmail) {
            setErrorMessage('Wrong email syntax')
            return
        }

        setErrorMessage(null)

        API.post('/api/user/add-user-admin', {
            params: {
                username: username.trim(),
                email: email.trim(),
                sendActivationLink: sendActivationLink,
                template: templates['activation']
            }
        }).then( user => {
            setSuccessMessage('User created')
            setTimeout(onSuccess, 1000)
        })
    }

    return (
        <div className="add-user-form">
            <TextField
                // required
                id="username"
                label="Username"
                variant="filled"
                size="small"
                value={username}
                onChange={handleUsernameChange}
            />
            <TextField
                // required
                id="email"
                label="Email"
                variant="filled"
                size="small"
                value={email}
                onChange={handleEmailChange}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        defaultChecked
                        value={sendActivationLink}
                        onChange={handleSendActivationLinkChange}
                    />
                }
                label="Send activation link"
            />
            <Button
                style={{alignSelf: 'center'}}
                onClick={addUser}
            >
                Add User&nbsp;<AddUserIcon/>
            </Button>
            {errorMessage ? <div className="message error-message">{errorMessage}</div> : null}
            {successMessage ? <div className="message success-message">{successMessage}</div> : null}
        </div>
    )
}










export default function UserManagement() {

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
            colId: 'state',
            field: 'State',
            filter: false,
            resizable: true,
            valueGetter: valueGetter,
            cellRenderer: StateRenderer
        },

        {
            colId: 'state',
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
            data.map(user => {
                // console.log(user.username)
                // console.dir(user.actions, { depth: null })
                if(typeof user.actions.activation.token === 'string' && user.actions.activation.token.length === 32) {
                    user.state = 'ACTIVATION SENT'
                } else if(typeof user.actions.resetPassword.token === 'string' && user.actions.resetPassword.token.length === 32) {
                    user.state = 'PASSWORD RESET SENT'
                } else if(user.password === true) {
                    user.state = 'ACTIVATED'
                } else {
                    user.state = 'NO ACTIVATION SENT'
                }
            })
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

            {/* <VerticalSeparator color={'#888'} />
            <Button
                size="small"
                onClick={testEmail}
            >
                Test
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

























    const [resetActivationDialogOpen, setResetActivationDialogOpen] = React.useState(false)
    const [resetActivationUser, setResetActivationUser] = React.useState({})

    const openResetActivationDialog = (resetActivationUser) => {
        setResetActivationUser(resetActivationUser)
        setResetActivationDialogOpen(true)
    }

    const closeResetActivationDialog = () => {
        setResetActivationDialogOpen(false)
        setResetActivationUser({})
    }

    const executeActivationReset = () => {
        API.post('/api/user/reset-activation-admin', {
            params: {...resetActivationUser, template: templates['activationAdmin']}
        }).then(() => {
            setTimeout(() => {
                closeResetActivationDialog()
                loadUserData()
            }
            , 500)
        })
    }

    const renderResetActivationDialog = () =>
        <Dialog
            scroll='body'
            // fullWidth={true}
            // fullWidth={fullWidth}
            // maxWidth={maxWidth}
            maxWidth={false}
            open={resetActivationDialogOpen}
            onClose={closeResetActivationDialog}
        >
            <DialogTitle onClose={closeResetActivationDialog}>
                <IconifyIcon icon="fluent:key-reset-24-filled" style={{marginRight: '8px', marginLeft: '-4px', fontSize: '28px'}}/>                
                <span>Activation Reset</span>
            </DialogTitle>
            <DialogContent className="reset-password-dialog-content">
                <div>
                    Do you want to reset the activation for user <b>{resetActivationUser.username}</b>?<br/>
                    The user will receive an email to repeat the activation of the account.
                </div>
                <Button
                    style={{ marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.08)' }}
                    onClick={executeActivationReset}
                >
                    Confirm
                </Button>
            </DialogContent>
        </Dialog>







    








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
        API.post('/api/user/reset-password-admin', {
            params: { ...resetPasswordUser, template: templates['resetPasswordAdmin'] }
        }).then(() => {
            setTimeout(() => {
                closeResetPasswordDialog()
                loadUserData()
            }
            , 500)
        })
    }

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
                    Do you want to reset the password for user <b>{resetPasswordUser.username}</b>?<br/>
                    An email will be sent to the user to execute the password reset.
                </div>
                <Button
                    style={{ marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.08)' }}
                    onClick={executePasswordReset}
                >
                    Confirm
                </Button>
            </DialogContent>
        </Dialog>










    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = React.useState(false)
    const [deleteUser, setDeleteUser] = React.useState({})

    const openDeleteUserDialog = (deleteUser) => {
        setDeleteUser(deleteUser)
        setDeleteUserDialogOpen(true)
    }

    const closeDeleteUserDialog = () => {
        setDeleteUserDialogOpen(false)
        setDeleteUser({})
    }

    const executeUserDelete = () => {
        API.post('/api/user/delete-user-admin', {
            params: deleteUser
        }).then(() => {
            setTimeout(() => {
                closeDeleteUserDialog()
                loadUserData()
            }
            , 500)
        })
    }

    const renderDeleteUserDialog = () =>
        <Dialog
            scroll='body'
            // fullWidth={true}
            // fullWidth={fullWidth}
            // maxWidth={maxWidth}
            maxWidth={false}
            open={deleteUserDialogOpen}
            onClose={closeDeleteUserDialog}
        >
            <DialogTitle onClose={closeDeleteUserDialog}>
                <IconifyIcon icon="fluent:key-reset-24-filled" style={{marginRight: '8px', marginLeft: '-4px', fontSize: '28px'}}/>                
                <span>Delete User</span>
            </DialogTitle>
            <DialogContent className="reset-password-dialog-content">
                <div>
                    Do you want to delete the user <b>{deleteUser.username}</b>?<br/>
                </div>
                <Button
                    style={{ marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.08)' }}
                    onClick={executeUserDelete}
                >
                    Confirm
                </Button>
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
                    openResetActivationDialog: openResetActivationDialog,
                    openResetPasswordDialog: openResetPasswordDialog,
                    openDeleteUserDialog: openDeleteUserDialog
                }}
            />
        </div>



    return (
        <>
            {
                currentUser && currentUser.isAdmin ? renderView() : <Navigate replace to="/home" />
            }
            { renderAddUserDialog() }
            { renderResetActivationDialog() }
            { renderResetPasswordDialog() }
            { renderDeleteUserDialog() }
        </>
    )

}


