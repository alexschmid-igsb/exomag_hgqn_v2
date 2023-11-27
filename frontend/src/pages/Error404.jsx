import { Link } from "react-router-dom"

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import './Error404.scss'

export default function Page1() {
    return (
        <div class="error-page-404">
            <h1 className="error">404</h1>
            <span className="message">The requested page could not be found.</span>
            <span className="return">
                <Link to="/home">
                    <IconifyIcon icon="ant-design:home-filled"/>&nbsp;home
                </Link>
            </span>
        </div>
    )
}


