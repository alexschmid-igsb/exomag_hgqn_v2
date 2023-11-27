





// zuerst sortierung nach länge
/*
export const CellValueComparatorString = (valueA, valueB, nodeA, nodeB, isDescending) => {
    if(valueA == undefined) {
        return 1
    } else {
        if(valueB == undefined) {
            return -1
        } else {
            const lenA = valueA.length
            const lenB = valueB.length
            if(lenA > lenB) {
                return 1
            } else if(lenA < lenB) {
                return -1
            } else {
                return valueA.localeCompare(valueB)
            }
        }
    }
}
*/




// null und undefined values nach hinten, dann strikt nach alphabetischer reihenfolge
export const CellValueComparatorString = (valueA, valueB, nodeA, nodeB, isDescending) => {
    if(valueA == undefined) {
        return 1
    }
    if(valueB == undefined) {
        return -1
    }
    return valueA.localeCompare(valueB)
}




export const CellValueComparatorInteger = (valueA, valueB, nodeA, nodeB, isDescending) => {
    if(valueA == undefined) {
        return 1
    }
    if(valueB == undefined) {
        return -1
    }
    const intA = parseInt(valueA)
    if(isNaN(intA)) {
        return 1
    }
    const intB = parseInt(valueB)
    if(isNaN(intB)) {
        return -1
    }
    return intA > intB ? 1 : intA < intB ? -1 : 0
}


export const CellValueComparatorDecimal = (valueA, valueB, nodeA, nodeB, isDescending) => {
    if(valueA == undefined) {
        return 1
    }
    if(valueB == undefined) {
        return -1
    }
    const floatA = parseFloat(valueA)
    if(isNaN(floatA)) {
        return 1
    }
    const floatB = parseFloat(valueB)
    if(isNaN(floatB)) {
        return -1
    }
    return floatA > floatB ? 1 : floatA < floatB ? -1 : 0
}










