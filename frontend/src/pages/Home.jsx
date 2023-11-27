import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import Button from '@mui/material/Button'
import LoginIcon from '@mui/icons-material/Login'
import HomeIcon from '@mui/icons-material/HomeRounded'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Link from '@mui/material/Link'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import API from '../api/fetchAPI'

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
        <div style={{padding: '20px', height: '100%', display: 'flex', flexFlow: 'column'}}>

            <h2>Home</h2>

            {/* <Link href="./ExomAG_Excel_Template_AS3.xlsx">Download Excel Template</Link> */}
            <Link href="https://uni-bonn.sciebo.de/s/n3DwCeNXPGanUYc/download">Download Excel Template</Link>

        </div>
    )
}