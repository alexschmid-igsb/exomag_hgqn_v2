import * as React from 'react'
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

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

import VerticalSeparator from '../components/VerticalSeparator'

import API from '../api/fetchAPI'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import download from 'downloadjs'

import './Uploads.scss'

const UploadsIcon = () => <IconifyIcon icon="ph:upload-simple-bold"/>


export default function Uploads() {

    const dispatch = useDispatch()

    const gridRef = React.useRef()
    const currentUser = useSelector((state) => state.user)
    const [uploads, setUploads] = React.useState([])

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
            key: 'uploads',
            label: 'Uploads',
            path: '/admin/uploads',
            icon: UploadsIcon
        }
    ]

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        /* dispatch(setToolbar(renderToolbar())) */
        loadUploads()
    }, [])

    const loadUploads = () => {
        API.get(`/api/upload_event/list`).then(data => {
            setUploads(data)
            console.log("DATA")
            console.log(data)
        })
    }



    const downloadFile = fileId => {
        API.get(`/api/file/get`, {
            params: {
                fileId: fileId
            }
        }).then(file => {
            download(file.buffer, file.filename /*, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } */ )
        })
    }
    
    const renderToolbar = () =>
        <>
            <VerticalSeparator color={'#888'} />
            <Button
                size="small"
                startIcon={<AddUserIcon />}
                // onClick={openAddUserDialog}
            >
                Add User
            </Button>
        </>




    const renderView = () =>
        <div className="admin-view-uploads">


            <div className="list">
                <div className="header">
                    <div className="cell grid">Grid</div>
                    <div className="cell user">User</div>
                    <div className="cell time">Time</div>
                    <div className="cell type">Type</div>
                    <div className="cell file">File</div>
                </div>

                { uploads.map(entry => 
                    <div className="row">
                        <div className="cell grid">{entry.grid}</div>
                        <div className="cell user">{entry.user}</div>
                        <div className="cell time">{entry.timestamp}</div>
                        <div className="cell type">{entry.type}</div>
                        <div className="cell file">
                            { entry.file != null ?
                                <IconButton
                                    className="inline-button"
                                    size="small"
                                    style={{
                                        color: '#1976d2',
                                        marginLeft: '4px',
                                        borderRadius: '5px',
                                        padding: '2px'
                                    }}
                                    onClick={() => downloadFile(entry.file)}
                                >
                                    <IconifyIcon style={{fontSize: '24px'}} icon="bi:file-earmark-arrow-down"/>
                                </IconButton>
                        
                                // <a href="/api/file/download" target="_blank" style={{color: '#222'}}>
                                    
                                // </a>
                                : null
                            }


                        </div>
                    </div>
                )}

            </div>

        </div>



    return (
        <>
            {currentUser && currentUser.isAdmin ? renderView() : <Navigate replace to="/home" />}
        </>
    )

}


