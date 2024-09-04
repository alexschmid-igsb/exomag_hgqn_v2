import React from 'react'
import { useParams, useNavigate } from "react-router-dom"

import lodash from 'lodash'
import API from '../api/fetchAPI'

import LargeSpinnerOverlay from '../components/util/LargeSpinnerOverlay'

import JSONView from '../components/util/JSONView'

import './VariantView.scss'






function VariantView(props) {

    const navigate = useNavigate()

    const variantId = React.useMemo(() => props?.row?.id, [props])

    React.useEffect(() => {
        loadVariantData()
    }, [variantId])


    const [variantData,setVariantData] = React.useState()
    const [casesData,setCasesData] = React.useState()

    const [isLoading, setIsLoading] = React.useState(true)


    function loadVariantData() {

        console.log("LOAD VARIANT DATA")
        console.log(props)
        console.log(variantId)

        if(variantId == null || lodash.isString(variantId) === false || variantId.length <= 0) {
            return
        }

        setIsLoading(true)

        console.log("CALL")

        API.get(`/api/variants/get/${variantId}`, { doNotThrowFor: [404] }).then(response => {

            // console.log(response)

            setVariantData(response.variant)
            setCasesData(response.cases)

            setIsLoading(false)

        }).catch(e => {
            console.error(`Could not load variant data for id '${variantId}'`)
            console.error(e)
            navigate('/notfound')
        })




        /*
        const path = '/api/grid/get/' + gridId
        */




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






    const renderVariant = () => 
        <>
            <JSONView target={variantData} />
            <JSONView target={casesData} />
        </>





    return(

        <div className="variant-view">
            { isLoading === true ?
                <LargeSpinnerOverlay label="loading..."/>
            : 
                renderVariant()
            }
        </div>

    )





}


export default VariantView


