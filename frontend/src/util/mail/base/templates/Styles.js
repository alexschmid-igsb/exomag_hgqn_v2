const fontFamily = 'HelveticaNeue,Helvetica,Arial,sans-serif'

// const border = '1px solid rgba(0,0,0,0.2)'
const border = '1px solid #AAA'

const styles = {

    body: {
        // backgroundColor: '#efeef1',
        backgroundColor: 'white',
        fontFamily,

    },

    container: {
        width: '580px',
        margin: '30px auto',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
        borderRadius: '3px',
    },

    paragraph: {
        lineHeight: 1.5,
        fontSize: 14,
    },

    url: {
        lineHeight: 1.5,
        fontSize: '14px',
        fontFamily: 'monospace',
        padding: '4px 8px',
        borderRadius: '3px',
        backgroundColor: '#DDD',
        textAlign: 'center'
    },

    logo: {
        borderRadius: '5px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alingItems: 'center',
        padding: '20px',
        // backgroundColor: '#8AAAC7',
        backgroundColor: '#FFFFFF',
        border: border,
        borderBottom: '1px dashed rgba(0,0,0,0.2)',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
    },

    content: {
        padding: '5px 50px 10px 60px',
        backgroundColor: '#FFFFFF',
        border: border,
        borderBottom: 'none',
        borderTop: 'none',
    },

    footer: {
        padding: '5px 50px 10px 60px',
        backgroundColor: '#FFFFFF',
        border: border,
        borderTop: 'none',
        borderRadius: '5px',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
    },

    button: {
        borderRadius: '3px',
        backgroundColor: '#1976d2',
        fontWeight: '600',
        color: '#fff',
        fontSize: '15px',
        textDecoration: 'none',
        pX: '23px',
        pY: '11px',
        lineHeight: '100%',
        maxWidth: '100%',
        padding: '11px 23px'
    },

    centered: {
        textAlign: 'center',
        padding: '5px 50px 10px 60px',
        backgroundColor: '#FFFFFF',
        border: border,
        borderBottom: 'none',
        borderTop: 'none',
        display: 'flex',
        justifyContent: 'center',
        alingItems: 'center',
    }





    /*
    const footer = {
        width: '580px',
        margin: '0 auto',
    };
       
    const link = {
        textDecoration: 'underline',
    };
    
    */

}

export default styles
