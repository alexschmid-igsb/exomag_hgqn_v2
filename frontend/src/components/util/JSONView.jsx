import React from 'react'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import './JSONView.scss'

export default function JSONView({target,title}) {

    const indentConstant = 4

    const [closedFlags, setClosedFlags] = React.useState(new Set())

    const toggleClosed = id => {
        let copy = new Set(closedFlags)
        if(closedFlags.has(id)) {
            copy.delete(id)
        } else {
            copy.add(id)
        }
        setClosedFlags(copy)
    }

    const expandAll = () => {
        setClosedFlags(new Set())
    }

    const collapseAll = () => {
        let newClosedFlags = new Set()
        const walk = (element,path,checkCycle) => {
            /*
            if(checkCycle.has(element)) {
                return
            } else {
                checkCycle.set(element,path)
            }
            */
            if(typeof element === 'object' && element != null)  {
                if(Array.isArray(element) && element.length > 0) {
                    newClosedFlags.add(path)
                    for(let i=0; i<element.length; i++) {
                        walk(element[i],path+'/'+i)
                    }
                } else if(Object.getOwnPropertyNames(element).length > 0) {
                    newClosedFlags.add(path)
                    for(let prop of Object.getOwnPropertyNames(element)) {
                        walk(element[prop],path+'/'+prop,checkCycle)
                    }
                }
            }
        }
        walk(target,'')
        setClosedFlags(newClosedFlags)
    }

    const isClosed = id => closedFlags.has(id)

    const renderIndent = level => {
        return Array(level*indentConstant).fill(<>&nbsp;</>)
    }

    const renderElement = (element,level,path,checkCycle) => {

        if(element === undefined) {
            return <span className="undefined">undefined</span>
        } else if(element === null) {
            return <span className="null">null</span>
        }

        // console.log(path)

        /*
        if(checkCycle.has(element)) {
            return <span className="null">CYCLE</span>
        } else {
            checkCycle.set(element,path)
        }
        */

        switch(typeof element) {
            case "string": {
                return <span className="string">"{element}"</span>
            }
            break
            case "boolean": {
                return <span className="boolean">{element ? 'true' : 'false'}</span>
            }
            break
            case "number":
            case "bigint": {
                return <span className="number">{element}</span>
            }
            break
            case "symbol": {
                return <span className="symbol">{element.toString()}</span>
            }
            break
            case "object": {
                if(Array.isArray(element)) {
                    let array = element

                    let content = []
                    let isEmpty = false

                    content.push(<span className="array-bracket">{'['}</span>)
                    if(array.length > 0) {
                        if(isClosed(path)) {
                            content.push(<span>&hellip;</span>)
                        } else {
                            content.push(<br/>)
                            for(let i=0; i<array.length; i++) {
                                let item = array[i]
                                content.push(renderIndent(level+1))
                                content.push(renderElement(item,level+1,path+'/'+i,checkCycle))
                                if(i !== array.length-1) {
                                    content.push(<span>,</span>)
                                }
                                content.push(<br/>)
                            }
                            content.push(renderIndent(level))
                        }
                    } else {
                        isEmpty = true
                    }
                    content.push(<span className="array-bracket">{']'}</span>)

                    let wrapper = null
                    if(isEmpty) {
                        wrapper = <span className="array-content empty" onClick={event => event.stopPropagation()}>{content}</span>
                    } else {
                        wrapper = <span className="array-content" onClick={event => { toggleClosed(path); event.stopPropagation(); }}>{content}</span>
                    }

                    return wrapper

                } else {

                    let content = []
                    let isEmpty = false

                    content.push(<span className="object-bracket">{'{'}</span>)

                    let props = Object.getOwnPropertyNames(element).sort()
                    if(props.length > 0) {
                        if(isClosed(path)) {
                            content.push(<span>&hellip;</span>)
                        } else {
                            content.push(<br/>)
                            for(let i=0; i<props.length; i++) {
                                let prop = props[i]
                                let value = element[prop]
                                content.push(renderIndent(level+1))
                                if(typeof value === 'object' && ( (Array.isArray(value) && value.length > 0) || (Array.isArray(value) == false && value != null && Object.getOwnPropertyNames(value).length > 0) )) {
                                    content.push(<span className="prop-name clickable" onClick={event => { toggleClosed(path+'/'+prop); event.stopPropagation(); }}>{prop}</span>)
                                } else {
                                    // content.push(<span className="prop-name" onClick={()=>{}}>{prop}</span>)
                                    content.push(<span className="prop-name">{prop}</span>)
                                }
                                content.push(<span>:&nbsp;</span>)
                                content.push(renderElement(value,level+1,path+'/'+prop,checkCycle))
                                if(i !== props.length-1) {
                                    content.push(<span>,</span>)
                                }
                                content.push(<br/>)
                            }
                            content.push(renderIndent(level))
                        }
                    } else {
                        isEmpty = true
                    }

                    content.push(<span className="object-bracket">{'}'}</span>)

                    let wrapper = null
                    if(isEmpty) {
                        wrapper = <span className="object-content empty" onClick={event => event.stopPropagation()}>{content}</span>
                    } else {
                        wrapper = <span className="object-content" onClick={event => { toggleClosed(path); event.stopPropagation(); }}>{content}</span>
                    }

                    return wrapper
                }

            }
            break
            case "function": {
                // return <span className="function">{element.toString()}</span>    // zeigt die ganze funktion
                return <span className="function"><i>function</i></span>
            }
            break
        }
    }

    return(
        <div className="json-view">
            <span class="header">JSON <span className="title">{title}</span></span>
            <Tooltip title="Collapse All" placement="top">
                <IconButton className="icon-button" size="small" onClick={() => collapseAll()}>
                    <IconifyIcon className="icon" icon="mdi:collapse-all"/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Expand All" placement="top">
                <IconButton className="icon-button" size="small" onClick={() => expandAll()}>
                    <IconifyIcon className="icon" icon="mdi:expand-all"/>
                </IconButton>
            </Tooltip>
            <br/>
            { renderElement(target,0,'',new Map()) }
        </div>
        
    )

}

