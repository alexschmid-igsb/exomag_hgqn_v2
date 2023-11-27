import * as React from 'react'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import Popover from '@mui/material/Popover'
// import PopupState, {  usePopupState, bindHover, bindTrigger, bindPopover } from 'material-ui-popup-state'
import { usePopupState, bindHover, bindTrigger, bindPopover } from 'material-ui-popup-state/hooks'
import HoverPopover from 'material-ui-popup-state/HoverPopover'

import './PopoverButton.scss'

PopoverButton.defaultProps = {
    hover: false
}

export default function PopoverButton({
    useSmallButton,
    useIconButton,
    useHover,
    // tooltip,
    buttonClass,
    buttonKey,
    buttonLabel,
    buttonIcon,
    popoverId,
    popoverClass,
    paperClass,
    children,
    onOpen,
    onClose,
    closeTrigger
}) {

    const popupState = usePopupState({
        variant: 'popover',
        popupId: popoverId,
    })

    React.useEffect(() => {
        if(popupState.isOpen) {
            if(typeof onOpen === 'function') {
                onOpen()
            }
        } else {
            if(typeof onClose === 'function') {
                onClose()
            }
        }
    }, [popupState.isOpen])

    React.useEffect(() => {
        if(typeof closeTrigger === 'boolean' && closeTrigger === true) {
            setTimeout(popupState.close, 300)
        }
    }, [closeTrigger])


    const render = () => 
        useIconButton ? 
            useHover ? 
                <React.Fragment>
                    <IconButton
                        size={useSmallButton ? 'small' : ''}
                        className={buttonClass}
                        {...bindHover(popupState)}
                        key={buttonKey}
                    >
                        {buttonIcon}
                    </IconButton>
                    <HoverPopover
                        {...bindPopover(popupState)}
                        className={`component-popover-button ${popoverClass ? popoverClass : ''}`}
                        classes={{ paper: paperClass }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        elevation={1}
                    >
                        {children}
                    </HoverPopover>
                </React.Fragment>
            :
                <React.Fragment>
                    <IconButton
                        size={useSmallButton ? 'small' : ''}
                        className={buttonClass}
                        {...bindTrigger(popupState)}
                        key={buttonKey}
                    >
                        {buttonIcon}
                    </IconButton>
                    <Popover
                        {...bindPopover(popupState)}
                        className={`component-popover-button ${popoverClass ? popoverClass : ''}`}
                        classes={{ paper: paperClass }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        elevation={1}
                    >
                        {children}
                    </Popover>
                </React.Fragment>
        :
            useHover ? 
                <React.Fragment>
                    <Button
                        size={useSmallButton ? 'small' : ''}
                        className={buttonClass}
                        {...bindHover(popupState)}
                        key={buttonKey}
                        startIcon={buttonIcon}
                    >
                        {buttonLabel}
                    </Button>
                    <HoverPopover
                        {...bindPopover(popupState)}
                        className={`component-popover-button ${popoverClass ? popoverClass : ''}`}
                        classes={{ paper: paperClass }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        elevation={1}
                    >
                        {children}
                    </HoverPopover>
                </React.Fragment>
            :
                <React.Fragment>
                    <Button
                        size={useSmallButton ? 'small' : ''}
                        className={buttonClass}
                        {...bindTrigger(popupState)}
                        key={buttonKey}
                        startIcon={buttonIcon}
                    >
                        {buttonLabel}
                    </Button>
                    <Popover
                        {...bindPopover(popupState)}
                        className={`component-popover-button ${popoverClass ? popoverClass : ''}`}
                        classes={{ paper: paperClass }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        elevation={1}
                    >
                        {children}
                    </Popover>
                </React.Fragment>          

    // return ( tooltip ? <Tooltip title={tooltip}>{render()}</Tooltip> : {render()} )
    return (render())
}



