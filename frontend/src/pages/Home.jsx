import React from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from "react-router-dom"

import Button from '@mui/material/Button'
import LoginIcon from '@mui/icons-material/Login'
import HomeIcon from '@mui/icons-material/HomeRounded'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Link from '@mui/material/Link'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import API from '../api/fetchAPI'

import './Home.scss'



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





export default function Page1() {

    const navigate = useNavigate()
    const user = useSelector((state) => state.user)

    const dispatch = useDispatch()


    const [outcome, setOutcome] = React.useState('')


    const renderToolbar = () => null

    const breadcrumbs = [
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        }
    ]

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(renderToolbar()))
    }, [])

    // const bla = () => {
    //     // dispatch(setUser({ username: 'ASchmid', name: 'Alex Schmid', isAdmin: true }))
    //     API.post('/api/test/neu', {
    //         doNotThrowFor: [401]
    //     }).then(data => {
    //         setOutcome("OK")
    //     }).catch(error => {
    //         setOutcome("ERROR")
    //     })
    // }

    // create error 
    // const ui = null.do()

    return (
        
        <div className="page-content home-content">

            <h2>Willkommen in der HGQN Fall- und Variantendatenbank</h2>

            <p>
                Excel Template für den Upload neuer Fälle und Varianten
                <Link className="link" href="https://uni-bonn.sciebo.de/s/n3DwCeNXPGanUYc/download">
                <LinkBullet/>
                    Download Excel Template
                </Link>
            </p>

            <p>
                Informationen zu "Datendienste für genetische Varianten"
                <Link className="link" target="'blank" href="https://docs.google.com/document/d/1X6uLEUBcxA01pO1kvibA6LGukxV8fsrTV2wSnrKw0fw/export?format=pdf">
                    <LinkBullet/>
                    FAQ - Datendienste für genetische Varianten
                </Link>
            </p>

            <p>
                Haftungsausschluss und Richtlinien zur Datennutzung
                <Link className="link" href="#" onClick={() => navigate('/disclaimer')}>
                    <LinkBullet/>
                    Haftungsausschluss und Richtlinien zur Datennutzung
                </Link>
            </p>


            

        </div>
    )
}