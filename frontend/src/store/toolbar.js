// default state
const defaultState = null

// actions
const SET = 'toolbar/set'
export const setToolbar = (data) => ({type: SET, payload: data})

// reducer
export const reducer = (state = defaultState, action = null) => {
    /*
    console.log("toolbar reducer called")
    console.log("  STATE: " + JSON.stringify(state))
    console.log("  ACTION: " + JSON.stringify(action))
    */

    const { type, payload } = action

    switch (type) {
        case SET:
            return payload
        default:
            return state
    }
}
























