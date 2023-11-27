import * as React from 'react'

import Button from '@mui/material/Button'

import SimpleList from '../components/util/SimpleList'
import PopoverButton from '../components/PopoverButton'

export default function PopoverMenu({
    buttonClass,
    menuClass,
    buttonKey,
    buttonLabel,
    buttonIcon,
    popoverId,
    popoverClass,
    paperClass,
    items
}) {

    const [closeTrigger, setCloseTrigger] = React.useState(false)

    const onOpen = () => {
        setCloseTrigger(false)
    }

    const onClose = () => {
        setCloseTrigger(false)
    }

    const onMenuClick = () => {
        setCloseTrigger(true)
    }

    return (
        <PopoverButton
            buttonClass={buttonClass}
            useHover={false}
            buttonKey={buttonKey}
            buttonLabel={buttonLabel}
            buttonIcon={buttonIcon}
            popoverId={popoverId}
            popoverClass={popoverClass}
            paperClass={paperClass}
            onOpen={onOpen}
            onClose={onClose}
            closeTrigger={closeTrigger}
        >
            <SimpleList
                className={menuClass}
                items={items}
                onClick={onMenuClick}
            />
        </PopoverButton>
    )
}
