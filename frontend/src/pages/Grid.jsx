import React from 'react'

import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { v4 as uuidv4 } from 'uuid'

import lodash from 'lodash'

import PopoverButton from '../components/PopoverButton'

import DefaultPopover from '../components/DefaultPopover.jsx'

import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'

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
import ArticleIcon from '@mui/icons-material/Article'
import HomeIcon from '@mui/icons-material/HomeRounded'
import DeleteIcon from '@mui/icons-material/Delete'

import GridConstants from '../grid-constants'

// import JSONView from '../components/util/JSONView'
import JSONView from '../components/util/JSONViewTopDown'

import jQuery, { hasData } from 'jquery'

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

// import Linkout from '../components/linkout/Linkout'

import {
    Franklin as FranklinLink,
    Gnomad as GnomadLink,
    Varsome as VarsomeLink
} from '../components/linkout/Linkout'


import collectAll from '../util/collectAll'



const ImportIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="ph:import-bold"/>
const ExportIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="ph:export-bold"/>
const ExcelIcon = ({fontSize,className}) => <IconifyIcon fontSize={fontSize} className={className} icon="file-icons:microsoft-excel"/>



const ColumnStateControl = ({columnApi,updateIncrement}) => {

    const toggleVisibility = columnState => () => {
        const column = columnApi.getColumn(columnState.colId)
        // console.log("TOGGLE VISIBILITY: ")
        // console.log(columnState)
        // console.log(column)
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
/*
const VariantLinksRenderer = props => {
    return (
        <div className="variant-links">
            <Linkout flavor="varsome" />
            <Linkout flavor="gnomad" />
            <Linkout flavor="franklin" />
        </div>
    )
}
*/





const GenPosRenderer = props => {

    const render = value => {
        if(value == null) {
            return null
        }
        return (
            <span className="cell_value_genomic_position">
                <span className="build">{value.build}</span>
                <span className="separator"></span>
                <span className="chr">{value.chr}</span>
                <span className="separator"></span>
                <span className="pos">{value.pos}</span>
                <span className="separator"></span>
                <span className="ref">{value.ref}</span>
                <span className="separator"></span>
                <span className="alt">{value.alt}</span>
            </span>
        )
    }

    return (
        render(props.value)
    )
}







const LinkIcon = () => <IconifyIcon className="icon" icon="pajamas:external-link"/>










const VariantGeneDetails = ({gene}) => {

    const renderGeneHGNC = () => {
        let result = []

        result.push(
            <p className="title">
                <span className="symbol-name">
                    {gene.hgnc.symbol} 
                </span>
                <span className="hgnc-tag">HGNC</span>
            </p>
        )

        result.push(
            <p>
                <span className="label">HGNC ID </span><br/><a target='_blank' href={'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/' + gene.hgnc.id }>{gene.hgnc.id}<LinkIcon/></a>
            </p>
        )

        for(let occurrence of gene.occurrences) {

            result.push(
                <p>
                    <div className="occurrence">OCCURRENCE</div>

                    <div className="section">
                        <span className="label">Range</span>
                        <span className="gene-pos">
                            <span className="build">GRCh38</span>
                            <span className="separator"></span>
                            <span className="chr">{occurrence.pos.chr}</span>
                            <span className="separator"></span>
                            <span className="start">{occurrence.pos.start}</span>&nbsp;-&nbsp;
                            <span className="end">{occurrence.pos.end}</span>
                        </span>
                    </div>

                    {
                        occurrence.synonyms.length > 0 ?
                            <div className="section">
                                <span className="label">Synonyms</span>
                                { occurrence.synonyms.map(item => <span>{item}</span>)}
                            </div>
                        :
                            null
                    }

                    {
                        occurrence.ensembl.length > 0 ?
                            <div className="section">
                                <span className="label">Ensembl</span>
                                { occurrence.ensembl.map(item => <a target='_blank' href={'https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + item }>{item}<LinkIcon/></a>)}
                            </div>
                        :
                            null
                    }

                    {
                        occurrence.ncbi.length > 0 ?
                            <div className="section">
                                <span className="label">NCBI</span>
                                { occurrence.ncbi.map(item => <a target='_blank' href={'https://www.ncbi.nlm.nih.gov/gene/?term=' + item }>{item}<LinkIcon/></a>)}
                            </div>
                        :
                            null
                    }
                </p>
            )
    
        }



        /*
        */

        return <div className="variant-grid-gene-detail-view">{result}</div>
    }

    return (
        gene.type === 'HGNC' ? renderGeneHGNC() : null
    )

}



const VariantGenesRenderer = props => {

    const render = value => {

        if(lodash.isArray(value) === true) {
            // console.log(JSON.stringify(value))

            let result = []
            for(const entry of value) {

                if(entry.type === 'HGNC' && lodash.isString(entry.hgnc.symbol) && entry.hgnc.symbol.length > 0) {
                    result.push(

                        <DefaultPopover
                            mode = 'CLICK'
                            classes={{ triggerContainer: 'variant-gene-container' }}
                            trigger = {
                                <span className="variant-gene hgnc">
                                    { entry.hgnc.symbol }
                                </span>
                            }
                        >
                            <VariantGeneDetails gene={entry} />
                        </DefaultPopover>
                                                
                    )
                }
            }

            if(result.length > 0) {
                return (
                    <div className="variant-genes">
                        {result}
                    </div>
                )
            }
        }

        return null
    }

    return (
        render(props.value)
    )
}









function createQuickFilterKeywords(customQuickFilterFields) {

    return function(params) {

        console.log("createQuickFilterKeywords")

        const value = params.value
        let result = []
        
        if(lodash.isString(value)) {
            return value
        }

        if(lodash.isArray(customQuickFilterFields)) {

            if(lodash.isArray(value) === false && lodash.isObject(value) === true) {
                value = [value]
            }
    
            for(const entry of value) {

                let collected = collectAll(entry,customQuickFilterFields)
                for(let item of Object.values(collected)) {
                    if(lodash.isNumber(item) || lodash.isString(item)) {
                        result.push(item)
                    }
                }
            }
        }

        console.log(params.value)
        console.log(result.join(' '))

        return result.join(' ')
    }
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

    const [searchString, setSearchString] = React.useState('')

    const [columnDefs, setColumnDefs] = React.useState(null)

    const [data, setData] = React.useState(null)



    const [columnStateUpdateIncrement, setColumnStateUpdateIncrement] = React.useState(0)



    React.useEffect(() => {
        // dispatch(setToolbar(renderToolbar()))
        dispatch(setToolbar(null))

        setRowViewControl({ isOpen: false, row: null })

    }, [gridId])







    const [rowViewMode, setRowViewMode] = React.useState(null)


    React.useEffect(() => {

        if(gridInfo == null || gridInfo.id == null || gridInfo.label == null) {
            return
        }


        // TODO: DIESER SWITCH MUSS HIER WEG, DER MODE SOLL KOMPLETT VON AUßEN KONFIGURIERBAR SEIN
        if(gridId === 'variants') {
            setRowViewMode('VIEW')
        } else if(gridId === 'cases') {
            setRowViewMode('EXPAND')
        }

        // HIER HARDGECODET UMSCHALTEN ZWISCHEN DEN CLICK MODES BASIEREND AUF DEM 
        // GRID NAME

        updateBreadcrumbs()

    }, [gridInfo])





    const updateBreadcrumbs = () => {

        const breadcrumbs = [
            {
                key: 'home',
                label: 'Home',
                path: '/home',
                icon: HomeIcon
            },
            {
                key: 'grid',
                label: GridConstants[gridId].label,
                path: GridConstants[gridId].path,
                icon: () => <IconifyIcon icon={GridConstants[gridId].icon}/>
            }
        ]

        if(rowViewMode === 'VIEW' && rowViewControl?.isOpen === true && rowViewControl?.row != null) {
            breadcrumbs.push({
                    key: 'rowview',
                    label: rowViewControl?.row?.id,
                    path: `/grids/${gridId}/${rowViewControl?.row?.id}`,     // TODO: DIESE LINKS SOLLEN DIREKT IN DIE ANSICHT FÜHREN
                    icon: ArticleIcon
            })
        }

        dispatch(setBreadcrumbs(breadcrumbs))

    }






    // DefaultColDef sets props common to all Columns
    const defaultColDef = React.useMemo(() => ({
        sortable: true
    }))




    const [rowViewControl, setRowViewControl] = React.useState({
        isOpen: false,
        row: null
    })

    const openRowDetailView = (row) => {
        setRowViewControl({
            isOpen: true,
            row: row
        })
    }

    const closeRowDetailView = () => {
        setRowViewControl({
            isOpen: false,
            row: null
        })
    }


    React.useEffect(() => {
        updateBreadcrumbs()
    }, [rowViewControl])












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

        // console.log("UPDATE FILTER SUMMARY")

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








    // worüf war das nochmal ?!??
    // function cleanOut(obj) {
    //     var cleaned = JSON.stringify(obj, null, 2);
    //     return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
    //         return match.replace(/"/g, "")
    //     })
    // }







    function loadGridData() {

        // console.log(`loadGridData: ${gridId}`)

        // TODO: hier auch nocht das verwendetet layout an die api übergeben

        const path = '/api/grid/get/' + gridId
        API.get(path, { doNotThrowFor: [404] }).then(response => {

            // console.log("LOAD GRID DATA")
            // console.log(response)
            // console.log(cleanOut(response.data))

            buildColumnDefs(response.scheme)
            setGridInfo(response.gridInfo)

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
                // case 'variant_external_links':
                //     return VariantLinksRenderer
                case 'variant_link_franklin':
                    return FranklinLink
                case 'variant_link_gnomad':
                    return GnomadLink
                case 'variant_link_varsome':
                    return VarsomeLink
                case 'gen_pos_renderer':
                    return GenPosRenderer
                case 'variant_genes_renderer':
                    return VariantGenesRenderer
            }
        }

        // try to determine the renderer based on the field type
        if(lodash.isArray(fieldDefinition) && fieldDefinition.length === 1) {
            fieldDefinition = fieldDefinition[0]
        }

        if(lodash.isString(fieldDefinition.type) === true) {

            if(fieldDefinition.type === 'string' && lodash.isArray(fieldDefinition.enum) && fieldDefinition.enum.length > 0) {
                return DefaultEnumValueRenderer
            }

            if(fieldDefinition.type === 'date') {
                return DateFormatter
            }

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













    function resolveFieldDefinition(parent, path, full) {

        let pos = path.indexOf('.')

        if(pos > 0) {

            // no leaf 

            let current = path.substring(0,pos)
            let remaining = path.substring(pos+1)

            if(lodash.isString(current) === false || current.length <= 0) {
                throw new Error(`data path syntax error: ${full}`)
            }

            if(lodash.isString(remaining) === false || remaining.length <= 0) {
                throw new Error(`data path syntax error: ${full}`)
            }

            let child = parent[current]

            if(child == null) {
                throw new Error(`can not resolve path element: ${current} in ${full}`)
            }

            if(lodash.isObject(child)) {

                if(lodash.isString(child.reference) === true) {
                    if(lodash.isObject(child.referencedScheme) == true) {
                        return resolveFieldDefinition(child.referencedScheme, remaining, full)
                    } else {
                        throw new Error(`missing referenced scheme: ${current} in ${full}`)
                    }
                } else {
                    return resolveFieldDefinition(child, remaining, full)
                }

            } else if(lodash.isArray(child) === true) {
                throw new Error(`non-leaf path element must not resolve to an array type: ${current} in ${full}`)
            } else {
                throw new Error(`data path syntax error: ${current} in ${full}`)
            }

        } else if(pos === -1) {

            // leaf

            let current = path

            if(lodash.isString(current) === false || current.length <= 0) {
                throw new Error(`data path syntax error: ${current} in ${full}`)
            }

            let child = parent[current]

            if(child == null) {
                throw new Error(`can not resolve path element: ${current} in ${full}`)
            }

            return child

        } else {
            throw new Error(`data path syntax error: ${full}`)
        }
    }






    function buildColumnDefs(scheme) {

        // console.log('buildColumnDefs')
        // console.log(scheme)

        const layout = scheme?.layouts?.[gridLayout]
        if(lodash.isObject(layout) === false || lodash.isArray(layout.description) === false) {
            throw new Error(`Missing grid layout '${gridLayout}' in grid data scheme`)
        }

        let columnDefs = []

        // Translate layout groups into AGGrid Groups
        for(let layoutGroup of layout.description) {

            // console.log("LAYOUT GROUP: " + layoutGroup.label)

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

                // console.log("   LAYOUT FIELD: " + layoutField.id)

                // check if no grid column field
                if(layoutField.gridColumn === false) {
                    continue
                }

                // set data path for this column def
                let dataPath = layoutField.path

                /*
                if(groupType.id === 'primary') {
                    dataPath = layoutField.path
                    if(layoutField.path != null) {
                        dataPath += '.' + layoutField.path
                    }
                }
                else if(groupType.id === 'nested') {
                    if(layoutField.path != null) {
                        dataPath = layoutField.path
                    } else {
                        dataPath = layoutField.id   
                    }
                }
                */

                // fetch the data field definition from the scheme for the current column def

                /*
                
                    Das Problem ist, dass die field definition bei populated pfaden noch nicht
                    funktioniert. Man geht hier über die root definition und holt dann mit
                    lodash.get einfach den pfad und bekommt im normalfall die field definition

                    Das funktioniert nicht bei populated bzw reference fields. Und auch nicht 
                    bei mehrfache arrays auf dem pfad (sieht unten, es wird nur für den root
                    pfad geschaut ob er ein array type ist)

                    Lösungsansatz:

                    lodash.get sollte man ersetzen durch eine angepasste funtkion. Diese muss
                    Bei jedem schritt prüfen, ob es ein array type ist und ob es ein reference
                    type ist. Bei referencen muss man dann weitermachen mit dem scheme welches
                    referenziert wird. Dieses könnte man entweder zusätzlich vom backend
                    als zusammenstellung bekommen oder aber das backend könnte die in das
                    scheme an der richtigen stelle einfügen z.b. als referenced_scheme
                    was sicherlich eine ganz elegante lösung wäre.
                    Das mit den arrays muss auch nochmal gut durchdacht und vorallem getestet
                    werden

                    Weiterhin:
                    Bei primary dürfte es auch nicht funktionieren, wenn man populated fields
                    definiert, die aber einen type haben welcher bekannt sein muss, um z.b.
                    custom renderer zu setzen.

                    ARRAYS:
                    Der value getter erstellt ein array, wenn es 
                    
                    im value getter
                    Wenn rowExpansion === true dann muss rootData ein array sein
                    die values werden geholt, indem der dataPath auf dem item angewandt wird
                    Fazit: Das root element ist das array, wenn es nested arrays gibt, dann
                    wird der value getter problem haben, werte innerhalb aufzulösen..

                    Eventuell muss man eine struktur bauen, mit der der value getter arbeiten
                    kann und in jedem schritt prüfen kann, wo man sich befindet. so könnte
                    man arrays zusammenbauen immer wenn man auf ein arra stößt
                    das macht allerdings die semantik der daten kaputt, weil es dann keinen sinn mehr macht deep in die stukrur
                    vorzudringen (außer in gewissen fällen ??!?)


                    TODO:

                      0. VARIANTS SCHEME ANPASSEN

                      1. die test daten wieder seeden

                      DONE
                      2. beim laden von schemes muss das ganze scheme traversiert werden, und die referencschemes einghängt werden.
                         PROBLEM: 
                         circles müssen vermieden werden. das ganze wird abgebrochen, sobald man auf eine scheme trifft, dass man schon
                         besucht hat.. oder gibt es einen besseren weg?

                    Wenn es cycles gibt, dann haben wir ein problem!!



                    Vernüfntige coumns für variant in cases mit eigener column group

                    In Variants die build:chrom:pos:alt:ref zu einer column zusammenfassen mit eigenem renderer

                */

                let fieldDefinition = undefined

                if(groupType.id === 'primary') {

                    // fieldDefinition = scheme?.definition?.[layoutField.id]
                    fieldDefinition = resolveFieldDefinition(scheme.definition, dataPath, dataPath)

                } else if(groupType.id === 'nested') {

                    const rootDefinition = scheme?.definition?.[groupType.root]
                    const fieldPath = layoutField.path

                    if(groupType.rowExpansion === true) {
                        if(lodash.isArray(rootDefinition)) {
                            // fieldDefinition = lodash.get(rootDefinition[0], fieldPath)
                            fieldDefinition = resolveFieldDefinition(rootDefinition[0], fieldPath, fieldPath)
                        } else {
                            throw new Error(`rowExpansion / fieldDefinition mismatch \n ${layoutField}`)
                        }
                    } else {
                        if(lodash.isArray(rootDefinition) === false) {
                            // fieldDefinition = lodash.get(rootDefinition, fieldPath)
                            fieldDefinition = resolveFieldDefinition(scheme.definition, fieldPath, fieldPath)
                        } else {
                            throw new Error(`rowExpansion / fieldDefinition mismatch \n ${layoutField}`)
                        }
                    }

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
                }

                // Setup a quick filter keyword getter when global search path are specified in the field definition
                let getQuickFilterText = null
                if(layoutField.customQuickFilterFields != null) {
                    getQuickFilterText = createQuickFilterKeywords(layoutField.customQuickFilterFields)
                }


                // CREATE AGGRID COLUMN DEFINITION
                let field = {
                    // autoHeight: true,
                    autoHeight: false,
                    valueGetter: valueGetter,
                    valueGetterContext: {
                        groupType: groupType,
                        dataPath: dataPath,
                        fieldDefinition: fieldDefinition
                    },
                    cellRenderer: cellRenderer,
                    valueRenderer: valueRenderer,
                    getQuickFilterText: getQuickFilterText,
                    layoutField: layoutField,
                    headerName: layoutField.label,
                    filter: true,
                    resizable: true,
                    columnGroupShow: layoutField.majorField != null && layoutField.majorField === true ? undefined : 'open',
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

        /*
            Eigentlich sollte der Pfad element für element aufgelöst werden
            sobald man auf ein refereziertes element stößt, sollte dieses geholt werden
            sobald man auf null oder undefined stößt, bricht das ab

            das sollte gehen bei primary UND nested gleichermaßen

            Probleme: 
            es gibt nicht für jedes pfadelement ein type, oder?
            andererseits müssen alle linked felder einen type dazu definiert haben
            und wenn der linked type 
        */

        if(context.groupType.id === 'primary') {

            cellValue = lodash.get(params.data, context.dataPath)

        } else if(context.groupType.id === 'nested') {

            const rootData = params.data[context.groupType.root]

            // hier müsste für rootData die field definition über den context
            // verfügbar gemacht werden.
            // Dann müsste man eigentlich die gleiche routine wie für primary zur
            // pfad traversierung verwenden können

            if(rootData != null && context.groupType.rowExpansion === true) {
                cellValue = []
                for(let item of rootData) {
                    let itemValue = lodash.get(item, context.dataPath)
                    cellValue.push(itemValue)
                }
            } else {
                cellValue = lodash.get(rootData, context.dataPath)
            }

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
        // console.log("REMOVE SORTING:")
        // console.log(colEntry)

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
        //  console.log("UPDATE COLUMN STATE CONTROL")
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



        // get target and row elements
        let clickTarget = jQuery(event.event.target)
        let jQueryRowElement = getParentRow(clickTarget)
        let aggridRowNode = event.node

        // console.log("row double click")
        // console.log(event)
        // console.log(event.event.target)

        if(rowViewMode === 'VIEW') {

            openRowDetailView(aggridRowNode)

        } else if(rowViewMode === 'EXPAND') {

            // Die grid komponenten sollte über properties konfiguriert werden, ob eine row expansion oder
            // eine detail view verwendet werden soll

            toggleExpand(aggridRowNode,jQueryRowElement)
        }
    }


    const toggleExpand = (aggridRowNode,jQueryRowElement) => {

        // TODO

        // Es ist nicht getestet, wie sich AGGrid verhält, wenn expanded rows aus dem sichtbaren bereich gescrollt
        // und entfernt werden.
        // Wenn die expanded row wieder in den sichtbaren bereich gescrollt wird, st zu erwarten, dass der zustand
        // nicht konsistent wiederhergestellt wird. Entweder geht das __isExpanded__ flag verloren (hier sollte man
        // testen, ob stattdessen das interne expand flag siehe setExpanded wiederhergestellt wird und dann ggf.
        // das anstellle von __isExpanded__ verwenden

        // Wird die row expanded gerenedert? Das passiert wenn überhaupt unvollständig, da zwar die cell expansions
        // gerendert werden (vorrausgesetzt das flag ist gesetzt), aber NICHT die zusätzliche row expansion, das
        // passiert nur beim expanden selbst.

        // Es könnte also sein, dass es besser ist, wenn raus und wieder reingescrollte rows gar nicht erst als
        // expanded zurück kommen.
        // Ansonsten müsstem man schauen, ob es ein AGGrid Event gibt, welches beim einscrollen (wiedererscheinen)
        // einer row triggert. Hier könnte man dann je nach flag auch den row expansions div rendern.


        // TODO: Besseres Konzept
        // Irgendwie sollte man das ganze nochmal überarbeiten um eine saubere Lösung zu finden. Momentan läuft es so,
        // dass zuerst die paddings durch das expand flag gerdendert werden und sich durch transition mit verzögerung
        // öffnen. DANACH erst kann die höhe der row ermittelt und gesetzt werden.
        // Beim schließen das gleiche, nur umgekehrt.

        // Gewünscht wäre, wenn das berechnen der benötigten höhe ohne verzögerung möglich wäre
        // Option 1: Man öffnet das ganze ohne transition und kann direkt nach dem rerender die row höhe setzen (diese
        // kann dann problemlos per transition geöffnet werden). Es gibt keine zuverlässigen trigger für das ende des
        // renderings (oder?) und deswegen muss man wieder über setTimeout gehen.
        // Eventuell Kann man im hinzugerenderte elementen js code unterbringen, der ausgeführt wird, wenn das element
        // erzeugt (hinzugefügt? gerendert?) wurde und so einen trigger generieren.
        // Eine weitere option wäre, die Höhe der bekannten Teile (padding + expanded rows) fest zu berechnen und dann
        // nur die Höhe des zusätzlichen Teils zu holen und zu addieren. Wenn es sofort (d.h. ohne timeout und/oder rendering)
        // trigger gehen soll, dann müsste derzusätzliche teil entweder verher bestimmbar sein, oder im vorraus
        // gerendert sein (was wahrscheinlich keine gute idee ist, da man hier eventuell auswändigere dinge rendern möchte
        // und das nicht für tausende rows bei grid loading machen will)

        // Letztendlich könnte man das top padding hinzuaddieren und dann gleichzeitig mit set row height setzen, um einen
        // einheitlichen öffnen effekt zu bekommen

        // Jetzt: Damit anfangen, den zusätzlihen bereich als dummy mit random height zu generieren bzw zu rendern
        // dann kann man versuchen den rest 

    




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
            console.log("height before expand: " + JSON.stringify(height))
            aggridRowNode['__heightBeforeExpand__'] = height
        }

        // expand the row by setRowHeight and api.onRowHeightChanged()
        setTimeout(() => {
            let aggridCells = jQueryRowElement.children('div.ag-cell')
            if(nextExpandFlag === true) {
                const height = getRowHeightByContent(jQueryRowElement)
                console.log("neue height berechnet: " + JSON.stringify(height))
                aggridCells.height(height.content)
                aggridRowNode.setRowHeight(height.outer)
            } else {
                const height = aggridRowNode['__heightBeforeExpand__']
                aggridCells.css('height','unset')
                aggridRowNode.setRowHeight(height.outer)
            }
            gridRef.current.api.onRowHeightChanged()
        }, 500)
 
    }






    const updateSearch = lodash.throttle(searchString => {
        gridRef.current.api.setQuickFilter(searchString)
    }, 1000, { leading: false, trailing: true })

    const onSearchChanged = event => {
        updateSearch(event.target.value)
        setSearchString(event.target.value)
        gridRef.current.api.setQuickFilter(event.target.value)
    }

    const onSearchClear = event => {
        setSearchString('')
        gridRef.current.api.setQuickFilter(null)
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
                    // console.log("onFilterChanged")
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

                cacheQuickFilter={true}

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



            <div className="search-container">
                <div className="search-field">
                    <div className="icon-container">
                        <IconifyIcon className="search-icon" icon="lets-icons:search-light" />
                    </div>
                    <InputBase
                        value={searchString}
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Volltextsuche in allen Feldern"
                        onChange={event => onSearchChanged(event)}
                    />
                    <IconButton
                        className="clear-button"
                        type="button"
                        aria-label="search"
                        onClick={event => onSearchClear(event)}
                    >
                        <IconifyIcon icon="ic:round-clear" />
                    </IconButton>
                </div>
            </div>

            {/* {renderFilterToolbar()} */}

            { renderGrid() }

            <div
                className={`grid-row-details enter-bottom ${rowViewControl?.isOpen === true ? 'opened' : 'closed'}`}
                onClick={() => closeRowDetailView()}
            >

                <div
                    className="grid-row-details-content"
                    onClick={event => event.stopPropagation()}
                >

                    <div className="header">
                        <IconButton
                            className="close-row-details-button"
                            size="small"
                            onClick={() => closeRowDetailView()}
                        >
                            {/* <IconifyIcon icon="mingcute:arrow-left-fill" /> */}
                            {/* <IconifyIcon icon="ph:arrow-fat-left-duotone" /> */}
                            {/* <IconifyIcon icon="tabler:arrow-big-left" /> */}
                            <IconifyIcon icon="ic:round-keyboard-double-arrow-left" />
                        </IconButton>
                        <div className="label">
                            {rowViewControl?.row?.id}
                        </div>
                    </div>

                    &lt;ViewComponent&gt;&lt;/ViewComponent&gt; hier rein
                    
                    <JSONView target={rowViewControl.row} title={'AGGrid Row'}>
                    </JSONView>

                </div>

            </div>






            {/* veraltet */}
            {/* {renderUploadDialog()} */}
            {/* <ExcelExport
                open={exportDialogOpen}
                onClose={closeExportDialog}
                api={gridRef?.current?.api}
                columnApi={gridRef?.current?.columnApi}
                columnDefs={columnDefs}
            /> */}
        </>
    )
}






