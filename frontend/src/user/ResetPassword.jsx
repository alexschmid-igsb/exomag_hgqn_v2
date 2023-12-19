import React from 'react'

import { useParams, useNavigate } from "react-router-dom"
// import { useDispatch } from 'react-redux'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import SendIcon from '@mui/icons-material/ThumbUpAltRounded';


/*
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import DialogTitle from '../components/DialogTitle'

import DeleteIcon from '@mui/icons-material/Delete'
import AlarmIcon from '@mui/icons-material/Alarm'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import GridsIcon from '@mui/icons-material/AutoAwesomeMotion'
import GridIcon from '@mui/icons-material/Article'
import HomeIcon from '@mui/icons-material/HomeRounded'
*/

import PageLogo from '../layout/hgqn/PageLogo'

import './Activation.scss'

import API from '../api/fetchAPI'
import { setUser } from '../store/user'
import NavigateNext from '@mui/icons-material/NavigateNext';

/*
import UploadIcon from '@mui/icons-material/Upload'
import RefreshIcon from '@mui/icons-material/Refresh'
*/


export default function Activation() {

    const navigate = useNavigate()

    const routeParams = useParams()
    const resetPasswordToken = routeParams.resetPasswordToken

    const [user, setUser] = React.useState()

    const [password, setPassword] = React.useState('')
    const [passwordConfirm, setPasswordConfirm] = React.useState('')
    const [passwordMessage, setPasswordMessage] = React.useState()

    const [passwordCheckInfo, setPasswordCheckInfo] = React.useState({
        total: false,
        upper: false,
        lower: false,
        digit: false,
        special: false
    })

    const [passwordCheck, setPasswordCheck] = React.useState(false)
    const [passwordsMatch, setPasswordsMatch] = React.useState(false)

    const upperTest = /[ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ]/
    const lowerTest = /[abcdefghijklmnopqrstuvwxyzäöü]/
    const digitTest = /[0123456789]/
    const specialTest = /[ `°!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

    const checkPassword = () => {

        if(!password) {
            return
        }

        let check = {
            total: password.length >= 8,
            upper: upperTest.test(password),
            lower: lowerTest.test(password),
            digit: digitTest.test(password),
            special: specialTest.test(password)
        }

        console.log(check)

        setPasswordCheckInfo(check)
        setPasswordCheck(check.total && check.upper && check.lower && check.digit && check.special)
    }

    const matchPasswords = () => {
        setPasswordsMatch(password === passwordConfirm)
    }

    React.useEffect(() => {
        checkPassword()
    }, [password])

    React.useEffect(() => {
        matchPasswords()
    }, [password,passwordConfirm])

    React.useEffect(() => {
        console.log("USER")
        console.log(user)
        if(user == null) return
    }, [user])

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const onPasswordLeave = (event) => {
    }

    const handlePasswordConfirmChange = (event) => {
        setPasswordConfirm(event.target.value)
    }

    const onPasswordConfirmLeave = (event) => {
        console.log("on confirm leave")
    }


    const getConstraintClass = (key) => {
        if(typeof password === 'string' && password.length > 0) {
            return passwordCheckInfo[key] ? 'success' : 'error'   
        } else {
            return null
        }
    }

    React.useEffect(() => {
        if (typeof resetPasswordToken !== 'string' || resetPasswordToken.length !== 32) {
            navigate('/notfound')
        }
        API.post('/api/user/by-reset-password-token', {
            params: {
                resetPasswordToken: resetPasswordToken
            },
            doNotThrowFor: [404]
        }).then(user => {
            if (typeof user._id === 'string' && typeof user.username === 'string' && typeof user.email === 'string') {
                console.log(resetPasswordToken)
                console.log(user)
                setUser(user)
            } else {
                navigate('/notfound')
            }
        }).catch(err => {
            navigate('/notfound')
        })
    }, [])


    const [messageState, setMessageState] = React.useState('')
    const [message, setMessage] = React.useState('')

    const sendResetPassword = () => {
        setMessage('')

        API.post('/api/user/reset-password', {
            params: {
                id: user._id,
                password: password,
                passwordConfirm: passwordConfirm
            }
        }).then(user => {
            setMessageState('success')
            setMessage('Password has been set')
            setTimeout(() => {
                navigate('/home')
            }, 2000)
        })
    }

    return (

        <div class="activation-page">

            <PageLogo/>

            {user ?
                <div className="activation-form">
                    <h1>Please reset your password</h1>
                    <TextField
                        disabled
                        id="id"
                        label="User ID"
                        variant="filled"
                        size="small"
                        value={user._id}
                    />

                    <TextField
                        disabled
                        id="username"
                        label="Username"
                        variant="filled"
                        size="small"
                        value={user.username}
                    />

                    <TextField
                        disabled
                        id="email"
                        label="Email"
                        variant="filled"
                        size="small"
                        value={user.email}
                    />

                    <div className="spacer"></div>

                    <TextField
                        type={'password'}
                        id="password"
                        label="New Password"
                        variant="filled"
                        size="small"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={onPasswordLeave}
                    />

                    <div className="password-format-message">
                        The password must have at least<br/>
                        <ul>
                            <li className={getConstraintClass('total')}>8 characters in total</li>
                            <li className={getConstraintClass('upper')}>1 uppercase character</li>
                            <li className={getConstraintClass('lower')}>1 lowercase character</li>
                            <li className={getConstraintClass('digit')}>1 digit</li>
                            <li className={getConstraintClass('special')}>1 special character</li>
                        </ul>
                    </div>

                    <TextField
                        type={'password'}
                        id="password_confirm"
                        label="Repeat New Password"
                        variant="filled"
                        size="small"
                        value={passwordConfirm}
                        onChange={handlePasswordConfirmChange}
                        onBlur={onPasswordConfirmLeave}
                    />

                    <div className={`password-match-message ${typeof passwordConfirm === 'string' && passwordConfirm.length > 0 ? 'show' : null} ${passwordsMatch ? 'success' : 'error'}`}>
                        <span className="error">Passwords do not match!</span>
                        <span className="success">Passwords match!</span>
                    </div>

                    { typeof message === 'string' && message.length > 0 ? <div className={`message ${messageState === 'error' ? 'error' : 'success'}`}>{message}</div> : null }

                    <div className="spacer"></div>

                    <Button
                        style={{ alignSelf: 'center' }}
                        onClick={sendResetPassword}
                        endIcon={<SendIcon/>}
                        disabled={passwordCheck == false || passwordsMatch == false}
                    >
                        Set New Password
                    </Button>

                </div>
                : null }
        </div>
    )



}

