import React from 'react'

import lodash from 'lodash'

export default function DefaultEnumValueRenderer(props) {

    const isArray = React.useMemo(() => lodash.isArray(props.value), [props]) 


    React.useEffect(() => {
        // console.log("RowExpansionCellRenderer")
        // console.log(props)

        // console.log("DefaultEnumValueRenderer")
        // console.log(props)
        
    }, [props])


    // Der expansion toggle kann auch im cell renderer über einen button oder ähnliches passieren
    // hierzu muss der toggleExpand über den grid context gesetzt und dann hier aufgerufen werden
    /*
    const handleChange = (event) => {
        console.log("HANDLE CHANGE")
        console.log(props)
        console.log(event.target.checked)
        props.context.toggleExpand(props.node, event.target.checked)
    }
    */



    const valueToCSS = value => {
        return value.replace(/[^A-Za-z0-9]/g, '');
        // return lodash.camelCase(value)
    }

    const renderValue = () => {

        let values = props.value
        let content = []

        if(isArray === false) {
            values = [props.value]
        }

        for(let value of values) {
            content.push(
                <span className={`enum-value VALUE-${valueToCSS(value)}`}>
                    { value }
                </span>
            )
        }

        return content
    }


    


    return (

        <div className={`enum-value-renderer default-enum-value-renderer ${props?.colDef?.layoutField?.id}`}>
            { renderValue() }
        </div>

        /*
        <div style={{display: 'flex', flexFlow: 'column'}}>
            <div>
                <Checkbox
                    size="small"
                    checked={props.data[2].isExpanded}
                    onChange={handleChange}
                />
            </div>
            <div>
                eins
            </div>
            { props.data[2].isExpanded ? 
                <>
                    <div>zwei</div>
                    <div>drei</div>
                    <div>vier</div>
                </>
            :
                null
            }
        </div>
        */

    )


}

