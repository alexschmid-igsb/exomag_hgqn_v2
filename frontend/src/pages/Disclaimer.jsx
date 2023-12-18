import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import Button from '@mui/material/Button'
import LoginIcon from '@mui/icons-material/Login'
import HomeIcon from '@mui/icons-material/HomeRounded'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Link from '@mui/material/Link'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import API from '../api/fetchAPI'

import './Page.scss'
import './Disclaimer.scss'

function DisclaimerIcon() {
    return (
        <IconifyIcon style={{fontSize: '1.4em'}} icon="basil:info-triangle-solid" className="icon"/>
    )
}

export default function Page1() {

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
        }, {
            key: 'disclaimer',
            label: 'Disclaimer',
            path: '/disclaimer',
            icon: DisclaimerIcon
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
        <div className="page-content disclaimer-content">

            <h2>Haftungsausschluss und Richtlinien zur Datennutzung</h2>

            <p>Die Informationen auf dieser Website sind nicht für den direkten diagnostischen Gebrauch oder die medizinische Entscheidungsfindung ohne Überprüfung durch eine genetische Fachkraft bestimmt. Einzelpersonen sollten ihr Gesundheitsverhalten nicht allein auf der Grundlage der Informationen auf dieser Website ändern. Wenn Sie Fragen zu den auf dieser Website enthaltenen Informationen haben, wenden Sie sich bitte an eine medizinische Fachkraft.</p>

            <br/><br/>
            
            <h2>Disclaimer and data use policy</h2>

            <p>The information on this website is not intended for direct diagnostic use or medical decision-making without review by a genetics professional. Individuals should not change their health behavior solely on the basis of information contained on this website. If you have questions about the information contained on this website, please see a healthcare professional. </p>

        </div>
    )
}