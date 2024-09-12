import lodash from 'lodash'

import VariantGeneDetails from './VariantGeneDetails'
import DefaultPopover from '../components/DefaultPopover.jsx'

export default function VariantGenesRenderer(props) {

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