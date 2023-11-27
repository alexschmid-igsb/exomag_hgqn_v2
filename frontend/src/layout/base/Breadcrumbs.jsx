
import React from 'react'

import { Link as RouterLink } from "react-router-dom"

import { useSelector } from 'react-redux'

import { emphasize, styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/HomeRounded';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs'


import './Breadcrumbs.scss'



function Breadcrumbs() {

    const breadcrumbs = useSelector((state) => state.breadcrumbs)

    return (
        <MuiBreadcrumbs
            // separator={<NavigateNextIcon fontSize="small"/>}
            aria-label="breadcrumb"            
        >
            { breadcrumbs.map(item =>



                <Chip
                    key={item.key}
                    className="breadcrumb-item"
                    size="small"                 
                    component={RouterLink}
                    label={item.label}
                    to={item.path}
                    // href="wefew"                
                    icon={item.icon ? <item.icon fontSize="small"/> : null}
                />                


            )}
        </MuiBreadcrumbs>
    )
}


export default Breadcrumbs






