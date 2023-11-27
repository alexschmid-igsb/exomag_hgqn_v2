
// default state
const defaultState = 'hello'


// actions
const SET = 'greetings/set'

export const setGreetings = (greetings) => ({type: SET, payload: greetings})


// reducer
export const reducer = (state = defaultState, action = null) => {

    // console.log("GREETINGS REDUCER")
    // console.log("  STATE: " + JSON.stringify(state))
    // console.log("  ACTION: " + JSON.stringify(action))

    const { type, payload } = action

    switch (type) {
        case SET:
            return payload
        default:
            return state
    }
}

