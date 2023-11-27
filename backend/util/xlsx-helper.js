const xlsx = require('xlsx')
const fs = require('fs')

const BackendError = require('../util/BackendError')

// const json = require('json')

// API docs
// https://docs.sheetjs.com/#interface

exports.getSheetDimensions = sheet => {
    let result = {
        rows: 0,
        cols: 0
    }
    for(let key of Object.keys(sheet)) {
        let cellIndex = xlsx.utils.decode_cell(key)
        if(cellIndex.r+1 > result.rows) {
            result.rows = cellIndex.r+1
        }
        if(cellIndex.c+1 > result.cols) {
            result.cols = cellIndex.c+1
        }
    }
    return result
}








function parseRows(workbook, sheetName, headerColumnIndex) {

    // get sheet
    var sheet = workbook.Sheets[sheetName]
    if(typeof sheet === 'undefined' || sheet == null) {
        throw new Error(`Could not find sheet '${sheetName}'.`)
    }

    // get sheet dimensions
    var dimensions = exports.getSheetDimensions(sheet)

    // parse sheet header
    var columns = {}
    for(let j=0; j<dimensions.cols; j++) {
        let cellIndex = xlsx.utils.encode_cell({r:headerColumnIndex-1,c:j})
        let cell = sheet[cellIndex]
        if(typeof cell === 'undefined' || cell == null) {
            console.log(`WARNING: Header cell '${cellIndex}' is empty. Values in this column will not be parsed.`)
            continue
        }
        if(cell.t !== 's') {
            console.log(`WARNING: Header cell '${cellIndex}' does not have 'string' format. Values in this column will not be parsed.`)
            continue
        }
        let columnName = cell.v
        if(typeof columnName === 'undefined' || columnName == null || columnName.trim().length <= 0) {
            console.log(`WARNING: Header cell '${cellIndex}' is empty. Values in this column will not be parsed.`)
            continue
        }
        columns[j] = columnName
    }

    // create result
    var result = {
        columnNames: Object.values(columns),
        rows: new Array(dimensions.rows-headerColumnIndex).fill(null).map(()=>({}))
    }

    // read cells
    for(let key of Object.keys(sheet)) {
        let cellIndex = xlsx.utils.decode_cell(key)
        if(cellIndex.r > headerColumnIndex-1 && cellIndex.r < dimensions.rows && cellIndex.c >= 0 && cellIndex.c < dimensions.cols) {
            let cell = sheet[key]
            let row = result.rows[cellIndex.r-headerColumnIndex]
            let columnName = columns[cellIndex.c]
            if(typeof columnName === 'undefined' || columnName == null) {
                continue
            }

            // Per default werden die raw cell values (cell.v) übernommen. Im Fall von date/time Zellen wird von xlsx ein Date
            // Objekt erzeugt (aber nur wenn cellNF und cellDates true sind). Zusätzlich wird der Format String gespeichert.
            // Ob es sich um date oder time handelt, muss dann auf consumer seite im context der column entschieden werden.
            // WICHTIG: Aus dem date objekt muss korrekt die local timezone berücksichtigt werden um das ursprüngliche datum
            // bzw zeit zu bekommen.

            row[columnName] = {
                type: cell.t
            }

            switch(cell.t) {
                case 'd':
                    row[columnName].format = cell.z         // Der number format string der zelle. Der könnte zur weiteren Verarbeitung hilfreich sein (z.b. für das verwendete Zeit-/Datumsformat)
                case 's':
                case 'n':
                case 'b':
                    row[columnName].value = cell.v
                    break
                case 'z':
                    // laut docs: blank stub cell that is ignored by data processing utilities
                    break
                case 'e':
                    console.log(`WARNING: Cell ${key} has an error. The cell value will not be imported.`)
                    break
                default: 
                    throw new Error(`Found unsupported formating '${cell.t}' in cell '${key}'`)
            }
        }
    }

    return result
}




exports.parseRowsFromFile = (filename, sheetName, headerColumnIndex) => {

    // load workbook
    var workbook = xlsx.readFileSync(
        filename,
        {
            cellDates: true,                // WICHTIG: dates weren als Date Objekte und format flag 'd' geladen (anstelle von 'n')
            cellNF: true,                   // WICHTIG: Ließt den der formatstring, mit dem die text darstellung von date/time zellen generiert wird
        }       
    )

    return parseRows(workbook, sheetName, headerColumnIndex)
}




exports.parseRowsFromBuffer = (buffer, sheetName, headerColumnIndex) => {

    let workbook = null
    try {
        workbook = xlsx.read(
            buffer,
            {
                cellDates: true,                // WICHTIG: dates weren als Date Objekte und format flag 'd' geladen (anstelle von 'n')
                cellNF: true,                   // WICHTIG: Ließt den der formatstring, mit dem die text darstellung von date/time zellen generiert wird
            }       
        )
    } catch(err) {
        throw new BackendError("Internal Error: Could not create workbook from buffer",500,err)
    }

    return parseRows(workbook, sheetName, headerColumnIndex)
}






// very basic to excel export
exports.writeToExcel = (path, sheetname, columns, data) => {

    // console.log(columns)
    // console.log(data)

    const workbook = xlsx.utils.book_new()
    workbook.SheetNames.push(sheetname)

    const out = []

    const header = []
    for(let column of columns) {
        header.push(column.label)
    }
    out.push(header)

    for(let row of data) {
        let excelRow = []
        for(let column of columns) {
            let value = row[column.id]
            if(value != null && value.length > 0) {
                excelRow.push(value)
            } else {
                excelRow.push(null)
            }
        }
        console.log(excelRow)
        out.push(excelRow)
    }

    const worksheet = xlsx.utils.aoa_to_sheet(out)
    
    workbook.Sheets[sheetname] = worksheet

    xlsx.writeFile(workbook, path)
}

