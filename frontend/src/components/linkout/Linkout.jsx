import React from 'react'

import franklin from './franklin.svg'
import gnomad from './gnomad.svg'
import varsome from './varsome.svg'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './Linkout.scss'

const LinkIcon = () => <IconifyIcon className="icon" icon="pajamas:external-link"/>

const ErrorIcon = () => <IconifyIcon className="icon error" icon="solar:minus-circle-bold-duotone"/>
// const ErrorIcon = () => <IconifyIcon className="icon error" icon="tabler:face-id-error"/>
// const ErrorIcon = () => <IconifyIcon className="icon error" icon="material-symbols:error-med-outline-rounded"/>

    /*
        Beispiele für funktionierende gnomAD Links bei komplexeren Varianten:
        
        NC_000004.12:g.3074879_3074935dup
        https://gnomad.broadinstitute.org/variant/4-3074876-C-CCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAG?dataset=gnomad_r4

        NC_000023.11:g.130149493_130149498del
        https://gnomad.broadinstitute.org/variant/X-130149484-TTTTCTG-T?dataset=gnomad_r4
npm run
        NC_000001.11:g.94098886_94098898del
        https://gnomad.broadinstitute.org/variant/1-94098883-AGCGCACCGTCTTT-A?dataset=gnomad_r4
    */

export const Gnomad = props => {

    const GRCh38 = React.useMemo(() => props.value != null ? props.value : {}, [props])

    const renderLink = url => 
        <div className="link-container">
            <a
                className="linkout gnomad"
                href={url}
                target="_blank"
            >
                <img className="logo" src={gnomad} />
                <LinkIcon/>
            </a>
        </div>


    const render = () => {

        if(GRCh38.ref != null && GRCh38.ref.length === 1 && GRCh38.alt != null && GRCh38.alt.length === 1) {

            // SNV
            let url = `https://gnomad.broadinstitute.org/variant/${GRCh38.chr}-${GRCh38.pos}-${GRCh38.ref}-${GRCh38.alt}?dataset=gnomad_r4`
            return renderLink(url)

        } else if(GRCh38.ref != null && GRCh38.alt != null && (GRCh38.ref.length > 1 || GRCh38.alt.length > 1) ) {

            // komplexerer del, dup, ins, ... varianten
            // url wird geneauso gebaut
            let url = `https://gnomad.broadinstitute.org/variant/${GRCh38.chr}-${GRCh38.pos}-${GRCh38.ref}-${GRCh38.alt}?dataset=gnomad_r4`
            return renderLink(url)

            // if(GRCh38.gDNA.indexOf('delins') != -1 && (GRCh38.alt.length > 5 || GRCh38.ref.length > 5) ) {
            //     console.log(GRCh38.gDNA)
            //     console.log(url)
            // }

        } else {
            return (
                <div className="link-container">
                    <ErrorIcon/>
                </div>
            )
        }
    }

    return(
        render()
    )
}


export const Franklin = props => {
    
    const GRCh37 = React.useMemo(() => props.value != null ? props.value : {}, [props])

    const renderLink = url => 
        <div className="link-container">
            <a
                className="linkout franklin"
                href={url}
                target="_blank"
            >
                <img className="logo" src={franklin} />
                <LinkIcon/>
            </a>
        </div>

const render = () => {

    if(GRCh37.ref != null && GRCh37.ref.length === 1 && GRCh37.alt != null && GRCh37.alt.length === 1) {

        // SNV
        let url = `https://franklin.genoox.com/clinical-db/variant/snp/chr${GRCh37.chr}-${GRCh37.pos}-${GRCh37.ref}-${GRCh37.alt}`
        return renderLink(url)

    } else if(GRCh37.ref != null && GRCh37.alt != null && (GRCh37.ref.length > 1 || GRCh37.alt.length > 1) ) {

        // komplexerer del, dup, ins, ... varianten
        let url = `https://franklin.genoox.com/clinical-db/variant/snp/chr${GRCh37.chr}-${GRCh37.pos}-${GRCh37.ref}-${GRCh37.alt}`
        return renderLink(url)

    } else {
        return (
            <div className="link-container">
                <ErrorIcon/>
            </div>
        )
    }
}

    return(
        render()
    )
}


export const Varsome = props => {

    const GRCh38 = React.useMemo(() => props.value != null ? props.value : {}, [props])

    const renderLink = url => 
        <div className="link-container">
            <a
                className="linkout varsome"
                href={url}
                target="_blank"
            >
                <img className="logo" src={varsome} />
                <LinkIcon/>
            </a>
        </div>


    const render = () => {

        if(GRCh38.ref != null && GRCh38.ref.length === 1 && GRCh38.alt != null && GRCh38.alt.length === 1) {

            // SNV
            let url = `https://varsome.com/variant/hg38/${GRCh38.chr}-${GRCh38.pos}-${GRCh38.ref}-${GRCh38.alt}`
            return renderLink(url)

        } else if(GRCh38.ref != null && GRCh38.alt != null && (GRCh38.ref.length > 1 || GRCh38.alt.length > 1) ) {

            // komplexerer del, dup, ins, ... varianten
            // url wird geneauso gebaut
            let url = `https://varsome.com/variant/hg38/${GRCh38.chr}-${GRCh38.pos}-${GRCh38.ref}-${GRCh38.alt}`
            return renderLink(url)

            // if(GRCh38.gDNA.indexOf('delins') != -1 && (GRCh38.alt.length > 5 || GRCh38.ref.length > 5) ) {
            //     console.log(GRCh38.gDNA)
            //     console.log(url)
            // }

        } else {
            return (
                <div className="link-container">
                    <ErrorIcon/>
                </div>
            )
        }
    }

    return(
        render()
    )}



