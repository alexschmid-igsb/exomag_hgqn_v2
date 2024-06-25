import React from 'react'

import { createPortal } from 'react-dom'

import lodash from 'lodash'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

import './VeryBasicPopupView.scss'

export default function VeryBasicPopupView({ toggleButton, children }) {

    const [isOpen, setOpen] = React.useState(false)
    const [opacity, setOpacity] = React.useState(0.0)
    
    // const ref = React.useRef(0)
    // React.useEffect(() => {
    //     console.log("ref cahnge: " + ref.current)
    //     if(ref.current != null) {
    //         setOpacity(1.0)
    //     }
    // }, [ref.current])

    const toggle = () => {
        if(isOpen) {
            setOpacity(0.0)
        } else {
            setTimeout(() => setOpacity(1.0), 100)
        }
        setOpen(!isOpen)
    }

    const close = () => {
        if(isOpen) {
            toggle()
        }
    }

    return (

        <>
            <Button
                className={ 'very-basic-popup-toggle-button' + (toggleButton.class != null ? (' ' + toggleButton.class) : '') }
                startIcon={ toggleButton.startIcon != null ? <IconifyIcon icon={toggleButton.startIcon} /> : null}
                endIcon={ toggleButton.endIcon != null ? <IconifyIcon icon={toggleButton.endIcon} /> : null}
                onClick={() => toggle()}
            >
                <div className='toggle-button-label'>
                    {toggleButton.label}
                </div>
            </Button>


            { isOpen && createPortal(
                <>
                    <div
                        // ref={ref}
                        className="very-basic-popup-overlay"
                        onClick={() => close()}
                        style={{opacity: opacity}}
                    >
                    </div>
                    <div
                        className="very-basic-popup-container"
                        onClick={event => event.stopPropagation()}
                        style={{opacity: opacity}}
                    >
                        <IconButton
                            className='very-basic-popup-close-button'
                            size="small"
                            onClick={() => close()}
                        >
                            <IconifyIcon icon="material-symbols:close-small-rounded"/>
                        </IconButton>

                        {children}
                    </div>
                </>,
                document.body
            )}

        </>


    )


}
