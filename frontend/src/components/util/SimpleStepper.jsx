import React from 'react'

import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import JSONView from './JSONView'

import './SimpleStepper.scss'


const Message = ({message}) => {
    return (
        message != null ?
            message.type === 'info' ?
                <div className='message info'>
                    <IconifyIcon icon='ph:info-fill' />
                    {message.text}
                </div>
            : message.type === 'warning' ?
                <div className='message warning'>
                    <IconifyIcon icon='ph:seal-warning-fill' />
                    {message.text}
                </div>
            : message.type === 'error' ?
                <div className='message error'>
                    <IconifyIcon icon='ph:x-square-fill' />
                    {message.text}
                </div>
            : 
                null
        :
            null
    )
}



const Label = ({ id, index, state, label }) => {
    return (
        state != null ? 
            <div
                key={`step-label-div-${id}`}
                className={`label-container ${state.toLowerCase()}`}
            >
                <div className='label'>
                    <div className='index'>{index + 1}</div>
                    <span className='text'>{label}</span>
                </div>
                <div className='progress'>
                </div>
            </div>
        :
            <div>nein</div>
    )
}



const Step = ({ children }) => {
    return children
}

Step.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string
}



const StepContainer = ({ id, className, children }) => {
    return (
        <div
            key={`step-content-div-${id}`}
            className={'step-content' + (className != null ? ' ' + className : '')}
        >
            {children}
        </div>
    )
}









const SimpleStepper = ({
    className,
    children,
    activeStepId
}) => {

    const [guiLocked, setGuiLocked] = React.useState(false)
    const [stepState, setStepState] = React.useState(new Map())

    
    React.useEffect(() => {

        // console.log("\n\n\nuseEffect on [children,activeStepId]")
        // console.log(activeStepId)

        // find old state id and index
        let previousStepId = null
        let previousStepIndex = -1
        React.Children.forEach(children, (child, index) => {
            const state = stepState.get(child.props.id)
            if(state != null && state.state === 'ACTIVE') {
                previousStepId = child.props.id
                previousStepIndex = index
            }
        })

        // find next state index
        let activeStepIndex = -1
        React.Children.forEach(children, (child, index) => {
            const state = stepState.get(child.props.id)
            if(activeStepId === child.props.id ) {
                activeStepIndex = index
            }
        })

        // check if no changes
        if(activeStepId === previousStepId && activeStepIndex === previousStepIndex) {
            return
        }
        
        // build next step states
        let nextStepState = new Map()
        React.Children.forEach(children, (child, index) => {
            let nextState = {
                state: 'PENDING',
                animationState: null
            }
            if(child.props.id === activeStepId) {
                nextState.state = 'ACTIVE'
                nextState.animationState = previousStepIndex < activeStepIndex ? 'START_ENTER_RIGHT' : 'START_ENTER_LEFT'
            } else if(child.props.id === previousStepId) {
                nextState.animationState = previousStepIndex < activeStepIndex ? 'START_EXIT_LEFT' : 'START_EXIT_RIGHT'
            }
            nextStepState.set(child.props.id, nextState)
        })

        // set stepState
        setStepState(nextStepState)

    }, [children,activeStepId])

    
    // animation on stepState change
    React.useEffect(() => {

        // console.log("\n\n\nuseEffect on stepState")
        // console.log(stepState)
        
        let mode = null        
        let nextStepState = new Map()

        // for(let id of stepIds) {
        React.Children.forEach(children, (child, index) => {
            const id = child.props.id
            let nextState = { ...stepState.get(id) }
            switch(nextState.animationState) {
                case 'START_ENTER_RIGHT':
                    nextState.animationState = 'FINISH_ENTER_RIGHT'
                    mode = 'START'
                break;
                case 'START_ENTER_LEFT':
                    nextState.animationState = 'FINISH_ENTER_LEFT'
                    mode = 'START'
                break;
                case 'START_EXIT_RIGHT':
                    nextState.animationState = 'FINISH_EXIT_RIGHT'
                    mode = 'START'
                break;
                case 'START_EXIT_LEFT':
                    nextState.animationState = 'FINISH_EXIT_LEFT'
                    mode = 'START'
                break;
                case 'FINISH_ENTER_RIGHT':
                case 'FINISH_ENTER_LEFT':
                case 'FINISH_EXIT_RIGHT':
                case 'FINISH_EXIT_LEFT':
                    nextState.animationState = null
                    mode = 'FINISH'
                break;
            }
            // console.log(state)
            nextStepState.set(id, nextState)
        })

        if(mode === 'START') {
            setGuiLocked(true)
            setTimeout(() => {
                setStepState(nextStepState)
            }, 20)
        } if(mode === 'FINISH') { 
            setTimeout(() => {
                setStepState(nextStepState)
                setGuiLocked(false)
            }, 700)
        }

    }, [stepState])



    const actions = React.useMemo( () => {
        let actions = null
        React.Children.forEach(children, (child, index) => {
            let state = stepState.get(child.props.id)
            if(state != null && state.state === 'ACTIVE') {
                actions = {
                    next: child?.props?.onNext,
                    previous: child?.props?.onPrevious,
                    message: child?.props?.message
                }
            }
        })
        if(actions != null && (actions.next != null || actions.previous != null || actions.message != null)) {
            return actions
        } else {
            return null
        }
    }, [children,stepState])



    const renderFlag = React.useMemo( () => {
        if(children.length <= 0 || stepState.size <= 0) {
            console.log("case 0")
            return false
        }
        for(let child of children) {
            if(child?.props?.id == null) {
                console.log("case a")
                return false
            }
            if(stepState.get(child.props.id) == null || stepState.get(child.props.id).state == null) {
                console.log("case b")
                console.log(stepState)
                return false
            }
        }
        return true
    }, [children,stepState])



    return (
        <div className={`stepper${className ? (' ' + className) : ''}`}>
            { renderFlag ?
                <>
                    <div className='step-header'>
                        <span className="header-padding" />
                        { React.Children.map(children, (child, index) =>
                            <Label
                                key={`step-label-${child.props.id}`}
                                id={child.props.id}
                                index={index}
                                state={stepState.get(child.props.id).state}
                                label={child.props.label}
                            />
                        )}
                        <span className="header-padding" />
                    </div>

                    <div className="content-container">
                        { React.Children.map(children, (child, index) => {
                            let state = stepState.get(child.props.id)
                            if(state == null) return null
                            if(state.state === 'ACTIVE' || state.animationState != null) {
                                let className = null
                                if (state.animationState === 'START_ENTER_RIGHT' || state.animationState === 'FINISH_EXIT_RIGHT') {
                                    className = 'pos-right'
                                } else if (state.animationState === 'START_ENTER_LEFT' || state.animationState === 'FINISH_EXIT_LEFT') {
                                    className = 'pos-left'
                                }
                                return <StepContainer key={`step-container-${child.props.id}`} className={className}>{child}</StepContainer>
                            }
                            return null
                        })}
                    </div>

                    { actions != null ?
                        <div className='step-actions'>
                            { actions.previous != null ? 
                                <Button
                                    disabled={guiLocked || actions.previous.disabled === true}
                                    className='button previous-step'
                                    variant='text'
                                    size='small'
                                    startIcon={actions.previous.icon != null ? actions.previous.icon : <IconifyIcon icon='tabler:arrow-big-left-lines' />}
                                    onClick={actions.previous.onClick}
                                >
                                    {actions.previous.label}
                                </Button>
                            :
                                <span style={{ width: '130px' }}></span>
                            }   
                            <Message message={actions.message} />
                            { actions.next != null ? 
                                <Button
                                    disabled={guiLocked || actions.next.disabled === true}
                                    className='button confirm-step'
                                    variant='text'
                                    size='small'
                                    endIcon={actions.next.icon != null ? actions.next.icon : <IconifyIcon icon='mingcute:check-2-fill' />}
                                    onClick={actions.next.onClick}
                                >
                                    {actions.next.label}
                                </Button>
                            :
                                <span style={{ width: '130px' }}></span>
                            }   

                        </div>
                    :
                        null
                    }

                </>
            :
                null
            }
        </div>
    )


}





SimpleStepper.propTypes = {
    children: PropTypes.arrayOf(Step)
}


export {
    Step,
    SimpleStepper
}

