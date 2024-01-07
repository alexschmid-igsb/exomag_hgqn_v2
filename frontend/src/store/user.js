
// default state
const defaultState = {
    id: null,
    isSuperuser: false,
    /*
    info: null,
    role: 
    rights:
    */
}

// actions
const SET = 'user/set'
const CLEAR = 'user/clear'

export const setUser = (data) => ({type: SET, payload: data})
export const clearUser = () => ({type: CLEAR})

// reducer
export const reducer = (state = defaultState, action = null) => {
    const { type, payload } = action
    switch (type) {
        case CLEAR:
            return defaultState
        case SET:
            return payload
        default:
            return state
    }
}




