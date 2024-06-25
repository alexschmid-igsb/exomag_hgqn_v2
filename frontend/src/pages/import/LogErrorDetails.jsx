import React from 'react'

import lodash from 'lodash'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import VeryBasicPopupView from '../../components/util/VeryBasicPopupView'
import ErrorView from '../../error/ErrorView'

import './LogErrorDetails.scss'

export default function LogErrorDetails({children}) {

    return (
        <VeryBasicPopupView
            toggleButton = {{
                class: 'log-error-toggle-button',
                // startIcon: 'hugeicons:folder-details-reference',
                startIcon: 'solar:double-alt-arrow-right-bold-duotone',
                label: 'details'
            }}
        >
            {children}
        </VeryBasicPopupView>
    )

}


