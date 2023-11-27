// default state
const defaultState = [] 

// actions
const SET = 'breadcrumbs/set'
export const setBreadcrumbs = (data) => ({type: SET, payload: data})

// reducer
export const reducer = (state = defaultState, action = null) => {
    const { type, payload } = action
    switch (type) {
        case SET:
            return payload
        default:
            return state
    }
}
























