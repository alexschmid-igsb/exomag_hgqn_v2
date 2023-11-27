
VerticalSeparator.defaultProps = {
    color: '#AAA',
    // color: 'rgba(255,255,255,0.8)',
    margin: 10,
    height: '50%'
}

export default function VerticalSeparator({color, margin, height}) {
    return (
        <div style={{
            width: '0px',
            maxWidth: '0px',
            borderLeft: `1px solid ${color}`,
            height: height,
            margin: `0px ${margin}px`
        }}></div>
    )
}

{/* <div style={{borderRight: '1px dashed #AAA', height: '50%', margin: '0px 20px'}}></div> */}
