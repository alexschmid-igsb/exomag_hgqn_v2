import React from 'react'

import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { v4 as uuidv4 } from 'uuid'

import lodash from 'lodash'

import PopoverButton from '../components/PopoverButton'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions, { dialogActionsClasses } from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '../components/DialogTitle'
import Checkbox from '@mui/material/Checkbox'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import GridsIcon from '@mui/icons-material/AutoAwesomeMotion'
import GridIcon from '@mui/icons-material/Article'
import HomeIcon from '@mui/icons-material/HomeRounded'
import DeleteIcon from '@mui/icons-material/Delete'

import jQuery from 'jquery'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"
// import { as ExcelIcon } from "@iconify/icons-file-icons/microsoft-excel"

/*
import bla from "@iconify/icons-mdi-light/home"
import faceWithMonocle from "@iconify/icons-twemoji/face-with-monocle"
*/

import './Grid.scss'
import '../components/aggrid/CustomTheme.scss'

import API from '../api/fetchAPI'

import { setToolbar } from '../store/toolbar'
import { setBreadcrumbs } from '../store/breadcrumbs'
// import { setGridSettings } from '../store/grid'
// import { setGridSortings, setGridFilterGlobalIncrement } from '../store/grid'
import * as GridStore from '../store/grid'

import { CellValueComparatorString, CellValueComparatorInteger, CellValueComparatorDecimal } from '../components/aggrid/CustomComparators'
import CustomSetFilter from '../components/aggrid/CustomSetFilter.jsx'
import createDateTimeFormater from '../components/aggrid/DateTimeFormatter.js'

import UploadIcon from '@mui/icons-material/Upload'
import RefreshIcon from '@mui/icons-material/Refresh'

import VerticalSeparator from '../components/VerticalSeparator'
import ExcelUpload from '../views/ExcelUpload'
import ExcelExport from '../views/ExcelExport'
import generateKey from '../util/generateKey'
import store from '../store/store'

import RowExpansionCellRenderer from '../components/aggrid/RowExpansionCellRenderer'
import DefaultCellRenderer from '../components/aggrid/DefaultCellRenderer'

import DefaultEnumValueRenderer from '../components/aggrid/DefaultEnumValueRenderer'

import Linkout from '../components/linkout/Linkout'
import { unstable_composeClasses } from '@mui/material'



const ImportIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="ph:import-bold"/>
const ExportIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="ph:export-bold"/>
const ExcelIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="file-icons:microsoft-excel"/>



const ColumnStateControl = ({columnApi,updateIncrement}) => {

    const toggleVisibility = columnState => () => {
        const column = columnApi.getColumn(columnState.colId)
        console.log("TOGGLE VISIBILITY: ")
        console.log(columnState)
        console.log(column)
        columnApi.applyColumnState({
            state: [{
                colId: columnState.colId,
                hide: column.visible
            }]
        })

    }

    const setAll = hide => () => {
        const columnState = columnApi.getColumnState()
        const newState = columnState.map( entry => ({ colId: entry.colId, hide: hide }) )
        // console.log(arr)
        columnApi.applyColumnState({ state: newState })
    }

    const renderList = () => {
        const columnState = columnApi.getColumnState()

        return(
            <>
                <span style={{display: 'none'}}>{updateIncrement}</span>
                <div className="buttons">
                    <Button
                        startIcon={<IconifyIcon icon="bxs:show"/>}
                        onClick={setAll(false)}
                    >
                        Show All
                    </Button>
                    <Button
                        startIcon={<IconifyIcon icon="bxs:hide"/>}
                        onClick={setAll(true)}
                    >
                        Hide All
                    </Button>
                </div>
                <List className="list" dense>
                    { columnState.map(columnStateEntry => {
                        const column = columnApi.getColumn(columnStateEntry.colId)
                        return(
                            <ListItem
                                className="item"
                                key={columnStateEntry.colId}
                                onClick={toggleVisibility(columnStateEntry)}
                            >
                                <ListItemIcon
                                    className="icon"
                                >
                                    <Checkbox
                                        className="checkbox"
                                        checked={columnStateEntry.hide == false}
                                        // edge="start"
                                        // 
                                        // tabIndex={-1}
                                        // disableRipple
                                        // inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    className="label"
                                    primary={column.colDef.headerName}
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </>
        )
    }


    return (
        columnApi ? 
            <div className="column-state-control">
                { renderList() }
            </div>
         :
            null
    )
}







// TODO: in scss übernehmen usw
const VariantLinksRenderer = props => {
    return (
        <div className="variant-links">
            <Linkout flavor="varsome" />
            <Linkout flavor="gnomad" />
            <Linkout flavor="franklin" />
        </div>
    )
}





export default function Grid() {

    const routeParams = useParams()
    const navigate = useNavigate()

    const gridId = routeParams.gridId
    const gridLayout = routeParams.gridLayout == null ? 'default' : routeParams.gridLayout

    const dispatch = useDispatch()

    const rowCount = useSelector(state => state.grid[gridId]?.rowCount)
    const filterSummary = useSelector(state => state.grid[gridId]?.filterSummary)
    const sortings = useSelector(state => state.grid[gridId]?.sortings)
    const gridFilterGlobalIncrement = useSelector(state => state.grid[gridId]?.filter.globalIncrement)
    const columnState = useSelector(state => state.grid[gridId]?.columnState)

    const gridRef = React.useRef()

    const DateFormatter = createDateTimeFormater({type: 'date'})





    const [gridInfo,setGridInfo] = React.useState(null)
    
    // const [expandedRows, setExpandedRows] = React.useState(new Map())
    const [hasExpandedRows, setHasExpandedRows] = React.useState(false)









    // const [test, setTest] = React.useState(0)

    const [columnDefs, setColumnDefs] = React.useState(null)
    const [data, setData] = React.useState(null)



    const [columnStateUpdateIncrement, setColumnStateUpdateIncrement] = React.useState(0)



    React.useEffect(() => {
        // dispatch(setToolbar(renderToolbar()))
        dispatch(setToolbar(null))
    }, [gridId])


    React.useEffect(() => {
        if(gridInfo == null || gridInfo.id == null || gridInfo.label == null) {
            return
        }

        const breadcrumbs = [
            {
                key: 'home',
                label: 'Home',
                path: '/home',
                icon: HomeIcon
            },
            {
                key: 'grid',
                label: gridInfo.label,
                path: `/grids/${gridId}`,
                icon: GridIcon
            }
        ]

        dispatch(setBreadcrumbs(breadcrumbs))
    }, [gridInfo])








    // DefaultColDef sets props common to all Columns
    const defaultColDef = React.useMemo(() => ({
        sortable: true
    }))



    // Example of consuming Grid Event
    /*
    const cellClickedListener = React.useCallback(event => {
        console.log('cellClicked', event)
    }, [])
    */



    // Example load data from sever
    React.useEffect(() => {
        dispatch(GridStore.resetGrid(gridId))
        loadGridData()
    }, [gridId])
















    const updateRowCount = () => {
        if(gridRef?.current?.api == null) {
            return
        }
        const rowCount = {
            total: 0,
            afterFiltering: 0
        }
        gridRef.current.api.forEachNode( node => {
            if(!node.group) {
                rowCount.total++
            }
        })
        gridRef.current.api.forEachNodeAfterFilter( node => {
            if(!node.group) {
                rowCount.afterFiltering++
            }
        })
        dispatch(GridStore.setGridRowCount(gridId,rowCount))
    }





    const updateFilterSummary = () => {
        if(gridRef?.current?.api == null || gridRef?.current?.columnApi == null) {
            return
        }
        console.log("UPDATE FILTER SUMMARYYYIEIEEE")

        const filterModel = gridRef.current.api.getFilterModel()
        const colIds = Object.keys(filterModel)

        const filterSummary = []
        colIds.map( colId => {
            const column = gridRef.current.columnApi.getColumn(colId)
            const entry = {
                colId: colId,
                headerName: column.colDef.headerName
            }
            filterSummary.push(entry)
        })

        dispatch(GridStore.setGridFilterSummary(gridId,filterSummary))
    }



    React.useEffect(() => {

        // 1. update row count
        updateRowCount()

        // 2. update active filter summary
        updateFilterSummary()

    }, [gridFilterGlobalIncrement])









    function cleanOut(obj) {
        var cleaned = JSON.stringify(obj, null, 2);
        return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
            return match.replace(/"/g, "")
        })
    }







    function loadGridData() {

        console.log(`loadGridData: ${gridId}`)

        const path = '/api/grid/get/' + gridId
        API.get(path, { doNotThrowFor: [404] }).then(response => {
            console.log("LOAD GRID DATA")
            console.log(response)

            buildColumnDefs(response.scheme)
            setGridInfo(response.gridInfo)

            console.log(response.data)
            // console.log(cleanOut(response.data))

            const data = response.data.map(entry => ({...entry, __isExpanded__: false}))

            setData(data)

        }).catch(e => {
            // Überlegung: Anstatt hier auf die Fehlerseite 404 umzuleiten, könnte man den "not found" error auch direkt in der Tabellenkomponente anzeigen
            console.error(`Could not load grid data for grid '${gridId}'`)
            console.error(e)
            navigate('/notfound')
        })




        /*

        console.log('loadGridData')

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => setData(data))
        


        buildColumnDefs()

        return 

        */



        /*

        console.log("loadGridData")
        console.log(gridId)

        const path = '/api/grid/get/' + gridId
        API.get(path, { doNotThrowFor: [404] }).then(data => {
            console.log("LOAD GRID DATA")
            console.log(data)

            buildColumnDefs(data.columns)

            setGridMetadata(data.gridMetadata)

            setData(data.data.map(entry => {
                entry.push({
                    isExpanded: false
                })
                return entry
            }))
        }).catch(err => {
            console.log(err)

            // anstatt auf 404 umzuleiten macht es hier vielleicht mehr sinn, innerhalb der komponenten einen "not found" error anzuzeigen
            navigate('/notfound')
        })

        */


    }






    function getValueRendererByFieldType(layoutField,fieldDefinition) {

        // console.log("getValueRendererByFieldType")
        // console.log(layoutField)
        // console.log(fieldDefinition)

        let renderer = undefined

        // map from custom renderer names to actual renderer components
        if(layoutField.customValueRenderer != null) {
            switch(layoutField.customValueRenderer) {
                case 'variant_external_links':
                    return VariantLinksRenderer
                /*
                case 'bla':
                    return SomeRenderer
                case 'foo':
                    return SomeOtherRenderer
                */
            }
        }

        // try to determine the renderer based on the field type
        const isArrayType = lodash.isArray(fieldDefinition)
        if(isArrayType && fieldDefinition.length === 1) {
            fieldDefinition = fieldDefinition[0]
        }

        if(fieldDefinition.type === 'string' && lodash.isArray(fieldDefinition.enum) && fieldDefinition.enum.length > 0) {
            return DefaultEnumValueRenderer
        }

        return renderer
    }









        /*
            Komplette Liste laut dem Paper: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4544753/

            n = 28

            PVS1    pathogenic very strong          ganz dunkles rot (very strong)

            PS1     pathogenic strong               dunkles rot in varsome (strong)
            PS2     pathogenic strong               dunkles rot in varsome (strong)
            PS3     pathogenic strong               dunkles rot in varsome (strong)
            PS4     pathogenic strong               dunkles rot in varsome (strong)

            PM1     pathogenic moderate             dunkles rot (strong)
            PM2     pathogenic moderate             helles orange (supporting)
            PM3     pathogenic moderate             dunkles orange (moderate)
            PM4     pathogenic moderate             dunkles orange (moderate)
            PM5     pathogenic moderate             dunkles rot (strong)
            PM6     pathogenic moderate             dunkles orange (moderate)

            PP1     pathogenic supporting           helles orange (supporting)
            PP2     pathogenic supporting           helles orange (supporting)
            PP3     pathogenic supporting           dunkles rot (strong)
            PP4     pathogenic supporting           helles orange (supporting)
            PP5     pathogenic supporting           ganz dunkles rot (very strong, WIESO?)



            BP1     benign supporting           alle die gleiche farbe bei varsome (das leichte grün)
            BP2     benign supporting
            BP3     benign supporting
            BP4     benign supporting
            BP5     benign supporting
            BP6     benign supporting
            BP7     benign supporting

            BS1     benign strong               alle die gleiche farbe bei varsome (das dunklere grün)
            BS2     benign strong
            BS3     benign strong
            BS4     benign strong

            BA1     benign stand alone (das höchste level an benign)           das ganz dunkle grün



            Abbreviations: 

            BA: benign (citeria basierend auf allele frequency)

            BS: benign strong;
            BP: benign supporting

            PM, pathogenic moderate;
            PP, pathogenic supporting;
            PS, pathogenic strong;
            PVS, pathogenic very strong
        */




    function buildColumnDefs(scheme) {




        console.log('buildColumnDefs')
        // console.log(scheme)




        const layout = scheme?.layouts?.[gridLayout]
        if(lodash.isArray(layout) === false) {
            throw new Error(`Missing grid layout '${gridLayout}' in grid data scheme`)
        }

        let columnDefs = []

        // Translate layout groups into AGGrid Groups
        for(let layoutGroup of layout) {

            // Create AGGrid column def group
            let group = {
                headerName: layoutGroup.label,
                sortable: false,
                children: []
            }
            columnDefs.push(group)

            // check if fields for this group exist
            if(lodash.isArray(layoutGroup.fields) === false) {
                continue
            }

            // the layout group type definition must not be missing
            const groupType = layoutGroup.type
            if(groupType.id == null) {
                console.error("Error: missing layout group type")
                console.error(groupType)
                continue
            }

            // set missing row expansion flag to false
            if(groupType.rowExpansion == null) {
                groupType.rowExpansion = false
            }

            // translate the layout fields for the current group into AGGrid column definitions
            for(let layoutField of layoutGroup.fields) {

                // TODO:
                //   1. auch in primary sollte der path beachtet werden



                // determine the data path for the column def
                let dataPath = undefined
                if(groupType.id === 'primary') {
                    dataPath = layoutField.id
                }
                else if(groupType.id === 'nested' || groupType.id === 'linked') {
                    if(layoutField.path != null) {
                        dataPath = layoutField.path
                    } else {
                        dataPath = layoutField.id   
                    }
                }

                // fetch the data field definition from the scheme for the current column def
                let fieldDefinition = undefined
                if(groupType.id === 'primary') {

                    fieldDefinition = scheme?.definition?.[layoutField.id]

                } else if(groupType.id === 'nested') {

                    const rootDefinition = scheme?.definition?.[groupType.root]
                    const fieldPath = layoutField.path != null ? layoutField.path : layoutField.id

                    if(groupType.rowExpansion === true) {
                        if(lodash.isArray(rootDefinition)) {
                            fieldDefinition = lodash.get(rootDefinition[0], fieldPath)
                        } else {
                            console.error("Error: rowExpansion / field definition mismatch")
                            console.error(layoutField)
                            continue
                        }
                    } else {
                        if(lodash.isArray(rootDefinition) === false) {
                            fieldDefinition = lodash.get(rootDefinition, fieldPath)
                        } else {
                            console.error("Error: rowExpansion / field definition mismatch")
                            console.error(layoutField)
                            continue
                        }
                    }

                } else if(groupType.id === 'linked') {

                    // TODO

                }

                if(layoutField.customValueRenderer == null && fieldDefinition == null) {
                    console.error("Error: missing field definition")
                    console.error(layoutField)
                    console.error(scheme)
                    continue
                }

                // set the cell renderer for the current column def based on rowExpansion flag and data field definition
                let cellRenderer = DefaultCellRenderer
                let valueRenderer = getValueRendererByFieldType(layoutField,fieldDefinition)
                if(groupType.id === 'primary') {
                    // all fine for now
                } else if(groupType.id === 'nested') {
                    if(groupType.rowExpansion === true) {
                        cellRenderer = RowExpansionCellRenderer
                    } else {
                        // all fine for now
                    }
                } else if(groupType.id === 'linked') {
                    // TODO
                }

                // create AGGRid column definition
                let field = {
                    // autoHeight: true,
                    autoHeight: false,
                    valueGetter: valueGetter,
                    valueGetterContext: {
                        groupType: groupType,
                        dataPath: dataPath,
                        fieldDefinition: fieldDefinition
                    },
                    layoutField: layoutField,
                    headerName: layoutField.label,
                    filter: true,
                    resizable: true,
                    columnGroupShow: layoutField.majorField != null && layoutField.majorField === true ? undefined : 'open',
                    cellRenderer: cellRenderer,
                    valueRenderer: valueRenderer
                }
                group.children.push(field)

            }
        }

        setColumnDefs(columnDefs)

        return 






    }







    
    
    /*
    const getRowId = params => {
        console.log("getRowId")
        console.log(params)
        return params.data._id
    }
    */

    const getRowId = params => params.data._id

    const valueGetter = params => {

        // Important: For nested and linked groups with (rowExpansion === true)
        // the valueGetter must always return an array because the RowExpansionCellRenderer
        // expects an array of values (the row extension values)

        // console.log('valueGetter')
        // console.dir(params, {depth: null})
        // console.dir(context, {depth: null})

        let context = params != null && params.colDef != null ? params.colDef.valueGetterContext : undefined

        if(context == null) {
            return undefined
        }

        let cellValue = undefined

        if(context.groupType.id === 'primary') {

            cellValue = params.data[context.dataPath]

        } else if(context.groupType.id === 'nested') {

            const rootData = params.data[context.groupType.root]

            if(rootData != null && context.groupType.rowExpansion === true) {
                cellValue = []
                for(let item of rootData) {
                    let itemValue = lodash.get(item, context.dataPath)
                    cellValue.push(itemValue)
                }
            } else {
                cellValue = lodash.get(rootData, context.dataPath)
            }

        } else if(context.groupType.id === 'linked') {

            // TODO
            //   1. die linked id (oder array von linked ids) muss geholt werden anstatt dem root item (oder array von root items)
            //   2. das linked objekt muss per id geholt weren
            //   3. im linked objekt den data path auflösen

        }

        return cellValue
    }













    // Example using Grid's API
    const buttonListener = React.useCallback(e => {
        gridRef.current.api.deselectAll()
    }, [])

    const gridSizeChanged = () => {
        // gridRef.current.api.sizeColumnsToFit()
    }









    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)

    const openUploadDialog = () => {
        setUploadDialogOpen(true)
    }

    const closeUploadDialog = () => {
        setUploadDialogOpen(false)
        // setUploadId(uuidv4())
        loadGridData()
    }




    const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

    const openExportDialog = () => {
        setExportDialogOpen(true)
    }

    const closeExportDialog = () => {
        setExportDialogOpen(false)
    }








    // Sorting API: clear sort, save sort, restore from save
    // https://www.ag-grid.com/react-data-grid/row-sorting/#sorting-api

    const handleRemoveSorting = colEntry => event => {
        console.log("REMOVE SORTING:")
        console.log(colEntry)

        gridRef.current.columnApi.applyColumnState({
            state: [{
                colId: colEntry.colId,
                sort: null
            }]
        })
    }

    const handleRemoveAllSortings = event => {
        gridRef.current.columnApi.applyColumnState({
            defaultState: { sort: null },
        })
    }




    const handleRemoveFilter = colEntry => event => {
        const filterInstance = gridRef.current.api.getFilterInstance(colEntry.colId)
        filterInstance.setModel(null)
        gridRef.current.api.onFilterChanged()
    }

    const handleRemoveAllFilters = event => {
        gridRef.current.api.setFilterModel(null)
    }






    const updateColumnStateControl = event => {
        console.log("UPDATE COLUMN STATE CONTROL")
        setColumnStateUpdateIncrement(columnStateUpdateIncrement+1)
    }

    const hiddenColumnCount = React.useMemo(() => {
        let count = {
            hiddenColumns: 0,
            totalColumns: 0
        }
        const columnApi = gridRef?.current?.columnApi
        if(columnApi != null) {
            const columnState = columnApi.getColumnState()
            for(let entry of columnState) {
                if(entry.hide) {
                    count.hiddenColumns++
                }
                count.totalColumns++
            }
        }
        return count
    }, [columnStateUpdateIncrement])















    // helper functions for expand toggle

    const getParentRow = child => {
        if(child instanceof jQuery === false) {
            child = jQuery(child)
        }
        if(child.is('div.ag-row')) {
            return child
        } else {
            return child.parents('div.ag-row')
        }
    }

    const getRowHeightByContent = jQueryRowElement => {

        let aggridCells = jQueryRowElement.children('div.ag-cell')

        let height = {
            content: 0,
            inner: 0,
            outer: 0
        }

        aggridCells.each(function(index,element) {
            let jElement = jQuery(element)

            let contentHeight = jElement.height()
            if(contentHeight > height.content) {
                height.content = contentHeight
            }

            let innerHeight = jElement.innerHeight()
            if(innerHeight > height.inner) {
                height.inner = innerHeight
            }
            
            let outerHeight = jElement.outerHeight()
            if(outerHeight > height.outer) {
                height.outer = outerHeight
            }
        })

        return height
    }



    const rowDoubleClickHandler = event => {
        
        console.log("row double click")
        // console.log(event)
        // console.log(event.event.target)

        let clickTarget = jQuery(event.event.target)

        let jQueryRowElement = getParentRow(clickTarget)
        let aggridRowNode = event.node

        toggleExpand(aggridRowNode,jQueryRowElement)
    }


    const toggleExpand = (aggridRowNode,jQueryRowElement) => {

        // TODO
        // Es ist nicht getestet, wie sich AGGrid verhält, wenn expanded rows aus dem suchtbaren bereich gescrollt
        // und entfernt werden.
        // Wenn die expanded row wieder reingescrollt wird, ist zu erwarten, dass der zustand nicht konsistent
        // wiederhergestellt wird. Entweder geht das __isExpanded__ flag verloren (hier sollte man testen, ob stattdessen
        // das interne expand flag siehe setExpanded wiederhergestellt wird und ggf. das verwenden anstellle von __isExpanded__
        // Wird die row expanded gerenedert? Das passiert wenn überhaupt unvollständig, da zwar die cell expansions
        // gerendert werden (vorrausgesetzt das flag ist gesetzt), aber NICHT die zusätzliche row expansion, das
        // passiert nur beim expanden selbst.
        // Es könnte also sein, dass man besser darauf setzten sollte, dass raus und wieder reingescrollte rows
        // nicht als expanded zurück kommen
        // Ansonsten müsstem man schauen, ob es ein AGGrid Event gibt, welches beim einscrollen (wiedererscheinen)
        // einer row triggert. Hier könnte man das je nach flag auch den row expansions div rendern.

        let nextExpandFlag = aggridRowNode.data.__isExpanded__ === false

        // toggle row expanded flag setzen
        aggridRowNode.setData({
            ...aggridRowNode.data,
            __isExpanded__: nextExpandFlag
        })

        // set hasExpandedRows flag for grid
        let hasExpandedRows = false
        gridRef.current.api.forEachNode( (rowNode, index) => {
            if(rowNode.data.__isExpanded__) {
                hasExpandedRows = true
            }
        })
        setHasExpandedRows(hasExpandedRows)

        // save row height before expanding
        if(nextExpandFlag === true) {
            const height = getRowHeightByContent(jQueryRowElement)
            aggridRowNode['__heightBeforeExpand__'] = height
        }


                

        // expand the row by setRowHeight and api.onRowHeightChanged()
        setTimeout(() => {
            let aggridCells = jQueryRowElement.children('div.ag-cell')
            if(nextExpandFlag === true) {
                const height = getRowHeightByContent(jQueryRowElement)
                aggridCells.height(height.content)
                aggridRowNode.setRowHeight(height.outer)
            } else {
                const height = aggridRowNode['__heightBeforeExpand__']
                aggridCells.css('height','unset')
                aggridRowNode.setRowHeight(height.outer)
            }
            gridRef.current.api.onRowHeightChanged()
        }, 100)




 
    }











    const rowClassRules = {
        'expanded': params => params.data.__isExpanded__
    }
    



    const renderToolbar = () =>
    <>
        <Tooltip title="Reload Grid">
            <IconButton aria-label="refresh" size="small">
                <RefreshIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        <VerticalSeparator color={'#AAA'} />
        {/* <PopoverButton
            useSmallButton={true}
            useIconButton={false}
            useHover={false}
            buttonLabel="Import Export"
            buttonClass="inline-button"
            buttonKey="edit-column-settings"
            // buttonIcon={<IconifyIcon icon="fluent:edit-20-filled" />}
            buttonIcon={<IconifyIcon icon="ic:round-import-export" />}
            popoverId="edit-column-settings"
            popoverClass="testtesttest"
            paperClass="testtesttest"
            onOpen={()=>{}}
            onClose={()=>{}}
            // closeTrigger={null}
        >
            <SimpleList
                items={[
                    {
                        key: 'excel-import',
                        icon: ExcelIcon,
                        label: 'Excel Import',
                        // routerPath: '/profile'
                    },
                    {
                        key: 'excel-export',
                        icon: ExportIcon,
                        label: 'Excel Export',
                        // routerPath: '/profile'
                    }
                ]}
                // onClick={onClick}
            />
        </PopoverButton> */}
        <Button
            size="small"
            // startIcon={<UploadIcon />}
            onClick={openUploadDialog}
            // startIcon={<IconifyIcon icon={ExcelIcon}/>}
            startIcon={<IconifyIcon icon="clarity:import-line"/>}
        >
            Excel Import
        </Button>
        <VerticalSeparator color={'#AAA'} />
        <Button
            size="small"
            onClick={openExportDialog}
            startIcon={<IconifyIcon icon="clarity:export-line"/>}
        >
            Excel Export
        </Button>

    </>









    const renderUploadDialog = () =>
        <Dialog
            scroll='body'
            // maxWidth={false}
            fullWidth={true}
            maxWidth={'md'}
            open={uploadDialogOpen}
            onClose={closeUploadDialog}
        >
            <DialogTitle
                onClose={closeUploadDialog}
            >
                <IconifyIconInline icon="file-icons:microsoft-excel" style={{fontSize: '1.2rem', marginRight: '8px' /* color: '#227245'*/}}/>
                <span>Excel Import</span>
            </DialogTitle>

            <DialogContent>

                <ExcelUpload
                    gridId={gridId}
                    // uploadId={uploadId}
                    onClose={closeUploadDialog}
                />



                
            </DialogContent>


            {/* <DialogActions>
                <Button onClick={closeUploadDialog}>Close</Button>
            </DialogActions> */}

        </Dialog>















    const renderGrid = () =>
        <div className={`grid-container ag-theme-alpine ag-theme-alpine-modified`}>
            <AgGridReact
                className={`${hasExpandedRows ? 'has-expanded-rows' : ''}`}
                ref={gridRef} // Ref for accessing Grid's API

                columnDefs={columnDefs}             // Column Defs for Columns
                defaultColDef={defaultColDef}       // Default Column Properties

                rowData={data} // Row Data for Rows

                animateRows={true}
                
                // rowSelection='multiple'
                suppressRowClickSelection={true}                    // keine row selection by click

                // onCellClicked={cellClickedListener}             // Optional - registering for Grid Event
                // onCellDoubleClicked={ event => {alert('double')}}

                suppressColumnVirtualisation={true}                 // alle rows werden immer gerendert, auch wenn sie nicht im sichtbaren bereich liegen

                onRowDoubleClicked={rowDoubleClickHandler}

                onGridSizeChanged={gridSizeChanged}
                getRowId={getRowId}

                rowClassRules={rowClassRules}

                suppressCellSelection={true}

                context={{
                    gridId: gridId,
                    toggleExpand: toggleExpand
                }}

                onFilterChanged={ event => {
                    console.log("onFilterChanged")
                    dispatch(GridStore.incrementGridFilterUpdateCount(gridId))
                }}

                onSortChanged={ event => {
                    const columnState = event.columnApi.getColumnState()
                    const sortings = []
                    for(let state of columnState) {
                        if(state.sort != null) {
                            let column = event.columnApi.getColumn(state.colId)
                            let sorting = {
                                colId: state.colId,
                                headerName: column.colDef.headerName,
                                sortDirection: state.sort,
                                sortIndex: state.sortIndex
                            }
                            sortings.push(sorting)
                            // console.log(state)
                        }
                    }
                    sortings.sort( (a,b) => a.sortIndex > b.sortIndex ? 1 : a.sortIndex < b.sortIndex ? -1 : 0 )
                    dispatch(GridStore.setGridSortings(gridId,sortings))
                }}

                onColumnVisible={updateColumnStateControl}
                onColumnMoved={updateColumnStateControl}


                // braucht man nicht, wenn man autoHeight verwendet
                // getRowHeight={getRowHeight}




            />

        </div>





        const renderFilterToolbar = () =>
            <div className="grid-filter-toolbar ag-theme-alpine">

                {/* COUNTS */}
                <div className="category active">
                    <IconifyIcon className="category-icon" icon="ic:round-numbers" />
                    <div className="text row-text">
                        <span className="primary">
                            {rowCount == null ? 0 : rowCount.afterFiltering} row{rowCount != null && rowCount.afterFiltering !== 1 ? 's' : null} showing
                        </span>
                        <span className="secondary">
                            {rowCount == null ? 0 : rowCount.total} total, {rowCount == null ? 0 : rowCount.total-rowCount.afterFiltering} filtered out
                        </span>
                    </div>
                </div>
                <div className="separator"></div>

                {/* COLUMNS */}
                <div className="category active">
                    <IconifyIcon className="category-icon" icon="fluent:column-triple-20-filled" />
                    <div className="text sorting-text">
                        <span className="primary">
                            { hiddenColumnCount.hiddenColumns > 0 ? `${hiddenColumnCount.hiddenColumns} column${hiddenColumnCount.hiddenColumns > 1 ? 's are' : ' is'} hidden` : "All columns are showing" }
                        </span>
                        <span className="secondary">
                            {/* <Tooltip title={"Edit column settings"}>
                            <div style={{}}> */}
                            <PopoverButton
                                useIconButton={true}
                                useHover={false}
                                buttonClass="inline-button"
                                buttonKey="edit-column-settings"
                                // buttonIcon={<IconifyIcon icon="fluent:edit-20-filled" />}
                                buttonIcon={<IconifyIcon icon="fluent:notepad-edit-16-regular" />}
                                popoverId="edit-column-settings"
                                popoverClass="testtesttest"
                                paperClass="testtesttest"
                                onOpen={()=>{}}
                                onClose={()=>{}}
                                // closeTrigger={null}
                            >
                                <ColumnStateControl
                                    columnApi={gridRef.current?.columnApi}
                                    updateIncrement={columnStateUpdateIncrement}
                                />
                            </PopoverButton>

                        </span>
                    </div>
                </div>

                <div className="separator"></div>

                {/* SORTINGS */}
                <div className={`category ${sortings != null && sortings.length > 0 ? 'active' : null}`}>
                    <IconifyIcon className="category-icon" icon="bi:sort-alpha-down" />
                    <div className="text sorting-text">
                        <span className="primary">
                            { sortings == null || sortings.length === 0 ? 'No' : sortings.length} sorting{sortings != undefined && sortings.length !== 1 ? 's' : null} active
                            { sortings == null || sortings.length <= 0 ? null :
                            <Tooltip title="Remove all sortings">
                                <IconButton
                                    disabled={sortings == undefined || sortings.length <= 0}
                                    className="inline-button"
                                    size="small"
                                    onClick={handleRemoveAllSortings}
                                >
                                    <IconifyIcon icon="icon-park-outline:delete-two" />
                                </IconButton>
                            </Tooltip>
                            }
                        </span>

                        <span className="secondary">
                        {
                            sortings != undefined && sortings.length > 0 ?
                            sortings.map(entry => 
                                <>
                                    {/* { sortings[0] === entry ? null : <>,&nbsp;&nbsp;</> } */}
                                    { entry.headerName }
                                    { entry.sortDirection === 'asc' ? <IconifyIcon style={{marginRight: '-2px'}} icon="fluent:arrow-sort-up-24-filled" /> : <IconifyIcon style={{marginRight: '-2px'}} icon="fluent:arrow-sort-down-24-filled" /> }
                                    <Tooltip title={`Remove sorting for '${entry.headerName}'`}>
                                        <IconButton
                                            // disabled={sortings == undefined || sortings.length <= 0}
                                            className="inline-button"
                                            size="small"
                                            onClick={handleRemoveSorting(entry)}
                                        >
                                            <IconifyIcon icon="icon-park-outline:delete-two" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                            :
                            <>No entries</>
                        }
                        </span>
                    </div>
                </div>
                <div className="separator"></div>


                {/* FILTER */}
                <div className={`category ${filterSummary != null && filterSummary.length > 0 ? 'active' : null}`}>
                    <IconifyIcon className="category-icon" icon="dashicons:filter" />
                    <div className="text filter-text">
                        <span className="primary">
                            { filterSummary == null || filterSummary.length === 0 ? 'No' : filterSummary.length} filter{filterSummary != null && filterSummary.length !== 1 ? 's' : null} active
                            { filterSummary == null || filterSummary.length <= 0 ? null :
                            <Tooltip title="Remove all filters">
                                <IconButton
                                    disabled={filterSummary == null || filterSummary.length <= 0}
                                    className="inline-button"
                                    size="small"
                                    onClick={handleRemoveAllFilters}
                                >
                                    <IconifyIcon icon="icon-park-outline:delete-two" />
                                </IconButton>
                            </Tooltip>
                            }
                        </span>
                        <span className="secondary">
                        {
                            filterSummary != undefined && filterSummary.length > 0 ?
                            filterSummary.map(entry => 
                                <>
                                    { entry.headerName }
                                    <Tooltip title={`Remove filter for '${entry.headerName}'`}>
                                        <IconButton
                                            className="inline-button"
                                            size="small"
                                            onClick={handleRemoveFilter(entry)}
                                        >
                                            <IconifyIcon icon="icon-park-outline:delete-two" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                            :
                            <>No entries</>
                        }
                        </span>
                    </div>
                </div>
                <div className="separator"></div>



            </div>









    return (
        <>

            {/* {renderFilterToolbar()} */}
            {renderGrid()}
            {/* {renderUploadDialog()} */}
            <ExcelExport
                open={exportDialogOpen}
                onClose={closeExportDialog}
                api={gridRef?.current?.api}
                columnApi={gridRef?.current?.columnApi}
                columnDefs={columnDefs}
            />
        </>
    )
}






