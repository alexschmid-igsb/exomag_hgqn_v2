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


const valueToCSS = value => {
    return value.replace(/[^A-Za-z0-9]/g, '');
    // return lodash.camelCase(value)
}


function ClassificationSummary({variantId, cases: _cases}) {

    // TODO: Pro Category gibt es columns, die nur per expand angezeigt werden können
    // Dazu einen kleinen button oben rechts in der Category
    // Bei Klick wird ein flag für die Category auf true gesetzt und alle hidden columns werden gerendert
    // So können die zusätzlichen Infos pro Category angezeigt werden

    const tableConfig = [
        {
            id: 'case',
            label: 'Case Identification',
            cols: [
                {
                    id: 'sequencingLab',
                    label: 'Sequencing Lab',
                    path: 'sequencingLab.shortName'
                }, {
                    id: 'internalCaseId',
                    label: 'Internal Case ID',
                    path: 'internalCaseId'
                }
            ],
        }, {
            id: 'clinicalInterpretation',
            label: 'Clinical Interpretation',
            cols: [{
                id: 'acmgClass',
                label: 'ACMG Class',
                path: 'variant.acmg.class'
            }, {
                id: 'acmgCriteria',
                label: 'ACMG Criteria',
                path: 'variant.acmg.criteria'
            }],
        }
    ]

    const cases = React.useMemo( () => lodash.isArray(_cases) ? _cases.map( item => {
        if(lodash.isArray(item.variants)) {
            for(let variant of item.variants) {
                if(variant?.variant?.reference === variantId) {
                    item.variant = variant
                    break
                }
            }
        }
        return item
    }) : null, [_cases])


    const renderValue = (item,col) => {

        let value = lodash.get(item,col.path)
        let ret = <div className='value'></div>

        console.log(JSON.stringify(value))

        if(lodash.isArray(value)) {
            ret = <div className='value'>{value.map(item => <div className={`item VALUE-${valueToCSS(item)}`}>{item}</div>)}</div>
        } else if(lodash.isObject(value)) {
            ret = <div className='value'>{JSON.stringify(value)}</div>
        } else {
            ret = <div className={`value VALUE-${valueToCSS(value)}`}>{value}</div>
        }

        return ret
    }

    return (

        <div className="classification-table box">
            { lodash.isArray(cases) && cases.length > 0 ?
                lodash.isArray(tableConfig) ? tableConfig.map( category =>
                    <div className={`category ${category.id}`}>
                        <div className="label">{category.label}</div>
                        <div className="columns">
                            { lodash.isArray(category.cols) ? category.cols.map( col =>
                                <div className={`column ${col.id}`}>
                                    <div className={`header ${col.id}`}>{col.label}</div>
                                    { cases.map( item =>
                                        <div className={`cell ${col.id}`}>
                                            {renderValue(item,col)}
                                        </div>
                                    )}
                                </div>
                            ) : null }
                        </div>
                    </div>
                ) : null
            :
                <div className="empty">
                    no cases found
                </div>
            }


            






        </div>
    )

}





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

            </div>


            <div className="section">
                <div className="section-title">Klassifikation</div>
                <ClassificationSummary variantId={variantId} cases={casesData}/>
            </div>

            {/* <JSONView target={variantData} />
            <JSONView target={casesData} /> */}
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


