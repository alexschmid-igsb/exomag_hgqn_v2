// import logo from './logo.svg'

import * as React from 'react';
import {
    Outlet,
    // Link
} from "react-router-dom"

import './Layout.scss'

// import Box from '@mui/material/Box'

import Header from './Header'
import Footer from './Footer'

function Layout() {

    return (
        <div id="page-layout">
            <Header/>
            <main className="page-content">
                <Outlet/>
            </main>
            <Footer/>            
        </div>
    )
}

export default Layout



