import Button from '@mui/material/Button';

import { Link } from "react-router-dom"

import './RouterButton.scss'

export default function RouterButton({className, uniqueKey, children, to, icon}) {
    return (
        <Button
            className={className}
            key={uniqueKey}
            component={Link}
            to={to}
            startIcon={icon}
        >
            { children }
        </Button>
    )
}
