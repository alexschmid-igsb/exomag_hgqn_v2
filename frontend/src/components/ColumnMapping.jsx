    import React from 'react'

    import lodash from 'lodash'

    import { AgGridReact } from 'ag-grid-react'

    import 'ag-grid-community/dist/styles/ag-grid.css'
    import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

    import Checkbox from '@mui/material/Checkbox'
    import FormControl from '@mui/material/FormControl'
    import Select from '@mui/material/Select'
    import MenuItem from '@mui/material/MenuItem'

    import IconButton from '@mui/material/IconButton'
    import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

    import { unstable_composeClasses } from '@mui/material'
    import { BaseGridSerializingSession } from 'ag-grid-community'

    import Button from '@mui/material/Button';
    import Dialog from '@mui/material/Dialog';
    import DialogActions from '@mui/material/DialogActions';
    import DialogContent from '@mui/material/DialogContent';
    import DialogContentText from '@mui/material/DialogContentText';
    import DialogTitle from '@mui/material/DialogTitle';

    import './ColumnMapping.scss'
    
    const UpdateModeHeader = (props) => {
        const [dialogOpen, setDialogOpen] = React.useState(false)

        const handleClickOpen = () => {
            setDialogOpen(true)
        }

        const handleClose = () => {
            setDialogOpen(false)
        }
      
        return (
            <>
                <span>Update Mode</span>
                <IconButton
                    className="inline-button"
                    size="small"
                    style={{
                        color: '#1976d2',
                        marginLeft: '4px',
                        borderRadius: '5px',
                        padding: '2px'
                    }}
                    onClick={handleClickOpen}
                >
                    <IconifyIcon icon="fluent:question-circle-12-filled" />
                </IconButton>
                <Dialog
                    className="update-mode-info-dialog"
                    open={dialogOpen}
                    onClose={handleClose}
                >
                    <DialogTitle>Update Mode</DialogTitle>
                    <DialogContent>
                        <div className="row">
                            <div className="mode"><b>KEEP</b> (default)</div>
                            <div className="description">In update mode <b>KEEP</b>, an <b>empty cell</b> in the uploaded excel file will <b>keep</b> its corresponding target cell value <b>unchanged</b>.<br/>A non-empty cell in the uploaded excel will overwrite its corresponding target cell (only if the upload is activated for this particular column).</div>
                        </div>
                        <div className="row">
                            <div className="mode"><b>DELETE</b></div>
                            <div className="description">In update mode <b>DELETE</b>, an <b>empty cell</b> in the uploaded excel file will <b>cause</b> its corresponding target cell value <b>to be deleted</b> (only if the upload is activated for the particular column).<br/><b style={{color: 'red'}}>Please use this mode with caution. An inconsiderate use might result in unwanted deletions of large amounts of cell values.</b></div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button size="small" onClick={handleClose}>Confirm</Button>
                    </DialogActions>
                </Dialog>
            </>
        )
    }


    const ArrowRenderer = (props) => {
        return (
            // <IconifyIcon icon="fa-solid:arrow-right"/>
            <IconifyIcon icon="ph:arrow-fat-lines-right-duotone"/>
        )
    }

    const ToggleCellRenderer = (props) => {
        /*
        React.useEffect(() => {
            // props.refreshCell()
            console.log("PROPS CHANGE toggle")
            console.log(props.rowIndex, props.data.id)
            console.log(props.data)
        }, [props])
        */
        const handleChange = (event) => {
            props.context.toggleActivated(props.rowIndex, event.target.checked)
        }
        return (
            <>
            {props.color}
            <Checkbox
                size="small"
                disabled={props.data.targetColumn.is_key || props.disabled}
                checked={props.data.activated}
                onChange={handleChange}
            />
            </>
        )
    }

    const SourceColumnRenderer = (props) => {
        /*
        React.useEffect(() => {
            // props.refreshCell()
            console.log("PROPS CHANGE select")
            console.log(props.rowIndex, props.data.id)
            console.log(props.data)
        }, [props])
        */
        const handleChange = (event) => {
            props.context.changeSourceColumn(props.rowIndex,event.target.value)
            // console.log(props)
            // props.refreshCell()
        }
        return (
            <FormControl
                disabled={!props.data.activated || props.disabled}
                size="small"
                variant="filled"
            >
                <Select
                    value={props.data.sourceColumn}
                    onChange={handleChange}
                >
                    { props.context.sourceColumns.map( sourceColumn =>
                        <MenuItem
                            key={sourceColumn.name}
                            disabled={sourceColumn.disabled || props.disabled}
                            value={sourceColumn.name}
                        >
                            {sourceColumn.name == '' ? <span>&nbsp;</span> : sourceColumn.name}
                        </MenuItem>
                    )}
                </Select>
            </FormControl>
        )
    }




    const UpdateModeRenderer = (props) => {
        const handleChange = (event) => {
            props.context.changeUpdateMode(props.rowIndex,event.target.value)
            // console.log(props)
            // props.refreshCell()
        }
        return (

            // <FormControl
            //     disabled={!props.data.activated}
            //     size="small"
            //     variant="filled"
            // >
            //     <Select
            //         value={props.data.updateMode}
            //         onChange={handleChange}
            //     >
            //         { props.context.test.map( entry =>
            //             <MenuItem
            //                 key={entry.name}
            //                 value={entry.name}
            //             >
            //                 {entry.name == '' ? <span>&nbsp;</span> : entry.name}
            //             </MenuItem>
            //         )}
            //     </Select>
            // </FormControl>
            <FormControl
                disabled={!props.data.activated || props.disabled}
                size="small"
                variant="filled"
                style={{width: '100%', maxWidth: '100%'}}
            >
                <Select value={props.data.updateMode} onChange={handleChange}>
                    {/* <MenuItem value={''}><span>&nbsp;</span></MenuItem> */}
                    <MenuItem value={'KEEP'}>KEEP</MenuItem>
                    <MenuItem value={'DELETE'}>DELETE</MenuItem>
                </Select>
            </FormControl>
        )
    }







    export default function ColumnMapping({
        disabled,
        mappingData,
        setMappingData,
        isValid,
        setIsValid,
        targetFields,
        sourceColumnNames
    }) {

        const gridRef = React.useRef()

        const columnDefs = [
            {
                width: 28,
                suppressSizeToFit: true,
                cellClass: 'toggle',
                headerClass: 'toggle',
                colId: 'activated',
                filter: false,
                resizable: false,
                cellRenderer: ToggleCellRenderer,
                cellRendererParams: { disabled: disabled }
            },
            {
                colId: 'excel_source_column',
                cellClass: 'source-column',
                headerName: 'Source Column (Excel File)',
                filter: false,
                resizable: false,
                cellRenderer: SourceColumnRenderer,
                cellRendererParams: { disabled: disabled }
            },
            {
                width: 28,
                suppressSizeToFit: true,                
                colId: 'arrow',
                cellClass: 'arrow',
                headerClass: 'arrow',
                filter: false,
                resizable: false,
                cellRenderer: ArrowRenderer,
                cellRendererParams: { disabled: disabled }
            },
            {
                colId: 'grid_target_column',
                cellClass: 'target-column',
                headerName: 'Target Field (Database)',
                filter: false,
                resizable: false,
                valueGetter: params => params.data.targetColumn.label,
            },
            {
                width: 120,
                suppressSizeToFit: true,                
                colId: 'update_mode',
                cellClass: 'update_mode',
                headerName: 'Update Mode',
                filter: false,
                resizable: false,
                cellRenderer: UpdateModeRenderer,
                cellRendererParams: { disabled: disabled },
                headerComponent: UpdateModeHeader
            }
        ]

        const defaultColDef = React.useMemo(() => ({
            sortable: false
        }))

        React.useEffect(() => {
            buildMappingData()
            // gridRef.current.api.sizeColumnsToFit()        
        }, [targetFields, sourceColumnNames])

        React.useEffect(() => {
            gridRef?.current?.api?.refreshCells()
        }, [disabled])



        /*
            Excel Column Names
            müssen zugeordnet werden können zu import pfaden

            Das problem ist, dass die ganzen variant felder gar nicht im layout existieren.

            Beim eigentlichen import braucht man:
              1. die exel felder, in denen die werte für gDNA und cDNA stehen
              2. diese werden dann in eine variante umgesetzt und der user sieht dann
                 in der feedback tabelle:
                 user defined cDNA und gDNA     UND dann die variant spalten, die daraus generieirt wurde und nach variants gehen
                 Wenn cDNA oder gDNA fehlerhaft sind, dann werden die fehler (und korrektur möglichkeiten) in den beiden
                 user defined feldern angezeigt, die variant felder sind READ ONLY

            
            Man braucht zusätzliche targets die für die gDNA und cDNA


            Das auto mapping soll immer über die Labels passieren
            Ein label im grid soll dann so auch im Excel angelegt werden, um das zu mappen

            man sollte aufjedenfall 

            {
                id: 
                target: {
                    label: <DAS LABEL WIE IM GRID>
                    path: <HIER SOLL DER PATH HIN WIE IN DEN TARGET DATEN>

                }

                updateMode: <WIRD ÜBER USER INTERFACE GESETZT>,
                sourceColumn:  <WIRD ÜBER USER INTERFACE GESETZT>,
            }


            
            
        */
        const buildMappingData = (reset = false) => {

            // TODO: um die descriptions holen zu können, müssen noch die korrekten ids berechnet werden

            if(targetFields == null || sourceColumnNames == null) {
                return
            }

            // console.log(targetFields)
            // console.log(sourceColumnNames)

            let newMappingData = []

            const layout = targetFields.layout.description
            //console.log(layout)

            for(let group of layout) {

                if(lodash.isArray(group.fields) === false) {
                    continue
                }

                for(let field of group.fields) {

                    if(field.importTarget !== true) {
                        continue
                    }

                    let targetPath = null
                    if(group.type.id === 'primary') {
                        targetPath = field.path
                    } else if(group.type.id === 'nested') {
                        targetPath = group.type.root + '.' + field.path
                    }

                    let entry = {
                        id: field.id,
                        activated: field.importMappingRequired === true ? true : false,
                        sourceColumn: '',
                        targetColumn: {
                            label: field.label,
                            path: targetPath,
                            is_key: field.importMappingRequired === true ? true : false,
                        },
                        updateMode: 'KEEP'
                    }

                    if(reset === false) {
                        for(let oldEntry of mappingData) {
                            if(oldEntry?.id === entry?.id) {
                                entry.activated = oldEntry.activated
                                entry.sourceColumn = oldEntry.sourceColumn
                                entry.updateMode = oldEntry.updateMode
                            }
                        }
                    }

                    newMappingData.push(entry)
                }
            }

            // console.log("SOURCE COLUMNS")
            // console.log(sourceColumnNames)

            // console.log("TARGET LABELS")
            // console.log(newMappingData.map(item => item.targetColumn.label))
            
            setMappingData(newMappingData)
        }


        

        const gridSizeChanged = () => {
            gridRef.current.api.sizeColumnsToFit()
        }

        const toggleActivated = (rowIndex,state) => {
            // console.log("toggleActivated: " + rowIndex + " " + state)
            setMappingData([
                ...mappingData.slice(0,rowIndex),
                {
                    id: mappingData[rowIndex].id,
                    activated: state,
                    // sourceColumn: mappingData[rowIndex].sourceColumn,
                    sourceColumn: '',
                    targetColumn: mappingData[rowIndex].targetColumn,
                    updateMode: 'KEEP' /* mappingData[rowIndex].updateMode */
                },
                ...mappingData.slice(rowIndex+1)
            ])
            setTimeout(() => gridRef.current.api.refreshCells(), 1000)
            
        }



        // const orig = ['eins', 'zwei', 'drei', 'vier', 'fünf']

        const sourceColumns = React.useMemo( () => {
            if(sourceColumnNames == null || mappingData == null) {
                return []
            }
            let alreadyInUse = mappingData.reduce( (result,entry) =>  {
                if(typeof entry.sourceColumn !== 'unfedined' && entry.sourceColumn !== null) {
                    result.push(entry.sourceColumn)
                }
                return result
            }, [])
            let ret = [{name: '', disabled: false}]
            for(let sourceColumnName of sourceColumnNames) {
                let entry = {
                    name: sourceColumnName,
                    disabled: false
                }
                if(alreadyInUse.includes(sourceColumnName)) {
                    entry.disabled = true
                }
                ret.push(entry)
            }
            // console.log(ret)
            return ret
        }, [mappingData,sourceColumnNames]);




        const validationErrors = React.useMemo( () => {
            let errors = []
            if(lodash.isArray(mappingData)) {
                for(let entry of mappingData) {
                    if(entry.activated && (entry.sourceColumn == null || entry.sourceColumn.trim().length <= 0)) {
                        errors.push(entry.targetColumn.label)
                    }
                }
                setIsValid(errors.length === 0)
            }
            return errors
        }, [mappingData,sourceColumnNames]);





        const changeSourceColumn = (rowIndex,value) => {
            // console.log("CHANGE SOURCE COLUMN")
            // console.log(rowIndex)
            // console.log(value)
            setMappingData([
                ...mappingData.slice(0,rowIndex),
                {
                    id: mappingData[rowIndex].id,
                    activated: mappingData[rowIndex].activated,
                    sourceColumn: value,
                    targetColumn: mappingData[rowIndex].targetColumn,
                    updateMode: mappingData[rowIndex].updateMode
                },
                ...mappingData.slice(rowIndex+1)
            ])
            setTimeout(() => gridRef.current.api.refreshCells(), 1000)
        }



        const changeUpdateMode = (rowIndex,value) => {
            // console.log("CHANGE UPDATE COLUMN")
            // console.log(rowIndex)
            // console.log(value)
            setMappingData([
                ...mappingData.slice(0,rowIndex),
                {
                    id: mappingData[rowIndex].id,
                    activated: mappingData[rowIndex].activated,
                    sourceColumn: mappingData[rowIndex].sourceColumn,
                    targetColumn: mappingData[rowIndex].targetColumn,
                    updateMode: value
                },
                ...mappingData.slice(rowIndex+1)
            ])
            // setTimeout(() => gridRef.current.api.refreshCells(), 1000)
        }




        const clearMappings = event => {
            buildMappingData(true)
        }





        const applyAutoMapping = event => {

            // console.log("START AUTO MAPPING")

            if(targetFields == null || sourceColumnNames == null) {
                return
            }

            let newMappingData = []
            let availableSourceColumnNames = new Set(sourceColumnNames)

            const layout = targetFields.layout.description
            for(let group of layout) {

                if(lodash.isArray(group.fields) === false) {
                    continue
                }

                for(let field of group.fields) {
                    
                    if(field.importTarget !== true) {
                        continue
                    }

                    let targetPath = null
                    if(group.type.id === 'primary') {
                        targetPath = field.path
                    } else if(group.type.id === 'nested') {
                        targetPath = group.type.root + '.' + field.path
                    }

                    let entry = {
                        id: field.id,
                        activated: field.importMappingRequired === true ? true : false,
                        sourceColumn: '',
                        targetColumn: {
                            label: field.label,
                            path: targetPath,
                            is_key: field.importMappingRequired === true ? true : false,
                        },
                        updateMode: 'KEEP'
                    }

                    newMappingData.push(entry)

                    let targetColumnName = entry.targetColumn.label
                    let mapped = false
    
                    for(const sourceColumnName of availableSourceColumnNames) {
                        if(targetColumnName === sourceColumnName) {
                            // console.log("FOUND EXACT MATCH: " + targetColumnName + " --> " + sourceColumnName)
                            entry.sourceColumn = sourceColumnName
                            entry.activated = true
                            availableSourceColumnNames.delete(sourceColumnName)
                            mapped = true
                            break
                        }
                    }
    
                    if(mapped) {
                        continue
                    }
    
                    for(const sourceColumnName of availableSourceColumnNames) {
                        if(targetColumnName.trim().localeCompare(sourceColumnName.trim(), 'de', { sensitivity: 'base' }) === 0) {
                            // console.log("FOUND OTHER MATCH: " + targetColumnName + " --> " + sourceColumnName)
                            entry.sourceColumn = sourceColumnName
                            entry.activated = true
                            availableSourceColumnNames.delete(sourceColumnName)
                            mapped = true
                            break
                        }
                    }
                }
            }
            
            setMappingData(newMappingData)
        }





        const getRowId = React.useCallback(params => params.data.id, [])

        // const getRowClass = params => params.data.activated ? 'activated' : 'deactivated'

        const rowClassRules = {
            'activated': params => params.data.activated,
            'deactivated': params => !params.data.activated,
        }



        const renderRows = () => { return(

            <div className={`column-mapping ${disabled ? 'disabled' : 'enabled'}`}>

                <div className="buttons">
                    <Button
                        disabled={disabled}
                        size="small"
                        startIcon={<IconifyIcon icon="carbon:automatic"/>}
                        onClick={applyAutoMapping}
                    >
                        Apply Auto Mapping
                    </Button>
                    <Button
                        disabled={disabled}
                        size="small"
                        startIcon={<IconifyIcon icon="tabler:trash-x"/>}
                        onClick={clearMappings}
                    >
                        Clear Mappings
                    </Button>
                </div>

                <div className="grid-container ag-theme-alpine ag-theme-alpine-modified" style={{display: 'flex', flexFlow: 'column', alignItems: 'stretch', justifyContent: 'stretch'}}>
                    <AgGridReact

                        domLayout='autoHeight'

                        rowHeight={37}
                        headerHeight={37}

                        ref={gridRef}

                        columnDefs={columnDefs}             // Column Defs for Columns
                        defaultColDef={defaultColDef}       // Default Column Properties

                        rowData={mappingData}

                        animateRows={false}
                        suppressRowClickSelection={true}

                        // rowSelection='multiple'

                        // onCellClicked={cellClickedListener}

                        onGridSizeChanged={gridSizeChanged}
                        // getRowId={getRowId}

                        suppressCellSelection={true}

                        context={{
                            toggleActivated: toggleActivated,
                            changeSourceColumn: changeSourceColumn,
                            changeUpdateMode: changeUpdateMode,
                            sourceColumns: sourceColumns,
                            // test: test
                        }}

                        getRowId={getRowId}
                        // getRowClass={getRowClass}
                        rowClassRules={rowClassRules}

                    />
                </div>

                <div className={`validation-message ${isValid ? 'valid' : 'error'}`}>
                    { isValid ? 
                        <div className="message">
                            <div className="icon">
                                <IconifyIcon icon="ci:check-all"/>
                            </div>
                            <div className="text">
                                <span><b>The column mapping configuration is valid</b></span>
                            </div>
                        </div>
                    :
                        <div className="message">
                            <div className="icon">
                                <IconifyIcon icon="clarity:error-solid"/>
                            </div>
                            <div className="text">
                                <span><b>The column mapping configuration is invalid.</b><br/><span style={{color: disabled?null:'#444'}}>Check the selected source column entries for the following target columns:
                                    { validationErrors.map(item => <>{item===validationErrors[0]?null:','}<b>&nbsp;{item}</b></>) }
                                    </span>
                                </span>
                            </div>
                        </div>
                    }
                </div>

            </div>

            )}




        return (
            renderRows()
        )
    }
