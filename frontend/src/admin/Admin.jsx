
// On the client side, any check for permissions is a ui feature and not a security feature.
// Checking user rights happens always on the server side.

import * as React from 'react'
import { Navigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { setBreadcrumbs } from '../store/breadcrumbs'
import { setToolbar } from '../store/toolbar'

import HomeIcon from '@mui/icons-material/HomeRounded'
import AdminIcon from '@mui/icons-material/AdminPanelSettingsRounded'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

// "A common way to "protect" pages (routes) is to check for a logged in user, a user role or a user right and 
// render a redirect using react-routers Navigate if the user does not have access.
// Any "security" checks on client side are just ui features and can be passed easily. Real autentication / authorization
// can only be done on the server side securing the API access."

// https://www.robinwieruch.de/react-router-private-routes/
// https://www.robinwieruch.de/react-router-redirect/

import './Admin.scss'


export default function Admin() {

    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()

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
        }
    ]

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(null))
    }, [])

    return (
        <>
            { user && user.isAdmin ?
                <div className="admin-links">
                    <div className="category">
                        <h3>Stuff</h3>
                        <Link to="/admin/status"><IconifyIcon icon="material-symbols:double-arrow-rounded"/><span>Status</span></Link>
                        <Link to="/admin/usermanagement"><IconifyIcon icon="material-symbols:double-arrow-rounded"/><span>User Management</span></Link>
                        <Link to="/admin/uploads"><IconifyIcon icon="material-symbols:double-arrow-rounded"/><span>Uploads</span></Link>
                        <Link to="/admin/emailtemplates"><IconifyIcon icon="material-symbols:double-arrow-rounded"/><span>Email Templates</span></Link>
                    </div>
                </div>
                :
                <Navigate replace to="/home" />
            }
        </>
    )

}

