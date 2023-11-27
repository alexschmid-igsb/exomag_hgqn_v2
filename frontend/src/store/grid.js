import produce from 'immer'



// default state
const defaultState = {
}

const initialGridState = {
    columnState: [],
    sortings: [],                       // the grids sorting state (for read only, the actual sorting state is managed by aggrid and can only be set manipulated via UI or API)
    filter: {
        state: {},                      // a per filter state that should be used internally by custom filters
        updateCount: 0,                 // grids global update count value to signal changes in grids filters
        summary: []                     // quick summary about activated filters
    },
    rowCount: {
        total: 0,
        afterFiltering: 0
    }
}


// actions

const RESET_GRID = 'grid/reset'
const SET_GRID_SORTINGS = 'grid/set/sortings'
const SET_GRID_FILTER_STATE = 'grid/set/filter/state'
const INCREMENT_GRID_FILTER_UPDATE_COUNT = 'grid/increment/filter/updateCount'
const SET_GRID_ROW_COUNT = 'grid/set/rowCount'
const SET_GRID_FILTER_SUMMARY = 'grid/set/filter/summary'
const SET_GRID_COLUMN_STATE = 'grid/set/columnState'

export const resetGrid = (gridId) => ({type: RESET_GRID, gridId: gridId})
export const setGridSortings = (gridId,sortings) => ({type: SET_GRID_SORTINGS, gridId: gridId, sortings: sortings})
export const setGridFilterState = (gridId,colId,filterState) => ({type: SET_GRID_FILTER_STATE, gridId: gridId, filterId: colId, filterState: filterState})
export const incrementGridFilterUpdateCount = (gridId) => ({type: INCREMENT_GRID_FILTER_UPDATE_COUNT, gridId: gridId})
export const setGridRowCount = (gridId,rowCount) => ({type: SET_GRID_ROW_COUNT, gridId: gridId, rowCount: rowCount})
export const setGridFilterSummary = (gridId,filterSummary) => ({type: SET_GRID_FILTER_SUMMARY, gridId: gridId, filterSummary: filterSummary})
export const setGridColumnState = (gridId,columnState) => ({type: SET_GRID_COLUMN_STATE, gridId: gridId, columnState: columnState})








export const reducer = (state = defaultState, action = null) => {

    // console.log("GRID REDUCER CALLED")
    // console.log("  STATE: " + JSON.stringify(state))
    // console.log("  ACTION: " + JSON.stringify(action))

    switch (action.type) {

        /*
        case SET_GRID_SETTINGS:                // Example how to satisfy the immutable update pattern by hand
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
        */


            
        /*
        case SET_GRID_SETTINGS:
            console.log("JE JETZT: HIER DINGS")
            var {gridId,test} = action
            console.log(gridId)
            console.log(test)
            if(gridId === undefined || gridId === null) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] === undefined || draft[gridId] === null) {
                        draft[gridId] = {test: test}
                    } else {
                        draft[gridId].test = test
                    }
                })
            }
        */



        case RESET_GRID:
            console.log("RESET_GRID")
            var {gridId} = action
            console.log(gridId)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    draft[gridId] = initialGridState                    
                })
            }




        case SET_GRID_SORTINGS:
            console.log("SET_GRID_SORTINGS")
            var {gridId,sortings} = action
            console.log(gridId)
            console.log(sortings)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    draft[gridId].sortings = sortings
                })
            }


        case SET_GRID_FILTER_STATE:
            console.log("SET_GRID_FILTER_STATE")
            var {gridId,filterId,filterState} = action
            console.log(gridId)
            console.log(filterId)
            console.log(filterState)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    draft[gridId].filter.state[filterId] = filterState
                })
            }

    
        case INCREMENT_GRID_FILTER_UPDATE_COUNT:
            console.log("INCREMENT_GRID_FILTER_UPDATE_COUNT")
            var {gridId} = action
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    if(Number.isInteger(draft[gridId].filter.globalIncrement)) {
                        draft[gridId].filter.globalIncrement++
                    } else {
                        draft[gridId].filter.globalIncrement = 0
                    }
                })
            }



        case SET_GRID_ROW_COUNT:
            console.log("SET_GRID_ROW_COUNT")
            var {gridId,rowCount} = action
            console.log(gridId)
            console.log(rowCount)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    draft[gridId].rowCount = rowCount
                })
            }

            


        case SET_GRID_FILTER_SUMMARY:
            console.log("SET_GRID_FILTER_SUMMARY")
            var {gridId,filterSummary} = action
            console.log(gridId)
            console.log(filterSummary)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    draft[gridId].filterSummary = filterSummary
                })
            }
    


        case SET_GRID_COLUMN_STATE:
            console.log("SET_GRID_COLUMN_STATE")
            var {gridId,columnState} = action
            console.log(gridId)
            console.log(columnState)
            if(gridId == undefined) {
                return state
            } else {
                return produce(state, draft => {
                    if(draft[gridId] == undefined) {
                        draft[gridId] = initialGridState
                    }
                    draft[gridId].columnState = columnState
                })
            }



        default:
            return state
    }
}







