
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import './DialogTitle.scss'

export default function DialogTitle({ children, onClose }) {

    return (

        <div className="custom-dialog-title">
            <div className="title">
                {children}
            </div>
            { onClose ?
                <IconButton
                    className="close-button"
                    aria-label="close"
                    onClick={onClose}
                    size="small"
                >
                    <CloseIcon
                        fontSize="inherit"
                    />
                </IconButton>
            :
                null
            }
        </div>

    )

}
