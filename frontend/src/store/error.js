import produce from 'immer'

// default state
const defaultState = {
    uncaught: [],
    api: []
}

// actions
const ADD_UNCAUGHT_ERROR = 'error/add/uncaught'
const ADD_BACKEND_ERROR = 'error/add/backend'
const CLEAR_ALL = 'error/clear/all'

export const addUncaughtError = (error) => ({type: ADD_UNCAUGHT_ERROR, payload: error})
export const addBackendError = (error) => ({type: ADD_BACKEND_ERROR, payload: error})
export const clearAll = () => ({type: CLEAR_ALL})


// Immutable Update Patten
// https://redux.js.org/usage/structuring-reducers/immutable-update-patterns/
// https://redux.js.org/faq/performance#do-i-have-to-deep-clone-my-state-in-a-reducer-isnt-copying-my-state-going-to-be-slow

// Rule of thumb: Deep copy for every nesting level THAT IS AFFECTED. Copy references for all non-affected properties.
// Common pattern: Create a new Object (=new reference) for affected levels (of any depth). Use the spread operator to copy the 
// references to all properties (this makes sure to get all non-affected properties). For all affected properties, redeclare
// them manually after the spread operator. This replaces the copied reference (resulting from the spread operator) with a
// newly created reference. Recursivly 

// Consider using ImmerJS which encasulates this whole process of shallow/deep copying in a library so you dont have to deal
// with it anymore.
// https://immerjs.github.io/immer/
// https://www.smashingmagazine.com/2020/06/better-reducers-with-immer/



// reducer
export const reducer = (state = defaultState, action = null) => {
    /*
    console.log("toolbar reducer called")
    console.log("  STATE: " + JSON.stringify(state))
    console.log("  ACTION: " + JSON.stringify(action))
    */

    const { type, payload } = action

    switch (type) {
        case ADD_UNCAUGHT_ERROR:                // Example how to satisfy the immutable update pattern by hand
            return {                            // new reference for the returned state object
                ...state,                       // copy the references of all the properties
                uncaught: [                     // create a new reference for uncaught array property
                    ...state.uncaught,          // copy all the references for the array elements of uncaught
                    payload                     // insert the payload as a new array element
                ]
            }
        case ADD_BACKEND_ERROR:                 // Example how to use Immer to satisfy the the immutable update pattern
            return produce(state, draft => {
                draft.api.push(payload)
            })
        case CLEAR_ALL:
            return defaultState
        default:
            return state
    }
}
