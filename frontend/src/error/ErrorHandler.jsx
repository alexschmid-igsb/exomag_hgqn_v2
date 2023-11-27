import React from 'react'
import { connect } from 'react-redux'
import { clearAll } from '../store/error'
import ErrorView from './ErrorView'
import Button from '@mui/material/Button'
import UndoIcon from '@mui/icons-material/Undo';

import './ErrorHandler.scss'

const mapStateToProps = (state) => ({
    api: state.error.api
})

const mapDispatchToProps = (dispatch) => {
    return {
        clearAll: () => dispatch(clearAll())
    }
}

class ErrorHandler extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            uncaught: null
        }
    }

    static getDerivedStateFromError(error) {
        return {
            uncaught: error
        }
    }

    clearUncaught = () => {
        this.setState({
            uncaught: null
        })
    }

    clearApi = () => {
        this.props.clearAll()
        /*
        this.setState({
            uncaught: null
        })
        */
    }

    render() {
        if (this.state.uncaught !== null) {
            return (
                <div className="error-handler">
                    <ErrorView
                        title="Unexpected Error"
                        error={this.state.uncaught}
                    />
                    <Button
                        variant="contained"
                        startIcon={<UndoIcon />}
                        style={{ position: 'absolute', bottom: '8px', right: '8px' }}
                        onClick={this.clearUncaught}
                    >
                        Clear and go back
                    </Button>
                </div>
            )
        } else if (this.props.api.length > 0) {
            let error = this.props.api[0]
            return (
                <div className="error-handler">
                    <ErrorView
                        title="Backend Error"
                        error={error}
                    />
                    {error.cause ?
                        <ErrorView
                            title="Caused by"
                            error={error.cause}
                        />
                        :
                        null
                    }
                    <Button
                        className="clear-button"
                        variant="contained"
                        startIcon={<UndoIcon />}
                        onClick={this.clearApi}
                    >
                        Clear and go back
                    </Button>
                </div>
            )
        } else {
            return this.props.children
        }
    }

    // deprecated
    // componentDidCatch(error, info) {
    // }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorHandler)
