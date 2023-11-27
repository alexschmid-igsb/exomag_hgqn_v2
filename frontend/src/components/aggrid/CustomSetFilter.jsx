import React from 'react'

import Checkbox from '@mui/material/Checkbox'

import { useSelector, useDispatch } from 'react-redux'
import * as GridStore from '../../store/grid'

import _ from 'lodash'
import produce from 'immer'

import './CustomSetFilter.scss'
import HomeRounded from '@mui/icons-material/HomeRounded'


/*
    Filter Interface Beschreibung aus der Doku:
    https://www.ag-grid.com/react-data-grid/component-filter/?#custom-filter-interface-2
*/

export default React.forwardRef((props, ref) => {

    const gridId = props.context.gridId
    const colId = props.colDef.colId

    const dispatch = useDispatch()
    
    const gridFilterGlobalIncrement = useSelector(state => state.grid[gridId]?.filter.globalIncrement)
    const filterState = useSelector(state => state.grid[gridId]?.filter.state[colId])

    // expose AG Grid Filter Lifecycle callbacks
    React.useImperativeHandle(ref, () => {

        return {

            // Return true if the filter is active. If active then
            //   1. the grid will show the filter icon in the column header
            //   2. the filter will be included in the filtering of the data
            isFilterActive() {
                return filterState != null && filterState.selectedValues instanceof Set && filterState.selectedValues.size > 0
            },

            // The grid will ask each active filter, in turn, whether each row in the grid passes. If any
            // filter fails, then the row will be excluded from the final set. A params object is supplied
            // containing attributes of node (the rowNode the grid creates that wraps the data) and data (the data
            // object that you provided to the grid for that row).
            doesFilterPass(params) {
                if(filterState != null && filterState.selectedValues instanceof Set && filterState.selectedValues.size > 0) {
                    const { api, colDef, column, columnApi, context, valueGetter } = props
                    const { node } = params
                    const value = valueGetter( {api, colDef, column, columnApi, context, data: node.data, getValue: (field) => node.data[field], node} )
                    return filterState.selectedValues.has(value)
                } else {
                    return true
                }
            },

            // Gets the filter state. If filter is not active, then should return null/undefined.
            // The grid calls getModel() on all active filters when gridApi.getFilterModel() is called.            
            getModel() {
                if(this.isFilterActive()) {
                    // it is safer to deep clone the state to avoid any changes directly on the referenced store object
                    return _.cloneDeep(filterState)
                } else {
                    return null
                }
            },

            // Restores the filter state. Called by the grid after gridApi.setFilterModel(model) is called.
            // The grid will pass undefined/null to clear the filter.            
            setModel(model) {
                let newFilterState = {}
                if(model == null) {
                    newFilterState.selectedValues = new Set()
                } else {
                    newFilterState = _.cloneDeep(model)
                }
                dispatch(GridStore.setGridFilterState(gridId,colId,newFilterState))
            }
        }
    })


    // main trigger to signal the filter changed into the aggrid internals
    React.useEffect(() => {
        console.log("FILTER STATE CHANGE --> calling props.filterChangedCallback()")
        props.filterChangedCallback()
    }, [filterState])


    // calculate all values of the filtered column. This depends on gridFilterGlobalIncrement and will be recalculated every time
    // gridFilterGlobalIncrement changes (for example when any other column filter changes). This will then also trigger a rerender
    // because allValues changing based on the gridFilterGlobalIncrement dependency.
    const allValues = React.useMemo(() => {

        console.log(`CUSTOM SET FILTER - ${props.colDef.headerName}: (RE)CALCULATE FILTER OPTIONS`)

        const { api, colDef, column, columnApi, context, valueGetter } = props                  // ES GIBT NOCH MEHR IN PROPS, siehe https://www.ag-grid.com/javascript-data-grid/component-filter/#custom-filter-parameters

        let values = new Map()
        api.forEachNode( (node,index) => {
            const value = valueGetter( {api, colDef, column, columnApi, context, data: node.data, getValue: (field) => node.data[field], node} )
            if(values.has(value) === false) {
                values.set(value, {
                    value: value,
                    totalRows: 0,
                    visibleRows: 0
                })
            }
            values.get(value).totalRows++
        })

        api.forEachNodeAfterFilter( (node,index) => {
            const value = valueGetter( {api, colDef, column, columnApi, context, data: node.data, getValue: (field) => node.data[field], node} )
            if(values.has(value) === false) {
                values.set(value, {
                    value: value,
                    totalRows: 0,
                    visibleRows: 0
                })
            }
            values.get(value).visibleRows++
        })
        
        return Array.from(values.values()).sort((a,b) => {
            if(a == undefined || a.value == null) {
                return 1
            }
            if(b == undefined || b.value == null) {
                return -1
            }
            return a.value.localeCompare(b.value)
        })

    }, [gridFilterGlobalIncrement])


    // get the selected state for a given value from the filter state
    const isValueSelected = value => {
        // console.log("IS VALUE SELECTED")
        // console.log(filterState)
        // console.log(typeof filterState?.selectedValues)
        if(filterState == null || filterState.selectedValues instanceof Set == false) {
            return false
        } else {
            return filterState.selectedValues.has(value)
        }
    }


    // change the selected state for a given value via the store. Changes in the store will trigger back into the
    // filterState (which if bound by useSelector) and thus trigger a rerender, which updates the controlled checkbox
    // state. Further, the change of the filterState triggers a filter change event via useEffect bound to filterState.
    // The filter changed event increments the gridFilterGlobalIncrement variable, which can be used to trigger all
    // other custom filters to adapt.
    const toggleValueSelected = value => () => {
        let newFilterState = produce(filterState == null ? {} : filterState, draft => {
            if(draft.selectedValues == null) {
                draft.selectedValues = new Set()
            }
            if(draft.selectedValues.has(value)) {
                draft.selectedValues.delete(value)
            } else {
                draft.selectedValues.add(value)
            }
        })
        dispatch(GridStore.setGridFilterState(gridId,colId,newFilterState))
    }


    React.useEffect(() => {
        // console.log(`CUSTOM SET FILTER - ${props.colDef.headerName}: init render`)
        // console.log(props.colDef.colId)
    }, [])


    return (

        <div className="custom-set-filter">
            <div className="values">
                { allValues.map( entry => 
                    <div className="row" onClick={toggleValueSelected(entry.value)}>
                        <div className="checkbox-container">
                            <Checkbox
                                className="checkbox"
                                size="small"
                                checked={isValueSelected(entry.value)}
                                onChange={()=>{}}
                            />
                        </div>
                        <div className="value">
                            {entry.value}<span className="counts">({entry.visibleRows}/{entry.totalRows})</span>
                        </div>
                    </div>
                )}
            </div>

        </div>


    )
})

