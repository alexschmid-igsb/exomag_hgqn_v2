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
    const activationToken = routeParams.activationToken

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
        if(user.firstname) setFirstname(user.firstname)
        if(user.lastname) setLastname(user.lastname)
        if(user.site) setSite(user.site)
        if(user.role) setRole(user.role)
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

    const [firstname, setFirstname] = React.useState('')
    const [lastname, setLastname] = React.useState('')
    const [site, setSite] = React.useState('')
    const [role, setRole] = React.useState('')

    const handleFirstnameChange = (event) => setFirstname(event.target.value)
    const handleLastnameChange = (event) => setLastname(event.target.value)
    const handleSiteChange = (event) => setSite(event.target.value)
    const handleRoleChange = (event) => setRole(event.target.value)

    React.useEffect(() => {
        if (typeof activationToken !== 'string' || activationToken.length !== 32) {
            navigate('/notfound')
        }
        API.post('/api/user/by-activation-token', {
            params: {
                activationToken: activationToken
            },
            doNotThrowFor: [404]
        }).then(user => {
            if (typeof user.id === 'string' && typeof user.username === 'string' && typeof user.email === 'string') {
                console.log(activationToken)
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

    const sendRegistration = () => {
        if(typeof firstname !== 'string' || firstname.trim().length <= 0) {
            setMessageState('error')
            setMessage('The field "firstname" is required')
            return
        }
        if(typeof lastname !== 'string' || lastname.trim().length <= 0) {
            setMessageState('error')
            setMessage('The field "lastname" is required')
            return
        }
        if(typeof site !== 'string' || site.trim().length <= 0) {
            setMessageState('error')
            setMessage('The field "site" is required')
            return
        }
        if(typeof role !== 'string' || role.trim().length <= 0) {
            setMessageState('error')
            setMessage('The field "role" is required')
            return
        }
        
        setMessage('')

        API.post('/api/user/activation', {
            params: {
                id: user.id,
                password: password,
                passwordConfirm: passwordConfirm,
                firstname: firstname,
                lastname: lastname,
                site: site,
                role: role
            }
        }).then(user => {
            setMessageState('success')
            setMessage('Registration completed')
            setTimeout(() => {
                navigate('/home')
            }, 2000)
        })
    }

    return (

        <div class="activation-page">
            {user ?
                <div className="activation-form">
                    <h1>Please activate your account</h1>
                    <TextField
                        disabled
                        id="id"
                        label="User ID"
                        variant="filled"
                        size="small"
                        value={user.id}
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
                        label="Password"
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
                        label="Repeat Password"
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

                    <div className="spacer"></div>

                    <TextField
                        id="firstname"
                        label="Firstname"
                        variant="filled"
                        size="small"
                        value={firstname}
                        onChange={handleFirstnameChange}
                    />

                    <TextField
                        id="lastname"
                        label="Lastname"
                        variant="filled"
                        size="small"
                        value={lastname}
                        onChange={handleLastnameChange}
                    />

                    <TextField
                        id="site"
                        label="Site"
                        variant="filled"
                        size="small"
                        value={site}
                        onChange={handleSiteChange}
                    />

                    <TextField
                        id="site"
                        label="Role"
                        variant="filled"
                        size="small"
                        value={role}
                        onChange={handleRoleChange}
                    />

                    { typeof message === 'string' && message.length > 0 ? <div className={`message ${messageState === 'error' ? 'error' : 'success'}`}>{message}</div> : null }

                    <div className="spacer"></div>

                    <Button
                        style={{ alignSelf: 'center' }}
                        onClick={sendRegistration}
                        endIcon={<SendIcon/>}
                        disabled={passwordCheck == false || passwordsMatch == false}
                    >
                        Send Registration
                    </Button>

                </div>
                : null }
        </div>
    )



}

