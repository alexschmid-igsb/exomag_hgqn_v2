
import { render } from '@react-email/render'

import Activation from './templates/Activation'
import ActivationAdmin from './templates/ActivationAdmin'
import ResetPassword from './templates/ResetPassword'
import ResetPasswordAdmin from './templates/ResetPasswordAdmin'
import SendUsername from './templates/SendUsername'

const templates = {

    activation: {
        subject: `[${process.env.REACT_APP_NAME}] Your account has been created`,
        html: render(<Activation/>, { pretty: true }),
        text: render(<Activation/>, { plainText: true })
    }, 
    activationAdmin: {
        subject: `[${process.env.REACT_APP_NAME}] Your account has been reset by Admin`,
        html: render(<ActivationAdmin/>, { pretty: true }),
        text: render(<ActivationAdmin/>, { plainText: true })
    }, 
    resetPassword: {
        subject: `[${process.env.REACT_APP_NAME}] Password reset has been requested`,
        html: render(<ResetPassword/>, { pretty: true }),
        text: render(<ResetPassword/>, { plainText: true })
    }, 
    resetPasswordAdmin: {
        subject: `[${process.env.REACT_APP_NAME}] Password reset has been requested by Admin`,
        html: render(<ResetPasswordAdmin/>, { pretty: true }),
        text: render(<ResetPasswordAdmin/>, { plainText: true })
    }, 
    sendUsername: {
        subject: `[${process.env.REACT_APP_NAME}] Your Username`,
        html: render(<SendUsername/>, { pretty: true }),
        text: render(<SendUsername/>, { plainText: true })
    }, 
}

export default templates



