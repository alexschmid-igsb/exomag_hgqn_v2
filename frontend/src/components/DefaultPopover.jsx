import * as React from 'react'

import MuiPopover from '@mui/material/Popover'
import MuiHoverPopover from 'material-ui-popup-state/HoverPopover'

import { usePopupState, bindHover, bindTrigger, bindPopover } from 'material-ui-popup-state/hooks'

import './DefaultPopover.scss'










export default function CustomPopover({
    mode,
    trigger,
    children,
    classes
}) {


    const popupState = usePopupState({
        variant: 'popover',
        // popupId: popoverId,
        popupId: 'ewölf'
    })



    // console.log(children)


    const bind = state => mode === 'HOVER' ? bindHover(state) : bindTrigger(state)


    return (
        <React.Fragment>
            <span
                className={'default-popover-trigger-container' + (classes != null && classes.triggerContainer != null ? ' ' + classes.triggerContainer : '') }
                {...bind(popupState)}
            >
                {trigger}
            </span>
            <MuiPopover
                {...bindPopover(popupState)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                elevation={1}
                classes ={{ paper: 'default-popover-paper', root: 'default-popover-root' }}
            >
                {/* {trigger} */}
                <div className="icon"/>
                {children}
            </MuiPopover>
        </React.Fragment>
    )


}








/*


        <React.Fragment>
            { mode === 'HOVER' ? 
                <React.Fragment>
                    <span
                        className={'default-popover-trigger-container' + (classes != null && classes.triggerContainer != null ? ' ' + classes.triggerContainer : '') }
                        {...bindHover(popupState)}
                    >
                        {trigger}
                    </span>
                    <MuiPopover
                        {...bindPopover(popupState)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        elevation={4}
                        classes ={{ paper: 'default-popover-paper', root: 'default-popover-root' }}
                    >
                        {children}
                    </MuiPopover>
                </React.Fragment>
            :
                <React.Fragment>
                    <span
                        className={'default-popover-trigger-container' + (classes != null && classes.triggerContainer != null ? ' ' + classes.triggerContainer : '') }
                        {...bindTrigger(popupState)}
                    >
                        {trigger}
                    </span>
                    <MuiPopover
                        {...bindPopover(popupState)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        elevation={4}
                        classes ={{ paper: 'default-popover-paper', root: 'default-popover-root' }}
                    >

                        {children}
                    </MuiPopover>
                </React.Fragment>
        }
        </React.Fragment>








*/











/*




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




















*/