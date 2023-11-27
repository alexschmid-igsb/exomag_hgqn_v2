import * as React from 'react'

import './LargeSpinnerOverlay.scss'

const Spinner = ({variant, label}) => {

    const [state, setState] = React.useState('initial')

    React.useEffect(() => {
        setTimeout(() => { setState('running') }, 50)
    }, [])


    const render = variant => {
        /*
        switch(variant) {
            
        }
        */

        return (
            <div className={`large-spinner-overlay ${state}`}>
                <div id="loader-wrapper">
                    <div id="loader" />
                    <div className="label">{ label }</div>
                </div>
            </div>
        )
    }



    return render(variant)
}

export default Spinner





