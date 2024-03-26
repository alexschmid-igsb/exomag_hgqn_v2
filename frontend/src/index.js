import React from 'react'
import ReactDOM from 'react-dom/client'

import reportWebVitals from './reportWebVitals'

import store from './store/store'

import { Provider as ReduxProvider } from 'react-redux'
import ErrorHandler from './error/ErrorHandler'
import LoginProvider from './user/UserProvider'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from './layout/hgqn/Layout'
import Home from './pages/Home'
import Disclaimer from './pages/Disclaimer'
import Grid from './pages/Grid'
import Grids from './pages/Grids'
import UserList from './pages/UserList'
import Error404 from './pages/Error404'
import Activation from './user/Activation'
import ResetPassword from './user/ResetPassword'
import Admin from './admin/Admin'
import Status from './admin/Status'
import UserManagement from './admin/UserManagement'
import ImportsAdmin from './admin/ImportsAdmin'
import EmailTemplatesPreview from './admin/EmailTemplatesPreview'
import Imports from './pages/import/Imports'
import Import from './pages/import/Import'

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <ReduxProvider store={store}>
            <ErrorHandler>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LoginProvider><Layout/></LoginProvider>}>
                            <Route path="/" element={<Home />} />
                            <Route path="home" element={<Home />} />
                            <Route path="disclaimer" element={<Disclaimer />} />
                            <Route path="grids/:gridId" element={<Grid />} />
                            <Route path="grids/:gridId/:gridLayout" element={<Grid />} />
                            <Route path="grids" element={<Grids />} />
                            <Route path="imports" element={<Imports />} />
                            <Route path="imports/:importId" element={<Import />} />
                            {/* <Route path="users" element={<UserList />} /> */}
                            <Route path="admin" element={<Admin />} />
                            <Route path="admin/status" element={<Status />} />
                            <Route path="admin/imports" element={<ImportsAdmin />} />
                            <Route path="admin/usermanagement" element={<UserManagement />} />
                            <Route path="admin/emailtemplates" element={<EmailTemplatesPreview />} />
                        </Route>
                        <Route path="activation/:activationToken" element={<Activation />} />
                        <Route path="reset-password/:resetPasswordToken" element={<ResetPassword />} />
                        <Route path="notfound" element={<Error404 />} />
                        <Route path="*" element={<Error404 />} />
                    </Routes>
                </BrowserRouter>
            </ErrorHandler>
        </ReduxProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
