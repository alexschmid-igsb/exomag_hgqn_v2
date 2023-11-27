import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'

import API from '../api/fetchAPI'

import GridsIcon from '@mui/icons-material/AutoAwesomeMotion'
import GridIcon from '@mui/icons-material/Article'
import HomeIcon from '@mui/icons-material/HomeRounded'

import './Grids.scss'

export default function Page1() {

    const user = useSelector((state) => state.user)

    const dispatch = useDispatch()


    const renderToolbar = () => null

    const breadcrumbs = [
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        },
        {
            key: 'grids',
            label: 'Data Grids',
            path: '/grids',
            icon: GridsIcon
        }
    ]



    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(renderToolbar()))
    }, [])




    return (
        <div>

            <h2>Data Grids</h2>
            <span>to do</span>

        </div>
    )
}