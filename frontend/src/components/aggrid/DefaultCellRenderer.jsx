import React from 'react'
    
// import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

export default function DefaultCellRenderer(props) {


    const ValueRenderer = React.useMemo(() => props?.colDef?.valueRenderer, [props]) 


    const renderItem = item => {
        if(ValueRenderer != null) {
            return <ValueRenderer {...props} value={item} />
        } else {
            return item
        }
    }


    return (
        <div className="cell-content">
            { renderItem(props.value) }
        </div>
    )

}

