
// https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications
// https://security.stackexchange.com/questions/166724/should-i-use-csrf-protection-on-rest-api-endpoints/166798#166798
// https://stackoverflow.com/questions/520https://www.predic8.de/bearer-token-autorisierung-api-security.htm#:~:text=Der%20Begriff%20Bearer%20bedeutet%20auf,eine%20bestimmte%20Identit%C3%A4t%20gebunden%20ist.


import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import API from '../api/fetchAPI'
import { setUser, clearUser } from '../store/user'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import LoginIcon from '@mui/icons-material/Login'
import PasswordVisibleIcon from '@mui/icons-material/Visibility'
import PasswordInvisibleIcon from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import Collapse from '@mui/material/Collapse'
import ErrorIcon from '@mui/icons-material/Error'
// import LoginSuccessIcon from '@mui/icons-material/Done'
import LoginSuccessIcon from '@mui/icons-material/CheckCircle'
import Fade from '@mui/material/Fade';

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import templates from '../util/mail/base/Templates'

import './UserProvider.scss'

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function LoginProvider({ children }) {

    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()

    const [username, setUsername] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [password, setPassword] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState(null)
    const [loginInProgress, setLoginInProgress] = React.useState(false)
    const [loginSuccessful, setLoginSuccessful] = React.useState(false)

    const [showForgotPasswordView, setShowForgotPasswordView] = React.useState(false)
    const [email, setEmail] = React.useState('')
    const [infoMessage, setInfoMessage] = React.useState(null)
    const [usernameSent, setUsernameSent] = React.useState(false)

    const [passwordResetInProgress, setPasswordResetInProgress] = React.useState(false)
    const [passwordResetSent, setPasswordResetSent] = React.useState(false)

    React.useEffect(() => {
        console.log("USER PROVIDER CHECK AUTH")
        API.get('/api/user/auth', { doNotThrowFor: [400,401] })
        .then( user => {
            dispatch(setUser(user))
        }).catch(err => {
            // no authentication, login required
            console.log("ERROR")
        })
    }, [])

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault()
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const onFieldKeyDown = (event) => {
        if(event.key === "Enter" && username.trim().length > 0 && password.length > 0) {
            doLogin()
        }
    }

    const gotoPasswordClick = (event) => {
        setShowForgotPasswordView(true)
    }

    const gotoLogin = (event) => {
        setInfoMessage(null)
        setShowForgotPasswordView(false)
        setUsernameSent(false)
        setErrorMessage(null)
        setPasswordResetInProgress(false)
        setPasswordResetSent(false)
    }

    const forgotUsernameToo = () => {
        if(usernameSent) {
            return
        }

        if(typeof email === 'string' && email.length > 0 && EMAIL_REGEX.test(email)) {

            setUsernameSent(true)
            setInfoMessage(<>The username has been sent to <b>{email}</b> (provided that this email address is associated with an existing acount)</>)

            API.post('/api/user/send-username', {
                params: {
                    email: email.trim(),
                    template: templates['sendUsername']
                },
                doNotThrowFor: [401]
            }).then( () => {
                // empty
            }).catch( err => {
                setErrorMessage()
            })
            
        } else {
            setInfoMessage('Please enter the email address associated with your account. Then click \'Send me my username \' to receive your username by email.')
        }
    }

    const doLogin = () => {
        setErrorMessage(null)
        setLoginSuccessful(false)
        setLoginInProgress(true)

        API.post('/api/user/login', {
            params: {
                username: username.trim(),
                password: password
            },
            doNotThrowFor: [401]
        }).then( user => {
            setLoginSuccessful(true)
            setTimeout(() => {
                setLoginInProgress(false)
                setLoginSuccessful(false)
            }, 2000 )
            setTimeout(() => {
                dispatch(setUser(user))
            }, 500 )
        }).catch(err => {
            setLoginInProgress(false)
            setErrorMessage("Credentials could not be verified")
        })
    }


    const doPasswordReset = () => {

        setPasswordResetInProgress(true)
        setInfoMessage(null)

        API.post('/api/user/reset-password-user', {
            params: {
                username: username.trim(),
                email: email.trim(),
                template: templates['resetPassword']
            },
            doNotThrowFor: [401]
        }).then( user => {
            setPasswordResetSent(true)
            setInfoMessage(<>A link to reset your password has been sent to <b>{email}</b> (provided that username / email can be associated with an existing account.)</>)
            setPasswordResetInProgress(false)
        }).catch(err => {
        })
    }


    const renderLogin = () =>
        <div className="login-screen">

            <div className="login-box">

                { showForgotPasswordView ? 

                    <>
                        <h2>Password Reset</h2>

                        <span className="light">Enter your username and email. A link to reset your password will be sent to your email address.</span>

                        <TextField
                            disabled={passwordResetInProgress === true || passwordResetSent === true}
                            className="inputfield username"
                            label="Username"
                            variant="filled"
                            value={username}
                            onChange={handleUsernameChange}
                        />

                        <TextField
                            disabled={usernameSent === true || passwordResetInProgress === true || passwordResetSent === true}
                            className="inputfield email"
                            label="Email"
                            variant="filled"
                            value={email}
                            onChange={handleEmailChange}
                        />

                        <LoadingButton
                            className="main-button"
                            disabled={username.trim().length <= 0 || email.trim().length <= 0 || EMAIL_REGEX.test(email) == false || passwordResetSent === true}
                            variant="text"
                            onClick={doPasswordReset}
                            startIcon={<IconifyIcon icon="material-symbols:lock-reset-rounded"/>}
                            loading={passwordResetInProgress}
                            loadingPosition="center"
                            style={{marginTop: '8px'}}
                        >
                            Reset Password
                        </LoadingButton>

                        { usernameSent == false ? 
                            <div className="sublink">
                                <a className={usernameSent ? 'disabled' : ''} onClick={forgotUsernameToo}>Send me my username</a>
                            </div>                    
                        : null }

                        { infoMessage ? 
                            <div className="message">
                                <div className="icon-container">
                                    <IconifyIcon className="icon" icon={(usernameSent || passwordResetSent) ? "mingcute:check-2-fill" : "mingcute:hand-finger-2-fill"} />
                                </div>
                                <div className="text-container">
                                    {infoMessage}
                                </div>
                            </div>
                        : null }

                        <div className="sublink">
                            <a onClick={gotoLogin}>Go back to Login</a>
                        </div>                    



                    </>

                    :
            
                    <>
                        <h2>Login</h2>

                        <span>Please login to use this service</span>

                        <TextField
                            className="inputfield username"
                            label="Email / Username"
                            variant="filled"
                            value={username}
                            onChange={handleUsernameChange}
                            onKeyDown={onFieldKeyDown}
                        />

                        <div className="password-box">
                            <TextField
                                className="inputfield password"
                                id="standard-password-input"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                variant="filled"
                                onKeyDown={onFieldKeyDown}
                            />
                            <IconButton
                                className="password-button"
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <PasswordVisibleIcon /> : <PasswordInvisibleIcon />}
                            </IconButton>
                        </div>

                        <Collapse orientation="vertical" in={errorMessage !== null}>
                            <div className="message old error">
                                <div className="icon">
                                    <ErrorIcon />
                                </div>
                                <div>
                                    {errorMessage}
                                </div>
                            </div>
                        </Collapse>

                        <Collapse orientation="vertical" in={loginSuccessful}>
                            <div className="message old success">
                                <div className="icon">
                                    <LoginSuccessIcon />
                                </div>
                                <div>
                                    Login Successful
                                </div>
                            </div>
                        </Collapse>

                        <LoadingButton
                            className="main-button"
                            disabled={username.trim().length <= 0 || password.length <= 0}
                            variant="text"
                            onClick={doLogin}
                            startIcon={<LoginIcon />}
                            loading={loginInProgress}
                            loadingPosition="center"
                        >
                            Login
                        </LoadingButton>

                        <div className="sublink">
                            <a onClick={gotoPasswordClick}>Forgot password?</a>
                        </div>                    
                    </>

                }
            </div>
        </div>


    return (
        <>

            <Fade timeout={{ enter: 1000, exit: 1000 }} in={user._id == null} mountOnEnter unmountOnExit>
                {
                    renderLogin()
                }
            </Fade>

            <Fade timeout={{ enter: 1000, exit: 1000 }} in={user._id != null} mountOnEnter unmountOnExit>
                <div className="fade-container">
                    { children }
                </div>
            </Fade>

            {/* <Slide direction="right" timeout={{ enter: 1000, exit: 1000 }} in={user._id == null} mountOnEnter unmountOnExit>
                {
                    renderLogin()
                }
            </Slide>

            <Slide direction="left" timeout={{ enter: 1000, exit: 1000 }} in={user._id != null} mountOnEnter unmountOnExit>
                <div className="fade-container">
                    { children }
                </div>
            </Slide> */}

            {/* { user.id != null ? children : <></> } */}
        </>
    )

}









