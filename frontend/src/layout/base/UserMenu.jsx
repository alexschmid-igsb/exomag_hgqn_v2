import * as React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import './UserMenu.scss'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

import UserIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import AdminIcon from '@mui/icons-material/AdminPanelSettings'
import RouterButton from '../../components/RouterButton'
import LogoutIcon from '@mui/icons-material/Logout'
import ProfileIcon from '@mui/icons-material/AccountBox'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"
import PopoverMenu from '../../components/PopoverMenu'

import API from '../../api/fetchAPI'
import { setUser, clearUser } from '../../store/user'

export default function UserMenu() {

    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()

    const doLogout = () => {
        API.post('/api/user/logout', {
            // options
        }).then(data => {
            dispatch(clearUser())
        }).catch(error => {
            // waht to do?
        })
    }

    const renderUserLabel = () => {
        if (!user) {
            return ''
        }
        if (typeof user.firstname === 'string' && user.firstname.length > 0 && typeof user.lastname === 'string' && user.lastname.length > 0) {
            return `${user.firstname.substring(0, 1).toUpperCase()}. ${user.lastname}`
        }
        if (typeof user.username === 'string' && user.username.length > 0) {
            return user.username
        }
        if (typeof user.email === 'string' && user.email.length > 0) {
            return user.email
        }
        return ''
    }

    return (
        user ?
            <Box className="menu user-menu" sx={{ color: 'white', marginRight: '4px', flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>

                <RouterButton
                    className="menu-button user-menu-button"
                    uniqueKey="users"
                    to="/users"
                    icon={<IconifyIcon icon="ph:user-list-fill"/>}
                >
                    Users
                </RouterButton>

                {user && user.superuser === true ?
                    <RouterButton
                        className="menu-button user-menu-button"
                        uniqueKey="admin"
                        to="/admin"
                        icon={<AdminIcon />}
                    >
                        Admin
                    </RouterButton>
                    :
                    null
                }

                {user ?
                    <PopoverMenu
                        useHover={false}
                        buttonClass="menu-button user-menu-button"
                        menuClass="user-actions-submenu"
                        buttonKey="user-actions-submenu"
                        buttonLabel={renderUserLabel()}
                        buttonIcon={<UserIcon />}
                        popoverId="user-actions-submenu"
                        popoverClass="user-actions-submenu"
                        paperClass="user-actions-submenu-paper"
                        items={[
                            {
                                key: 'profile',
                                icon: ProfileIcon,
                                label: 'My Profile',
                                routerPath: '/profile'
                            },
                            {
                                key: 'settings',
                                icon: SettingsIcon,
                                label: 'Settings',
                                routerPath: '/settings'
                            },
                            {
                                key: 'logout',
                                icon: LogoutIcon,
                                label: 'Logout',
                                action: doLogout
                            },
                        ]}
                    />
                    :
                    null
                }
            </Box>
            :
            null
    )
}

