import React from 'react'

export const LabRenderer = props => {

    // TODO

    // Hier könnte man eine Ansicht des Labs in Form eines tooltips rendern welcher geöffnet wird,
    // wenn der user mit der maus über das feld fährt

    const fieldValue =
        props.value != null ?
            props.mode == null || props.mode === 'name' ?
                props.value.name
            : props.mode === 'shortName' ?
                props.value.shortName
            : null
        : null

    return(
        <>{ fieldValue }</>
    )
}

export const LabNameRenderer = props => {
    return <LabRenderer mode='name' {...props}/>
}

export const LabShortNameRenderer = props => {
    return <LabRenderer mode='shortName' {...props}/>
}

