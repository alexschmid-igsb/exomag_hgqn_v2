import './PageLogo.scss'

import logo from '../../logo.svg'

export default function PageLogo() {
    return(
        <div className="page-logo">
            <div className="logo-container">
                <img className="logo" src={logo} />
            </div>
            {/* <div className="img"></div> */}
            {/* <span className="text">&ndash;&nbsp;Entwicklerversion&nbsp;&ndash;</span> */}
            <span className="text">v2.0 Testversion</span>
        </div>
    )
}
