import React from 'react'
import { useParams, useNavigate } from "react-router-dom"

import lodash from 'lodash'
import API from '../api/fetchAPI'

import LargeSpinnerOverlay from '../components/util/LargeSpinnerOverlay'

import JSONView from '../components/util/JSONView'

import {
    Franklin as FranklinLink,
    Gnomad as GnomadLink,
    Varsome as VarsomeLink
} from '../components/linkout/Linkout'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import VariantGenesRenderer from './VariantGenesRenderer'

import './VariantView.scss'






function VariantView(props) {

    const navigate = useNavigate()

    const variantId = React.useMemo(() => props?.row?.id, [props])

    React.useEffect(() => {
        loadVariantData()
    }, [variantId])


    const [variantData, setVariantData] = React.useState()
    const [casesData, setCasesData] = React.useState()

    const [isLoading, setIsLoading] = React.useState(true)


    function loadVariantData() {

        console.log("LOAD VARIANT DATA")
        console.log(props)
        console.log(variantId)

        if (variantId == null || lodash.isString(variantId) === false || variantId.length <= 0) {
            return
        }

        setIsLoading(true)

        console.log("CALL")

        API.get(`/api/variants/get/${variantId}`, { doNotThrowFor: [404] }).then(response => {

            setVariantData(response.variant)
            setCasesData(response.cases)
            setIsLoading(false)

        }).catch(e => {
            console.error(`Could not load variant data for id '${variantId}'`)
            console.error(e)
            navigate('/notfound')
        })
    }


    const renderVariant = () =>

        <>
            <div className="section-row">

                <div className="section">

                    <div className="section-title">Identifikation</div>

                    <div className="label-value-row">
                        <div className="label">Variant ID</div>
                        <div className="value">{variantId}</div>
                    </div>

                    <div className="label-value-row">
                        <div className="label">Genes</div>
                        <div className="value">
                            <VariantGenesRenderer value={variantData.genes}/>
                        </div>
                    </div>

                </div>

                <div className="section">

                    <div className="section-title">Positionen</div>

                    <div className="box">
                        <div className="box-title GRCh37">GRCh37</div>
                        <div className="label-value-row">
                            <div className="label">HGVS gDNA</div>
                            <div className="value">{variantData.GRCh37.gDNA}</div>
                        </div>
                        <div className="label-value-row">
                            <div className="label">Genomic Position</div>
                            <div className="value">
                                <span className="cell_value_genomic_position">
                                    <span className="build">{variantData.GRCh37.build}</span>
                                    <span className="separator"></span>
                                    <span className="chr">{variantData.GRCh37.chr}</span>
                                    <span className="separator"></span>
                                    <span className="pos">{variantData.GRCh37.pos}</span>
                                    <span className="separator"></span>
                                    <span className="ref">{variantData.GRCh37.ref}</span>
                                    <span className="separator"></span>
                                    <span className="alt">{variantData.GRCh37.alt}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="box">
                        <div className="box-title GRCh38">GRCh38</div>
                        <div className="label-value-row">
                            <div className="label">HGVS gDNA</div>
                            <div className="value">{variantData.GRCh38.gDNA}</div>
                        </div>
                        <div className="label-value-row">
                            <div className="label">Genomic Position</div>
                            <div className="value">
                                <span className="cell_value_genomic_position">
                                    <span className="build">{variantData.GRCh38.build}</span>
                                    <span className="separator"></span>
                                    <span className="chr">{variantData.GRCh38.chr}</span>
                                    <span className="separator"></span>
                                    <span className="pos">{variantData.GRCh38.pos}</span>
                                    <span className="separator"></span>
                                    <span className="ref">{variantData.GRCh38.ref}</span>
                                    <span className="separator"></span>
                                    <span className="alt">{variantData.GRCh38.alt}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="section">
                    <div className="section-title">Externe Links</div>
                    <div className="comment">
                        <IconifyIcon className="icon" icon="tabler:alert-square-rounded-filled" />
                        <div className="text">
                            Externe Links werden auf Basis der genomischen Position der Variante generiert. Es kann vorkommen, dass die verlinkte Variante in der externen Datenbank nicht vorhanden ist und der Link somit ins Leere führt.
                        </div>
                    </div>
                    <div className="links">
                        <FranklinLink value={variantData.GRCh37} />
                        <GnomadLink value={variantData.GRCh38} />
                        <VarsomeLink value={variantData.GRCh38} />
                    </div>
                </div>

                {/* <div className="section">
                    <div className="section-title">bla</div>
                </div> */}

            </div>


            <div className="section">
                <div className="section-title">Klassifikation</div>
            </div>

            <JSONView target={variantData} />
            <JSONView target={casesData} />
        </>





    return (

        <div className="variant-view">
            {isLoading === true ?
                <LargeSpinnerOverlay label="loading..." />
                :
                renderVariant()
            }
        </div>

    )





}


export default VariantView


