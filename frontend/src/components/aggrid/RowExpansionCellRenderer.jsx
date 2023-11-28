import React from 'react'
    
// import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

export default function RowExpansionCellRenderer(props) {

    // Important: The data value is always and array that contains the
    // multiple row expansion values. In non-expansion rows the DefaultCellRenderer
    // has to be used instead.

    const isExpanded = React.useMemo(() => props.data.__isExpanded__ == null ? false : props.data.__isExpanded__, [props]) 
    const ValueRenderer = React.useMemo(() => props?.colDef?.valueRenderer, [props]) 

    React.useEffect(() => {
        // console.log("RowExpansionCellRenderer")
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



    const renderItem = item => {
        if(ValueRenderer != null) {
            return <ValueRenderer {...props} value={item} />
            // return "value renderer"
        } else {
            return item
        }
    }

    const renderItems = () => {
        if(props.value == null) {
            return
        }
        let content = []
        let first = true
        for(let [index,item] of props.value.entries()) {
            content.push(
                <div className="row-expansion-item" key={index}>
                    { renderItem(item) }
                </div>
            )
            if(first && isExpanded === false) {
                break
            }
        }
        return content        
    }


    


    return (

        <div className="row-expansion cell-content">
            { renderItems() }
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

