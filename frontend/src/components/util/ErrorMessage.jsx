import React from 'react'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './ErrorMessage.scss'

export default function({error,onClose}) {
    return (
        error != null ?
            <div className="error-message">
                {typeof error}
            </div>
        :
            null
    )
}