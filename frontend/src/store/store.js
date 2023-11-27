import { createStore, combineReducers } from 'redux'

import { reducer as user } from './user'
import { reducer as greetings } from './greetings'
import { reducer as toolbar } from './toolbar'
import { reducer as error } from './error'
import { reducer as breadcrumbs } from './breadcrumbs'
import { reducer as grid } from './grid'

import {enableMapSet} from "immer"
enableMapSet()

const rootReducer = combineReducers({
    user,
    greetings,
    toolbar,
    error,
    breadcrumbs,
    grid
})

const store = createStore(rootReducer)

export default store
