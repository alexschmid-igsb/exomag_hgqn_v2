import * as React from 'react';
import PropTypes from 'prop-types';
import { elementAcceptingRef } from '@mui/utils';
import { Transition } from 'react-transition-group';

// import useForkRef from '../utils/useForkRef';
// import useTheme from '../styles/useTheme';
// import { getTransitionProps, reflow } from '../transitions/utils';

import useForkRef from '@mui/material/utils/useForkRef'
import useTheme from '@mui/material/styles/useTheme'
import { getTransitionProps, reflow } from '@mui/material/transitions/utils'

import useWindowDimensions from './useWindowDimensions'
import { toBeInTheDOM } from '@testing-library/jest-dom/dist/matchers';


/*
 TODO v6: remove
 Conditionally apply a workaround for the CSS transition bug in Safari 15.4 / WebKit browsers.
 */
const isWebKit154 =
    typeof navigator !== 'undefined' &&
    /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) &&
    /(os |version\/)15(.|_)4/i.test(navigator.userAgent);



const DialogAnimation = React.forwardRef(function Grow(props, ref) {

    const {
        addEndListener,
        appear = true,
        children,
        easing,
        in: inProp,
        onEnter,
        onEntered,
        onEntering,
        onExit,
        onExited,
        onExiting,
        style,
        timeout = 'auto',
        // eslint-disable-next-line react/prop-types
        TransitionComponent = Transition,
        animationAnchor,
        ...other
    } = props;



    const windowDimensions = useWindowDimensions();

    const getTransform = (sx,sy,tx,ty) => `translate(${tx}px,${ty}px) scale(${sx},${sy})`
    // const getTransform = (sx,sy,tx,ty) => `scale(${sx},${sy})`

    const stateStyles = React.useMemo(() => {

        let anchorRect = animationAnchor.getBoundingClientRect()

        const sx = anchorRect.width / windowDimensions.width
        const sy = anchorRect.height / windowDimensions.height

        const tx = anchorRect.left - ((windowDimensions.width-anchorRect.width)/2.0)
        const ty = anchorRect.top - ((windowDimensions.height-anchorRect.height)/2.0)

        let result = {

            entering: {
                opacity: 0.5,
                transform: getTransform(sx,sy,tx,ty)
            },
            entered: {
                opacity: 1.0,
                transform: 'none',
            },
            exiting: {
                opacity: 0.5,
                transform: getTransform(sx,sy,tx,ty)
            },
            exited: {
                opacity: 0.0,
                transform: getTransform(sx,sy,tx,ty)
            }

        }

        return result

    }, [animationAnchor]) 
    
    


    const timer = React.useRef();
    const autoTimeout = React.useRef();

    const theme = useTheme();

    const nodeRef = React.useRef(null);
    const handleRef = useForkRef(nodeRef, children.ref, ref);

    const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
        if (callback) {
            const node = nodeRef.current;

            // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
            if (maybeIsAppearing === undefined) {
                callback(node);
            } else {
                callback(node, maybeIsAppearing);
            }
        }
    };

    const handleEntering = normalizedTransitionCallback(onEntering);

    const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
        reflow(node); // So the animation always start from the start.

        const {
            duration: transitionDuration,
            delay,
            easing: transitionTimingFunction,
        } = getTransitionProps(
            { style, timeout, easing },
            {
                mode: 'enter',
            },
        );

        let duration;
        if (timeout === 'auto') {
            duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
            autoTimeout.current = duration;
        } else {
            duration = transitionDuration;
        }

        node.style.transition = [
            theme.transitions.create('opacity', {
                duration,
                delay,
            }),
            theme.transitions.create('transform', {
                duration: isWebKit154 ? duration : duration * 0.666,
                delay,
                easing: transitionTimingFunction,
            }),
        ].join(',');

        if (onEnter) {
            onEnter(node, isAppearing);
        }
    });

    const handleEntered = normalizedTransitionCallback(onEntered);

    const handleExiting = normalizedTransitionCallback(onExiting);

    const handleExit = normalizedTransitionCallback((node) => {
        const {
            duration: transitionDuration,
            delay,
            easing: transitionTimingFunction,
        } = getTransitionProps(
            { style, timeout, easing },
            {
                mode: 'exit',
            },
        );

        let duration;
        if (timeout === 'auto') {
            duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
            autoTimeout.current = duration;
        } else {
            duration = transitionDuration;
        }

        node.style.transition = [
            theme.transitions.create('opacity', {
                duration,
                delay,
            }),
            theme.transitions.create('transform', {
                duration: isWebKit154 ? duration : duration * 0.666,
                delay: isWebKit154 ? delay : delay || duration * 0.333,
                easing: transitionTimingFunction,
            }),
        ].join(',');

        if (onExit) {
            onExit(node);
        }
    });

    const handleExited = normalizedTransitionCallback(onExited);

    const handleAddEndListener = (next) => {
        if (timeout === 'auto') {
            timer.current = setTimeout(next, autoTimeout.current || 0);
        }
        if (addEndListener) {
            // Old call signature before `react-transition-group` implemented `nodeRef`
            addEndListener(nodeRef.current, next);
        }
    };

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    return (
        <TransitionComponent
            appear={appear}
            in={inProp}
            nodeRef={nodeRef}
            onEnter={handleEnter}
            onEntered={handleEntered}
            onEntering={handleEntering}
            onExit={handleExit}
            onExited={handleExited}
            onExiting={handleExiting}
            addEndListener={handleAddEndListener}
            timeout={timeout === 'auto' ? null : timeout}
            {...other}
        >
            {(state, childProps) => {
                return React.cloneElement(children, {
                    style: {

                        visibility: state === 'exited' && !inProp ? 'hidden' : undefined,

                        ...stateStyles[state],

                        ...style,
                        ...children.props.style,

                    },
                    ref: handleRef,
                    ...childProps,
                });
            }}
        </TransitionComponent>
    );
});





DialogAnimation.propTypes /* remove-proptypes */ = {
    // ----------------------------- Warning --------------------------------
    // | These PropTypes are generated from the TypeScript type definitions |
    // |     To update them edit the d.ts file and run "yarn proptypes"     |
    // ----------------------------------------------------------------------
    /**
     * Add a custom transition end trigger. Called with the transitioning DOM
     * node and a done callback. Allows for more fine grained transition end
     * logic. Note: Timeouts are still used as a fallback if provided.
     */
    addEndListener: PropTypes.func,
    /**
     * Perform the enter transition when it first mounts if `in` is also `true`.
     * Set this to `false` to disable this behavior.
     * @default true
     */
    appear: PropTypes.bool,
    /**
     * A single child content element.
     */
    children: elementAcceptingRef.isRequired,
    /**
     * The transition timing function.
     * You may specify a single easing or a object containing enter and exit values.
     */
    easing: PropTypes.oneOfType([
        PropTypes.shape({
            enter: PropTypes.string,
            exit: PropTypes.string,
        }),
        PropTypes.string,
    ]),
    /**
     * If `true`, the component will transition in.
     */
    in: PropTypes.bool,
    /**
     * @ignore
     */
    onEnter: PropTypes.func,
    /**
     * @ignore
     */
    onEntered: PropTypes.func,
    /**
     * @ignore
     */
    onEntering: PropTypes.func,
    /**
     * @ignore
     */
    onExit: PropTypes.func,
    /**
     * @ignore
     */
    onExited: PropTypes.func,
    /**
     * @ignore
     */
    onExiting: PropTypes.func,
    /**
     * @ignore
     */
    style: PropTypes.object,
    /**
     * The duration for the transition, in milliseconds.
     * You may specify a single timeout for all transitions, or individually with an object.
     *
     * Set to 'auto' to automatically calculate transition time based on height.
     * @default 'auto'
     */
    timeout: PropTypes.oneOfType([
        PropTypes.oneOf(['auto']),
        PropTypes.number,
        PropTypes.shape({
            appear: PropTypes.number,
            enter: PropTypes.number,
            exit: PropTypes.number,
        }),
    ]),
};

DialogAnimation.muiSupportAuto = true;

export default DialogAnimation;