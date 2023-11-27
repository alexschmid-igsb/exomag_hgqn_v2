import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

export default function BooleanCellRenderer(props) {
    return (
        props.value === true ?
            <IconifyIcon className="signal-green" icon="entypo:check"/>
        :
            <IconifyIcon className="signal-red" icon="entypo:cross"/>
    )
}
