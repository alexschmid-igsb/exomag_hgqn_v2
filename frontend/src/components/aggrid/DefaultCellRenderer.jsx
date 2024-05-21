import React from 'react'
import lodash from 'lodash'
    
import CopyToClipboard from '../util/CopyToClipboard'

export default function DefaultCellRenderer(props) {

    const ValueRenderer = React.useMemo(() => props?.colDef?.valueRenderer, [props]) 

    const renderItem = item => {
        if(ValueRenderer != null) {
            return <ValueRenderer {...props} value={item} />
        } else if(lodash.isObject(item)) {
            return JSON.stringify(item)
        } else {
            return item
        }
    }

    const getTextForClipboard = () => {
        return 'hand bwöjeew'
    }

    return (
        <div className="cell-content">
            { renderItem(props.value) }
            { props.value != null ? 
                <CopyToClipboard getTextForClipboard={getTextForClipboard} />
            :
                null
            }
        </div>
    )
}

/*
    Ein "Modul" welches ich hier lade und eine komponenten in dem modul 
    ist der value renderer, die andere ist die function, welcher mir den
    text gibt, welcher ins clipboard soll


*/


