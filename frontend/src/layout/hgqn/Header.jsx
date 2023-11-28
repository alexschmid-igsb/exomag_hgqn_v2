import * as React from 'react'

import { useSelector } from 'react-redux'

import Toolbar from '@mui/material/Toolbar'

import MainMenu from './MainMenu'
import UserMenu from './UserMenu'
import Breadcrumbs from '../base/Breadcrumbs'

import PageLogo from './PageLogo'

import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import DeleteIcon from '@mui/icons-material/Delete'
import AlarmIcon from '@mui/icons-material/Alarm'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'

import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import HomeIcon from '@mui/icons-material/HomeRounded'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import './Header.scss'

// Beispiel wie CommonJS module aus dem backend core eingebunden werden können.
// Der Ordner core ist ein symlink auf den core ordner im backend.
// const bla = require("../shared/rowkey/rowkey")

function Header() {

    const toolbar = useSelector((state) => state.toolbar)
    const renderAsJSON = obj => JSON.stringify(obj,null,2).split('\n').map(item => <>{ item.split(' ').map(it => <>{it}&nbsp;</>) }<br/></>)

    return (
        <div className="page-header" >
            {/* { bla.abc }
            { renderAsJSON(process.env) } */}
            <PageLogo />

            <div className="menuarea">
                <div className="menubar">
                    <MainMenu />
                    <UserMenu />
                </div>
                <div className="toolbar-area">
                    <div className="breadcrumbs">
                        <Breadcrumbs/>
                    </div>
                    <div className="toolbar">
                        {toolbar}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header


