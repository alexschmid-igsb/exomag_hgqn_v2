import React from 'react'

import lodash from 'lodash'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { setToolbar } from '../../store/toolbar'
import { setBreadcrumbs } from '../../store/breadcrumbs'

import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"

import HomeIcon from '@mui/icons-material/HomeRounded'

import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'

import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import Grid from '@mui/material/Grid';

import './Visualizations.scss'

const categories = [
    {
        key: 'common',
        title: 'Common Visualizations',
        entries: [
            {
                title: 'Diagnostic Yield',
                description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                image: '',
                component: ''
            }
        ]
    },
    {
        key: 'others',
        title: 'Others',
        entries: [
        ]
    },
]

export default function Visualizations() {

    const theme = useTheme();

    const breadcrumbs = [
        {
            key: 'home',
            label: 'Home',
            path: '/home',
            icon: HomeIcon
        },
        {
            key: 'visualizations',
            label: 'Visualizations',
            path: '/visualizations',
            icon: () => <IconifyIcon icon='solar:chart-bold-duotone' />
        }
    ]

    const renderToolbar = () => null

    const dispatch = useDispatch()
    const navigate = useNavigate()

    React.useEffect(() => {
        dispatch(setBreadcrumbs(breadcrumbs))
        dispatch(setToolbar(renderToolbar()))
    }, [])

    const renderEntries = entries => {
        if (lodash.isArray(entries) === false || entries.length <= 0) {
            return (<span className="empty">no entries in category</span>)
        }
        let result = []
        for (let entry of entries) {
            // result.push(<span>{entry.title}</span>)
            result.push(
                <>



                    <Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                {entry.title}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>

                    <Card className="entry" sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    Live From Space
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Mac Miller
                                </Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                                <IconButton aria-label="previous">
                                    {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
                                </IconButton>
                                <IconButton aria-label="play/pause">
                                    <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                                </IconButton>
                                <IconButton aria-label="next">
                                    {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                        <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image="https://mui.com/static/images/cards/live-from-space.jpg"
                            alt="Live from space album cover"
                        />
                    </Card>
                </>
            )

        }


        return (
            <div className="grid">

<Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                entry.title
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>


                    <Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                entry.title
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>

                    <Card className="entry" sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    Live From Space
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Mac Miller
                                </Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                                <IconButton aria-label="previous">
                                    {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
                                </IconButton>
                                <IconButton aria-label="play/pause">
                                    <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                                </IconButton>
                                <IconButton aria-label="next">
                                    {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                        <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image="https://mui.com/static/images/cards/live-from-space.jpg"
                            alt="Live from space album cover"
                        />
                    </Card>

                    <Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                entry.title
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>

                    <Card className="entry" sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    Live From Space
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Mac Miller
                                </Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                                <IconButton aria-label="previous">
                                    {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
                                </IconButton>
                                <IconButton aria-label="play/pause">
                                    <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                                </IconButton>
                                <IconButton aria-label="next">
                                    {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                        <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image="https://mui.com/static/images/cards/live-from-space.jpg"
                            alt="Live from space album cover"
                        />
                    </Card>


                    <Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                entry.title
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>

                    <Card className="entry" variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Word of the Day
                        </Typography> */}
                            <Typography variant="h5" component="div">
                                entry.title
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
                            <Typography variant="body2">
                                well meaning and kindly.
                                <br />
                                {'"a benevolent smile"'}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Learn More</Button>
                        </CardActions>
                    </Card>


            </div>


        )
    }

    const renderCategories = categories => {
        let result = []
        for (let category of categories) {
            let accordion =
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${category.key}-content`}
                        id={`${category.key}-header`}
                    >
                        {category.title}
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderEntries(category.entries)}
                    </AccordionDetails>
                </Accordion>
            result.push(accordion)
        }
        return result
    }

    return (
        <div className="page-content visualizations">
            <h1>Visualizations</h1>
            {renderCategories(categories)}
        </div >
    )
}

