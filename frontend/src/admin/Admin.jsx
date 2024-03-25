
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

import '../pages/Page.scss'
import './Admin.scss'

function LinkBullet() {
    return (
        // <IconifyIcon className="icon" icon="iconamoon:arrow-right-2-bold"/>
        <IconifyIcon className="icon" icon="ph:caret-double-right-duotone"/>
        // <IconifyIcon className="icon" icon="ph:caret-right-duotone"/>
        // <IconifyIcon className="icon" icon="pepicons-print:arrow-right"/>
        // <IconifyIcon className="icon" icon="ph:arrow-fat-right-duotone"/>
        // <IconifyIcon className="icon" icon="ph:arrow-fat-line-right-duotone"/>
    )
}

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
            { user && user.isSuperuser === true ?
                <div className="page-content">
                    <h2>Administration</h2>
                    <Link className="link" to="/admin/usermanagement"><LinkBullet/><span>User Management</span></Link>
                    <Link className="link" to="/admin/emailtemplates"><LinkBullet/><span>Email Template Vorschau</span></Link>
                    <Link className="link" to="/admin/imports"><LinkBullet/><span>Import Übersicht</span></Link>
                </div>
                :
                <Navigate replace to="/home" />
            }
        </>
    )

}

