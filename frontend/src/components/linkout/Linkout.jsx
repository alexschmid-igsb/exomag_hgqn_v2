import React from 'react'

import franklin from './franklin.svg'
import gnomad from './gnomad.svg'
import varsome from './varsome.svg'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './Linkout.scss'

const LinkIcon = () => <IconifyIcon className="icon" icon="pajamas:external-link"/>

const ErrorIcon = () => <IconifyIcon className="icon error" icon="tabler:face-id-error"/>
// const ErrorIcon = () => <IconifyIcon className="icon error" icon="material-symbols:error-med-outline-rounded"/>

export const Gnomad = props => {

    const GRCh38 = React.useMemo(() => props.value != null ? props.value : {}, [props])

    const buildLink = url => 
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
        console.log(GRCh38)

        if(GRCh38.ref != null && GRCh38.ref.length === 1 && GRCh38.alt != null && GRCh38.alt.length === 1) {
            // SNV
            return buildLink(`https://gnomad.broadinstitute.org/variant/${GRCh38.chr}-${GRCh38.pos}-${GRCh38.ref}-${GRCh38.alt}?dataset=gnomad_r4`)
        } else {
            return (
                <div className="link-container">
                    <ErrorIcon/>
                </div>
            )
        }
    }

    return(render())
}


export const Franklin = props => {

    const urlFromGRCh38 = (GRCh38) => {
        return 'error'
    }

    return(
        <div className="link-container">
            <a
                className="linkout franklin"
                href={urlFromGRCh38(props.value)}
                target="_blank"
            >
                <img className="logo" src={franklin} />
                <LinkIcon/>
            </a>
        </div>
    )
}


export const Varsome = props => {

    const urlFromGRCh38 = (GRCh38) => {
        return 'error'
    }

    return(
        <div className="link-container">
            <a
                className="linkout varsome"
                href={urlFromGRCh38(props.value)}
                target="_blank"
            >
                <img className="logo" src={varsome} />
                <LinkIcon/>
            </a>
        </div>
    )
}




/*

export default function LinkOut(props) {

    const render = () => {
        switch (props.flavor) {
            case 'franklin':
                return (
                    <div className="linkout franklin">
                        {JSON.stringify(props.value)}
                        <img className="logo" src={franklin} />
                        <Icon/>
                    </div>
                )
                break;
            case 'gnomad':
                return (
                    <div className="linkout gnomad">
                        {JSON.stringify(props.value)}
                        <img className="logo" src={gnomad} />
                        <Icon/>
                    </div>
                )
                break;
            case 'varsome':
                return (
                    <div className="linkout varsome">
                        {JSON.stringify(props.value)}
                        <img className="logo" src={varsome} />
                        <Icon/>
                    </div>
                )
                break;
            default:
                return (
                    <div className="linkout">
                        {JSON.stringify(props.value)}
                        <span className="text">Link</span>
                        <Icon/>
                    </div>
                )
        }
    }

    return (
        render()
    )
}

*/


