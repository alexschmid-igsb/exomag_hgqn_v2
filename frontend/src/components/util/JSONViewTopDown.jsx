import React from 'react'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import _, { isTypedArray } from 'lodash'

import './JSONView.scss'

export default function JSONViewTopDown({ target, title }) {

    const indentConstant = 4

    const [workingTree, setWorkingTree] = React.useState(false)

    const updateWorkingTree = (removeThis, replaceBy) => {
        const recursive = (node, removeThis, replaceBy) => {
            if (node == removeThis) {
                return {
                    newNode: replaceBy,
                    affected: true
                }
            }

            let needCopy = false
            let newChildren = []

            for (let child of node.children) {
                let { newNode: newChild, affected } = recursive(child, removeThis, replaceBy)
                if (affected) {
                    needCopy = true;
                }
                newChildren.push(newChild)
            }

            if (needCopy) {
                return {
                    newNode: {
                        state: node.state,
                        element: node.element,
                        index: node.index,
                        children: newChildren
                    },
                    affected: true
                }
            } else {
                return {
                    newNode: node,
                    affected: false
                }
            }

        }
        setWorkingTree(recursive(workingTree, removeThis, replaceBy).newNode)
    }

    const createNode = element => ({
        state: 'closed',
        element: element,
        index: null,
        children: []
    })

    React.useEffect(() => {
        setWorkingTree(createNode(target))
    }, [target])

    const renderIndent = level => {
        return Array(level*indentConstant).fill(<>&nbsp;</>)
    }

    const toggleState = node => {
        if(node.state === 'closed') {
            let children = []
            if(typeof node.element === 'object') {
                if(Array.isArray(node.element)) {
                    let array = node.element
                    for(let i=0; i<array.length; i++) {
                        let childNode = createNode(array[i])
                        childNode.index = i
                        children.push(childNode)
                    }
                } else {
                    let props = Object.getOwnPropertyNames(node.element).sort()
                    for(let i=0; i<props.length; i++) {
                        let prop = props[i]
                        let childNode = createNode(node.element[prop])
                        childNode.index = prop
                        children.push(childNode)
                    }
                }
            }
            let newNode = {
                state: 'opened',
                element: node.element,
                index: node.index,
                children: children
            }
            updateWorkingTree(node,newNode)
        } else {
            let newNode = {
                state: 'closed',
                element: node.element,
                index: node.index,
                children: []
            }
            updateWorkingTree(node,newNode)
        }
    }

    const renderWorkingTree = () => {

        const renderRecursive = (node,level,path) => {

            let element = node.element

            if (element === undefined) {
                return <span className="undefined">undefined</span>
            } else if (element === null) {
                return <span className="null">null</span>
            }

            switch (typeof element) {
                case "string": {
                    return <span className="string">"{element}"</span>
                }
                case "boolean": {
                    return <span className="boolean">{element ? 'true' : 'false'}</span>
                }
                case "number":
                case "bigint": {
                    return <span className="number">{element}</span>
                }
                case "symbol": {
                    return <span className="symbol">{element.toString()}</span>
                }
                case "object": {
                    if (Array.isArray(element)) {
                        let array = element

                        let content = []
                        let isEmpty = false

                        content.push(<span className="array-bracket">{'['}</span>)
                        if (array.length > 0) {
                            if(node.state === 'closed') {
                                content.push(<span>&hellip;</span>)
                            } else {
                                content.push(<br />)
                                for (let i = 0; i < node.children.length; i++) {
                                    let childNode = node.children[i]
                                    content.push(renderIndent(level + 1))
                                    content.push(renderRecursive(childNode, level + 1, path + '/' + i))
                                    if (i !== node.children.length - 1) {
                                        content.push(<span>,</span>)
                                    }
                                    content.push(<br />)
                                }
                                content.push(renderIndent(level))
                            }
                        } else {
                            isEmpty = true
                        }
                        content.push(<span className="array-bracket">{']'}</span>)

                        let wrapper = null
                        if (isEmpty) {
                            wrapper = <span className="array-content empty" onClick={event => event.stopPropagation()}>{content}</span>
                        } else {
                            wrapper = <span className="array-content" onClick={event => { toggleState(node); event.stopPropagation(); }}>{content}</span>
                        }

                        return wrapper

                    } else {

                        let content = []
                        let isEmpty = false

                        content.push(<span className="object-bracket">{'{'}</span>)

                        let props = Object.getOwnPropertyNames(element).sort()

                        if(props.length > 0) {
                            if(node.state === 'closed') {
                                content.push(<span>&hellip;</span>)
                            } else {
                                content.push(<br />)
                                for (let i = 0; i < node.children.length; i++) {
                                    let childNode = node.children[i]
                                    let prop = childNode.index
                                    let value = childNode.element
                                    content.push(renderIndent(level + 1))
                                    if (typeof value === 'object' && ((Array.isArray(value) && value.length > 0) || (Array.isArray(value) == false && value != null && Object.getOwnPropertyNames(value).length > 0))) {
                                        content.push(<span className="prop-name clickable" onClick={event => { toggleState(childNode); event.stopPropagation(); }}>{prop}</span>)
                                    } else {
                                        // content.push(<span className="prop-name" onClick={()=>{}}>{prop}</span>)
                                        content.push(<span className="prop-name">{prop}</span>)
                                    }
                                    content.push(<span>:&nbsp;</span>)
                                    content.push(renderRecursive(childNode, level + 1, path + '/' + prop))
                                    if (i !== node.children.length - 1) {
                                        content.push(<span>,</span>)
                                    }
                                    content.push(<br />)
                                }
                                content.push(renderIndent(level))
                            }
                        } else {
                            isEmpty = true
                        }

                        content.push(<span className="object-bracket">{'}'}</span>)

                        let wrapper = null
                        if (isEmpty) {
                            wrapper = <span className="object-content empty" onClick={event => event.stopPropagation()}>{content}</span>
                        } else {
                            wrapper = <span className="object-content" onClick={event => { toggleState(node); event.stopPropagation(); }}>{content}</span>
                        }

                        return wrapper
                    }
                }
                case "function": {
                    // return <span className="function">{element.toString()}</span>    // zeigt die ganze funktion
                    return <span className="function"><i>function</i></span>
                }
            }
        }

        return renderRecursive(workingTree,0,'')
    }



    return (
        <div className="json-view">
            <span class="header">JSON <span className="title">{title}</span></span><br/>
            { renderWorkingTree() }
        </div>
    )

}

