import * as React from 'react'

import lodash from 'lodash'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './LargeErrorOverlay.scss'

const Error = ({title,message,details}) => {


    const renderDetails = details => {
        if(lodash.isArray(details)) {
            let result = []
            for(let entry of details) {
                result.push(<span>{entry}</span>)
            }
            return result
        } else if(lodash.isString(details)) {
            return (<span>{details}</span>)
        } else {
            return null
        }
    }

    const render = () => {
        return (
            <div className={`large-error-overlay`}>
                <div className="icon">
                    <IconifyIcon className='error-icon' icon="si:error-duotone" />
                </div>
                <div className="title">{title}</div>
                <div className="message">{message}</div>
                <div className="details">{renderDetails(details)}</div>
            </div>
        )
    }

    return render()
}

export default Error





