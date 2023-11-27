import React from 'react'

export const ToolbarContext = React.createContext( /*{ name: '', auth: false }*/)

export const ToolbarProvider = ({ children }) => {

    const [content, setContent] = React.useState("hallo")

    const toolbarInterface = React.useMemo(() => ({ content, setContent }), [content] )

    return (
        // <ToolbarContext.Provider value={{ content, setContent }}>
        <ToolbarContext.Provider value={{ toolbarInterface }}>        
            {children}
        </ToolbarContext.Provider>
    )
}




