import './SimpleTable.scss'
import PropTypes from 'prop-types'

const SimpleTable = ({
    className,
    title,
    titleIcon,
    titleIconPos,
    columns,
    data,
    renderWhenEmpty,
    emptyMessage
 }) => {
    return (
        (data != null && data.length > 0) || renderWhenEmpty ?
            <div className={'simple-table' + (className != null ? ` ${className}` : '')}>
                <div className='title'>
                    { titleIcon != null && titleIconPos === 'left' ? <div className='icon left'>{titleIcon}</div> : null }
                    <span className='label'>{title}</span>
                    { titleIcon != null && titleIconPos === 'right' ? <div className='icon right'>{titleIcon}</div> : null }
                </div>
                <div className='table'>
                    { data != null && data.length > 0 ? 
                        <>
                            <div className='header'>
                                { columns.map(column => <div className='cell'>{column.label}</div>) }
                            </div>
                            <div className='body'>
                                { data.map( row =>
                                    <div className='row'>
                                        { columns.map(column => <div className='cell'>{row[column.id] == null ? null : row[column.id]}</div>) }
                                    </div>
                                )}
                            </div>
                        </>
                    : 
                        <span style={{alignSelf: 'center'}}><em>{emptyMessage != null ? emptyMessage : 'no entries'}</em></span>
                    }
                </div>
            </div>
        :
                null
    )
}

SimpleTable.propTypes = {
    title: PropTypes.string.isRequired,
    header: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.string.isRequired, label: PropTypes.string.isRequired}).isRequired).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
}

SimpleTable.defaultProps = {
    renderWhenEmpty: false
  }

export default SimpleTable