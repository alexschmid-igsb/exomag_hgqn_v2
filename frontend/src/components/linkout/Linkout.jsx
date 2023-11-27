import franklin from './franklin.svg'
import gnomad from './gnomad.svg'
import varsome from './varsome.svg'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './Linkout.scss'

const Icon = () => <IconifyIcon className="icon" icon="akar-icons:link-out"/>

export default function FranklinLogo({flavor}) {

    const render = () => {
        switch (flavor) {
            case 'franklin':
                return (
                    <div className="linkout franklin">
                        <img className="logo" src={franklin} />
                        <Icon/>
                    </div>
                )
                break;
            case 'gnomad':
                return (
                    <div className="linkout gnomad">
                        <img className="logo" src={gnomad} />
                        <Icon/>
                    </div>
                )
                break;
            case 'varsome':
                return (
                    <div className="linkout varsome">
                        <img className="logo" src={varsome} />
                        <Icon/>
                    </div>
                )
                break;
            default:
                return (
                    <div className="linkout">
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













