import React from 'react'

import lodash from 'lodash'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './CopyToClipboard.scss'

export default function({getTextForClipboard}) {

    const icons = {
        idle: {
            id: 'heroicons-outline:clipboard-copy',
            hOffset: 1
        },
        success: {
            id: 'heroicons-outline:clipboard-check',
            hOffset: 0
        }
    }

    const [icon, setIcon] = React.useState(icons.idle)

    const copyToClipboard = event => {
        let value = getTextForClipboard()
        if(lodash.isString(value) === true && value.length > 0) {
            if(navigator.clipboard) {
                navigator.clipboard.writeText(value).then(function() {
                    setIcon(icons.success)
                    setTimeout(() => setIcon(icons.idle), 1000)
                }, function(err) {
                    console.error('Could not copy text. Error in navigator.clipboard.writeText(...)', err)
                })
            }
        }
    }
    
    return (
        <div className="copy-to-clipboard">
            <div className="blurred-background">
            </div>
            <button onClick={copyToClipboard}>
                <IconifyIcon
                    icon={icon.id}
                    style={{ marginLeft: `${icon.hOffset}px` }}
                />
            </button>
        </div>
    )
}


