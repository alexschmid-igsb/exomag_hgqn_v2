import * as React from 'react'

import API from '../../api/fetchAPI'

import { Icon } from "@iconify/react"
import { MedicalRecord, Test } from '../../icons/custom'

import Box from '@mui/material/Box'

import TableIcon from '@mui/icons-material/TableView'
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving'
import ScienceIcon from '@mui/icons-material/Science'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'

import HomeIcon from '@mui/icons-material/HomeRounded'
import FolderIcon from '@mui/icons-material/Folder'
import GridsIcon from '@mui/icons-material/AutoAwesomeMotion'
import GridIcon from '@mui/icons-material/Article'

import PopoverMenu from '../../components/PopoverMenu'
import RouterButton from '../../components/RouterButton'

import GridConstants from '../../grid-constants'

import './MainMenu.scss'



export default function MainMenu() {








    /*

    // ALT: Die ursprüngliche Idee ist, die metadaten von allen vorhandenen Grids von der API zu holen und dann
    // das submenüs für die grids dynamisch zu generieren.
    // Das ist aber nur für Instanzen nötig, bei denen viele verschieden Grids dynamisch generiert und verwaltet
    // werden. Für ExomAG und HGQN reicht es, wenn die beiden benötigten Grids per ID verlinkt werden (und das
    // auch nicht in einem submenü, sondern auf top level menü ebene).

    const [gridsSubmenu, setGridsSubmenu] = React.useState([])

    React.useEffect(() => {
        API.get('/api/grids/get').then((data) => {
            let submenu = []
            for(let group of data) {
                let groupEntry = group.name === 'root' ? null : {
                    key: group.id,
                    label: group.name,
                    icon: FolderIcon,
                    items: []
                }
                for(let grid of group.grids) {
                    let gridEntry = {
                        key: grid.id,
                        label: grid.name,
                        icon: GridIcon,
                        routerPath: `/grids/${grid.id}`,
                    }
                    if(groupEntry) {
                        groupEntry.items.push(gridEntry)
                    } else {
                        submenu.push(gridEntry)
                    }
                }
                if(groupEntry) {
                    submenu.push(groupEntry)
                }
            }
            setGridsSubmenu(submenu)
        })
    }, [])

    const menu = [
        {
            key: "home",
            label: "Home",
            path: "/home",
            icon: <HomeIcon />
        },
        {
            key: "grids",
            label: "Data Grids",
            menu: gridsSubmenu,
            icon: <GridsIcon/>
        }
    ]

    */





    const menu = [
        {
            key: "home",
            label: "Home",
            path: "/home",
            icon: <HomeIcon />
        },
        {
            type: 'divider'
        },
        {
            key: 'cases',
            label: GridConstants.cases.label,
            path: GridConstants.cases.path,
            icon: <Icon icon={GridConstants.cases.icon}/>
            // icon: <Icon icon='healthicons:medical-records-negative'/>
            // icon: <Icon icon={ MedicalRecord }/>
        },
        {
            key: 'variants',
            label: GridConstants.variants.label,
            path: GridConstants.variants.path,
            icon: <Icon icon={GridConstants.variants.icon}/>
        },
        {
            type: 'divider'
        },
        {
            key: 'import',
            label: 'Data Import',
            path: '/imports',
            icon: <Icon icon='bi:database-up'/>
        }
    ]






    return (
        <Box className="menu main-menu" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            { menu.map( entry => 
                entry.type === 'divider' ? 
                    <div className="divider"/>
                :
                    entry.menu ? 
                        <PopoverMenu
                            useHover={false}
                            buttonClass="menu-button main-menu-button"
                            menuClass="main-menu-submenu-list"
                            buttonKey={entry.key}
                            buttonLabel={entry.label}
                            buttonIcon={entry.icon}
                            popoverId="main-menu-submenu-grid"
                            popoverClass="main-menu-submenu"
                            paperClass="main-menu-submenu-paper"
                            items={entry.menu}
                        />
                    :
                        <RouterButton
                            className="menu-button main-menu-button"
                            uniqueKey={entry.key}
                            to={entry.path ? entry.path : "/home"}
                            icon={entry.icon}
                        >
                            { entry.label }
                        </RouterButton>
            )}
        </Box>
    )
}

