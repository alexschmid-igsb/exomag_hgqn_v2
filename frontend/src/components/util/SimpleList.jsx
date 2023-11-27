import * as React from 'react'

import _ from 'lodash'

import { useNavigate } from 'react-router-dom'

import Collapse from '@mui/material/Collapse'

import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import ExpandMore from '@mui/icons-material/KeyboardArrowRightRounded'
import ExpandLess from '@mui/icons-material/KeyboardArrowDownRounded'

import CircleIcon from '@mui/icons-material/Circle'

import generateKey from '../../util/generateKey'

import './SimpleList.scss'

export default function SimpleList({ className, items, onClick }) {

    const [_items, setItems] = React.useState([])
    const [_itemsByKey, setItemsByKey] = React.useState(new Map())

    const [openElement, setOpenElement] = React.useState(null)

    const navigate = useNavigate()

    // add random keys to items
    React.useEffect(() => {
        let cloned = _.cloneDeep(items)
        let map = new Map()

        for (let item of cloned) {
            item.key = generateKey(16)
            map.set(item.key,item)
            /*
            for (let subitem of (item.items ? item.items : [])) {
                subitem.key = generateKey(16)
            }
            */
        }
        setItems(cloned)
        setItemsByKey(map)
    }, [items])

    const handleEntryClick = (key) => (e) => {
        let item = _itemsByKey.get(key)
        if(item.items) {
            if (openElement === key) {
                setOpenElement(null)
            } else {
                setOpenElement(key)
            }
        } else {
            if(typeof item.action === 'function') {
                item.action()
            } else if(typeof item.routerPath === 'string') {
                navigate(item.routerPath)
                if(typeof onClick === 'function') onClick()
            }
        }
    }

    return (
        <>
            <List
                dense
                className={`component-simple-list ${className}`}
            >
                {_items.map(item =>
                    <>
                        <ListItemButton key={item.key} className={`list-entry ${openElement === item.key ? 'open' : null}`} onClick={handleEntryClick(item.key)}>
                            <ListItemIcon className="item-icon">
                                {item.icon ?
                                    <item.icon fontSize="small" className="icon" />
                                    :
                                    <CircleIcon fontSize="small" className="icon invisible" />
                                }
                            </ListItemIcon>
                            <ListItemText className="item-text" primary={item.label} />
                            { item.items ?
                                openElement === item.key ?
                                    <ExpandLess fontSize="small" className="submenu-toggle" />
                                    :
                                    <ExpandMore fontSize="small" className="submenu-toggle" />
                                :
                                <ExpandMore fontSize="small" className="submenu-toggle invisible" />
                            }
                        </ListItemButton>

                        { item.items ?
                            <Collapse className="collapse" in={openElement === item.key} timeout="auto" unmountOnExit>
                                <SimpleList items={item.items} onClick={onClick} />
                            </Collapse>
                            :
                            null
                        }
                    </>
                )}
            </List>
        </>
    )
}

