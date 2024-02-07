const { Console } = require('node:console')
var path = require('path')

const StackTrace = require('error-stack-parser')


function isObject(value) {
    return !!value && typeof value == 'object'
}


class CTRL {

    constructor() {
        this.fg = ''
        this.bg = ''
    }

    setFG(value) {
        this.fg = value
    }

    setBG(value) {
        this.bg = value
    }

    getFG() {
        if(this.fg == null || this.fg.length <= 0) {
            return ''
        } else {
            switch(this.fg) {
                case 'black':   return '\x1b[30m'
                case 'red':     return '\x1b[31m'
                case 'green':   return '\x1b[32m'
                case 'yellow':  return '\x1b[33m'
                case 'blue':    return '\x1b[34m'
                case 'magenta': return '\x1b[35m'
                case 'cyan':    return '\x1b[36m'
                case 'white':   return '\x1b[37m'
            }
            return '\x1b[39m'    
        }
    }

    getBG() {
        if(this.bg == null || this.bg.length <= 0) {
            return ''
        } else {
            switch(this.bg) {
                case 'black':   return '\x1b[40m'
                case 'red':     return '\x1b[41m'
                case 'green':   return '\x1b[42m'
                case 'yellow':  return '\x1b[43m'
                case 'blue':    return '\x1b[44m'
                case 'magenta': return '\x1b[45m'
                case 'cyan':    return '\x1b[46m'
                case 'white':   return '\x1b[47m'
            }
            return '\x1b[49m'    
        }
    }

    toString() {
        return this.getFG() + this.getBG()
    }
}


class Line {

    constructor() {
        this.parts = []
        this.ctrl = new CTRL()
    }


    writeCtrl() {
        this.parts.push(this.ctrl.toString())
        this.ctrl = new CTRL()
    }

    TEXT(text) {
        this.writeCtrl()
        this.parts.push(text)
        return this
    }

    FGBG(fg,bg) {
        this.ctrl.setFG(fg)
        this.ctrl.setBG(bg)
        return this
    }

    FG(fg) {
        this.ctrl.setFG(fg)
        return this
    }

    BG(bg) {
        this.ctrl.setBG(bg)
        return this
    }

    RESET() {
        this.ctrl.setFG('reset')
        this.ctrl.setBG('reset')
        return this
    }

    toString() {
        this.writeCtrl()
        return this.parts.join('')
    }
}



class PrettyfiedConsole extends Console {

    constructor() {
        super({
            stdout: process.stdout,
            stderr: process.stderr
        })
        this.config = {
            error: {
                indent: 4,
                stackIndent: 2
            }
        }
    }
    
    example() {

        let colors = [
            'black',
            'red',
            'green',
            'yellow',
            'blue',
            'reset',
            'magenta',
            'cyan',
            'white'
        ]

        let line = new Line()

        for(let bg of colors) {
            for(let fg of colors) {
                line.BG(bg).FG(fg).TEXT(' AA ').RESET().TEXT(' ')
            }
            line.TEXT('\n')
        }
        line.RESET()

        console.log(line.toString())


    }


    getIndent(level) {
        let n = level * this.config.error.indent
        if(n<0) n = 0
        return Array(n).fill(' ').join('')
    }
    

    getStackIndent(level) {
        return Array(this.config.error.stackIndent).fill(' ').join('')
    }
  

    renderError(error,level,isCause) {

        let indent = this.getIndent(level)
        let before = this.getIndent(level-1)
        let stackIndent = this.getStackIndent(level)

        let line = new Line()
        if(isCause) {
            line.TEXT(before).BG('red')
            line.TEXT(' \u25b8 \u25b8 \u25b8 CAUSED BY \u25b8 \u25b8 \u25b8 ').RESET()
            line.TEXT(' ').FGBG('white','blue').TEXT(' ').TEXT(error.name).TEXT(' ').RESET()
            line.TEXT(' ').FGBG('black','white').TEXT(' ').TEXT(error.message.replace(/(\r\n|\n|\r)/gm, " | ")).TEXT(' ').RESET()
        } else {
            line.TEXT(indent).BG('red')
            line.TEXT(' \u25b8 ERROR \u25b8 ').RESET()
            line.TEXT(' ').FGBG('white','blue').TEXT(' ').TEXT(error.name).TEXT(' ').RESET()
            line.TEXT(' ').FGBG('black','white').TEXT(' ').TEXT(error.message.replace(/(\r\n|\n|\r)/gm, " | ")).TEXT(' ').RESET()
        }
        console.log(line.toString())


        line = new Line()
        line.TEXT(indent).BG('red').TEXT(' ').RESET()
        console.log(line.toString())


        // render stack trace

        let stackTrace = StackTrace.parse(error)
        let renderFileName = (item,line) => {
            if(item.fileName != null && item.fileName.length > 0) {

                if(item.fileName.startsWith(global.appRoot)) {
                    line.FG('blue').TEXT(global.appRoot).RESET()
                    line.FG('yellow').TEXT(item.fileName.substring(global.appRoot.length))
                } else {
                    line.FG('blue').TEXT(item.fileName).RESET()
                }

                if(item.lineNumber != null && Number.isInteger(item.lineNumber)) {
                    line.FG('magenta').TEXT(':').TEXT(item.lineNumber).RESET()
                    if(item.columnNumber != null && Number.isInteger(item.columnNumber)) {
                        line.FG('magenta').TEXT(':').TEXT(item.columnNumber).RESET()
                    }
                }
            }
        }

        for(let item of stackTrace) {
            line = new Line()

            line.TEXT(indent).BG('red').TEXT(' ').RESET()
            line.TEXT(stackIndent).TEXT('at ')

            if(item.functionName != null && item.functionName.length > 0) {
                line.TEXT(item.functionName) 
                if(item.fileName != null && item.fileName.length > 0) {
                    line.FG('blue').TEXT(' (').RESET()
                    renderFileName(item,line)
                    line.FG('blue').TEXT(')').RESET()

                }
            } else if(item.fileName != null && item.fileName.length > 0) {
                renderFileName(item,line)
            }

            console.log(line.toString())
        }

        line = new Line()
        line.TEXT(indent).BG('red').TEXT(' ').RESET()
        console.log(line.toString())

        // render cause
        if(error.cause instanceof Error) {
            this.renderError(error.cause,level+1,true)
        }

    }






    error(err) {

        if (err instanceof Error == false) {
            console.error(err)
            return
        }

        // this.example()

        console.log()
        this.renderError(err,0,false)
        console.log()
        


        // this.example()
        // console.error(err)
        // return






        



/*


        const fg = 'red'
        const bg = ''

        const icon = '\u26D4'

        const groupTile = ` ${this.errorsTitle}`

        if (strings.length > 1) {

            const c = this.#getColor(fg, bg)

            console.group(c, (this.useIcons ? icon : '') + groupTile)

            const nl = this.closeByNewLine
            this.closeByNewLine = false

            strings.forEach((item) => {
                this.print(fg, bg, item)
            })

            this.closeByNewLine = nl
            console.groupEnd()

            if (nl) console.log()

        } else {

            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))

        }

        */






    }


    /*

        Targets für prettyfie

        console.log('this is a log message')                // bleibt
        console.info('this is a info message')              // eventuell mit icon
        console.debug('this is a debug message')            
        console.warn('this is a warning message')
        console.error('this is an error message')

        Man könnte zusätzliche sachen hinzunehmen wie z.b. eine shön formatierte object ansicht mit options
        console.obj(thing, options)


    */




}





/*

class PrettyfiedConsole {

        // welche sind vorher schon da?

        // log
        // warn
        // error
        // debug
        
        // zum durchschleifen:

        // assert
        // clear
        // count
        // countReset
        // dir
        // dirxml

    closeByNewLine = true
    useIcons = true
    logsTitle = 'LOGS'
    warningsTitle = 'WARNINGS'
    errorsTitle = 'ERRORS'
    informationsTitle = 'INFORMATIONS'
    successesTitle = 'SUCCESS'
    debugsTitle = 'DEBUG'
    assertsTitle = 'ASSERT'

    #getColor(foregroundColor = '', backgroundColor = '') {

        let fgc = '\x1b[37m'

        switch (foregroundColor.trim().toLowerCase()) {
            case 'black':
                fgc = "\x1b[30m"
                break;
            case 'red':
                fgc = "\x1b[31m"
                break;
            case 'green':
                fgc = "\x1b[32m"
                break;
            case 'yellow':
                fgc = "\x1b[33m"
                break;
            case 'blue':
                fgc = "\x1b[34m"
                break;
            case 'magenta':
                fgc = "\x1b[35m"
                break;
            case 'cyan':
                fgc = "\x1b[36m"
                break;
            case 'white':
                fgc = "\x1b[37m"
                break;
        }

        let bgc = ''

        switch (backgroundColor.trim().toLowerCase()) {
            case 'black':
                bgc = "\x1b[40m"
                break;
            case 'red':
                bgc = "\x1b[44m"
                break;
            case 'green':
                bgc = "\x1b[44m"
                break;
            case 'yellow':
                bgc = "\x1b[43m"
                break;
            case 'blue':
                bgc = "\x1b[44m"
                break;
            case 'magenta':
                bgc = "\x1b[45m"
                break;
            case 'cyan':
                bgc = "\x1b[46m"
                break;
            case 'white':
                bgc = "\x1b[47m"
                break;
        }

        return `${fgc}${bgc}`
    }


    #getColorReset() {
        return '\x1b[0m'
    }


    clear() {
        console.clear()
    }


    print(foregroundColor = 'white', backgroundColor = 'black', ...strings) {
        const c = this.#getColor(foregroundColor, backgroundColor)
        // turns objects into printable strings
        strings = strings.map((item) => {
            if (typeof item === 'object') item = JSON.stringify(item)
            return item
        })
        console.log(c, strings.join(''), this.#getColorReset())
        if (this.closeByNewLine) console.log('')
    }


    log(...strings) {
        const fg = 'white'
        const bg = ''
        const icon = '\u25ce'
        const groupTile = ` ${this.logsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item, this.#getColorReset())
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    warn(...strings) {
        const fg = 'yellow'
        const bg = ''
        const icon = '\u26a0'
        const groupTile = ` ${this.warningsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item, this.#getColorReset())
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    error(...strings) {
        const fg = 'red'
        const bg = ''
        const icon = '\u26D4'
        const groupTile = ` ${this.errorsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item)
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    info(...strings) {
        const fg = 'blue'
        const bg = ''
        const icon = '\u2139'
        const groupTile = ` ${this.informationsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item)
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    success(...strings) {
        const fg = 'green'
        const bg = ''
        const icon = '\u2713'
        const groupTile = ` ${this.successesTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item)
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    debug(...strings) {
        const fg = 'magenta'
        const bg = ''
        const icon = '\u1367'
        const groupTile = ` ${this.debugsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item)
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }



    assert(...strings) {
        const fg = 'cyan'
        const bg = ''
        const icon = '\u0021'
        const groupTile = ` ${this.assertsTitle}`
        if (strings.length > 1) {
            const c = this.#getColor(fg, bg)
            console.group(c, (this.useIcons ? icon : '') + groupTile)
            const nl = this.closeByNewLine
            this.closeByNewLine = false
            strings.forEach((item) => {
                this.print(fg, bg, item)
            })
            this.closeByNewLine = nl
            console.groupEnd()
            if (nl) console.log()
        } else {
            this.print(fg, bg, strings.map((item) => {
                return `${(this.useIcons ? `${icon} ` : '')}${item}`
            }))
        }
    }
}

*/


module.exports = new PrettyfiedConsole()

