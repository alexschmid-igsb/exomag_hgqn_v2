import React from 'react'

import prettyBytes from 'pretty-bytes'

import SimpleTable from '../../components/util/SimpleTable'

import './FileList.scss'

export default function ({
    className,
    title,
    titleIcon,
    titleIconPos,
    columns,
    files,
    renderWhenEmpty,
    emptyMessage
}) {
    const filesFormatted = React.useMemo(() => (files != null ? files : []).map(file => ({...file,size: prettyBytes(file.size)})), [files])
    // const columns = [ /*{ id: 'id', label: 'ID' }, */ { id: 'name', label: 'Name' }, { id: 'size', label: 'Size' }, { id: 'type', label: 'Source' } ]
    return (
        // <div className={'file-list' + (className != null ? ` ${className}` : '')}>
            <SimpleTable
                className={className}
                title={title}
                titleIcon={titleIcon}
                titleIconPos={titleIconPos}
                columns={columns}
                data={filesFormatted}
                renderWhenEmpty={renderWhenEmpty}
                emptyMessage={emptyMessage}
            />
        // </div>
    )
}