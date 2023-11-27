
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
    
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

export default function LinkedCellRenderer(props) {

    const handleChange = (event) => {
        console.log("HANDLE CHANGE")
        console.log(props)
        console.log(event.target.checked)

        props.context.toggleExpand(props.node, event.target.checked)
    }

    return (
        // <div style={{height: (props.data[2] === 'ABC' ? '300px' : 'unset')}}>

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
    )


}

