

/*


const path = require('path')
const fs = require('fs')

const root = '/media/alex/data/fonts/font-files'








const loadFonts = () => {
    const metadata = require(path.join(root, 'metadata', 'fontsource.json'))
    let fonts = {}

    let count = {
        normal: 0,
        variable: 0,
    }

    for(const [key, value] of Object.entries(metadata)) {
        // console.log(value)

        fonts[key] = {
            id: value.id,
            family: value.family,
            subsets: value.subsets,
            category: value.category,
            variable: value.variable,
            weights: value.weights,
            styles: value.styles,
            defaultSubset: value.defSubset,
            type: value.type
        }

        // console.log( (value.variable !== false ? 'variable' : 'default') + " " + value.category + " " + value.type + " ")

        if(value.variable !== false) {
            count.variable = count.variable + 1
        } else {
            count.normal = count.normal + 1
        }
    }

    console.log(count)

    return fonts
}




const resolveFile = (font, params) => {

    if(font.defaultSubset == null) {
        font.defaultSubset = 'latin'
    }


    if(font.variable === false) {

        let folder = undefined

        if(font.category === 'icons') {
            folder = 'icons'
        } else {
            if(font.type === 'google') {
                folder = 'google'
            } else if(font.type === 'other') {
                folder = 'other'
            } else {
                // what to do here?
            }
        }

        const config = [
            { subset: params.subset, weight: params.weight, style: params.style },
            { subset: font.defaultSubset, weight: params.weight, style: params.style },
            { subset: params.subset, weight: params.weight, style: 'normal' },
            { subset: font.defaultSubset, weight: params.weight, style: 'normal' },
            { subset: params.subset, weight: '400', style: params.style },
            { subset: font.defaultSubset, weight: '400', style: params.style },
            { subset: params.subset, weight: '400', style: 'normal' },
            { subset: font.defaultSubset, weight: '400', style:'normal' },
        ]
    
        let log = []
    
        for(let i=0; i<8; i++) {
            let cfg = config[i]
            let fileName = font.id + '-' + cfg.subset + '-' + cfg.weight + '-' + cfg.style + '.woff2'
            let file = path.join(root, 'fonts', folder, font.id, 'files', fileName)
            log.push(file)
            if(fs.existsSync(file) === false) {
                // not found
            } else {
                return file
            }
        }

        console.log("\nNICHT GEFUNDEN: ")
        console.log(font)
        console.log(log.join('\n'))
        console.log()
    
        return undefined

    } else {

        let folder = 'variable'
        if(font.category === 'icons') {
            folder = 'variable-icons'
        }

        let fallbackAxis = 'full'

        const config = [
            { subset: params.subset, axis: params.axis, style: params.style },
            { subset: font.defaultSubset, axis: params.axis, style: params.style },
            { subset: params.subset, axis: params.axis, style: 'normal' },
            { subset: font.defaultSubset, axis: params.axis, style: 'normal' },
            { subset: params.subset, axis: fallbackAxis , style: params.style },
            { subset: font.defaultSubset, axis: fallbackAxis, style: params.style },
            { subset: params.subset, axis: fallbackAxis, style: 'normal' },
            { subset: font.defaultSubset, axis: fallbackAxis, style:'normal' },
        ]

        let log = []

        for(let i=0; i<8; i++) {
            let cfg = config[i]
            let fileName = font.id + '-' + cfg.subset + '-' + cfg.axis + '-' + cfg.style + '.woff2'
            let file = path.join(root, 'fonts', folder, font.id, 'files', fileName)
            log.push(file)
            if(fs.existsSync(file) === false) {
                // not found
            } else {
                return file
            }
        }

        // console.log("NICHT GEFUNDEN (VARIABLE): ")
        // console.log(params)
        // console.log(font)
        // console.log(log.join('\n'))
        // console.log()

        return undefined
        
    }


}

const clean = fonts => {

    // non-variable fonts
    for(let [key, font] of Object.entries(fonts)) {
        if(font.variable !== false) {
            continue
        }
        for(let subset of font.subsets) {
            for(let weight of font.weights) {
                for(let style of font.styles) {
                    let file = resolveFile(font, {subset: subset, weight: weight, style: style} )
                    if(file == null) {
                        delete fonts[key]
                    }
                }
            }
        }
    }

    // variable fonts
    for(let [key, font] of Object.entries(fonts)) {

        if(font.variable === false) {
            continue
        } 
    
        for(let subset of font.subsets) {
            if(subset !== 'latin' && subset != 'latin-ext') {
                continue
            }
            for(let weight of font.weights) {
                for(let style of font.styles) {
                    let file = resolveFile(font, {subset: subset, axis: 'wght', weight: weight, style: style} )
                    if(file == null) {
                        delete fonts[key]
                    }
                }
            }
        }
    }

    return fonts
}







let fonts = loadFonts()
fonts = clean(fonts)





// non-variable fonts
for(let [key, font] of Object.entries(fonts)) {
    if(font.variable !== false) {
        continue
    }
    for(let subset of font.subsets) {
        for(let weight of font.weights) {
            for(let style of font.styles) {
                let file = resolveFile(font, {subset: subset, weight: weight, style: style} )
                if(file == null) {
                    console.log(font.id)
                }
            }
        }
    }
}

// variable fonts
for(let font of Object.values(fonts)) {
    if(font.variable === false) {
        continue
    } 
    for(let subset of font.subsets) {
        if(subset !== 'latin' && subset != 'latin-ext') {
            continue
        }
        for(let weight of font.weights) {
            for(let style of font.styles) {
                let file = resolveFile(font, {subset: subset, axis: 'wght', weight: weight, style: style} )
                if(file == null) {
                    console.log(font.id)
                }
            }
        }
    }
}










// iterate variable fonts






// console.log(fonts)




// let subsets = new Map()
// let weights = new Map()
// let styles = new Map()

// for(let font of Object.values(fonts)) {

//     for(let subset of font.subsets) {
//         if(subsets.get(subset) == null) {
//             subsets.set(subset, 0)
//         }
//         let count = subsets.get(subset)
//         subsets.set(subset,count+1)
//     }

//     for(let weight of font.weights) {
//         if(weights.get(weight) == null) {
//             weights.set(weight, 0)
//         }
//         let count = weights.get(weight)
//         weights.set(weight,count+1)
//     }

//     for(let style of font.styles) {
//         if(styles.get(style) == null) {
//             styles.set(style, 0)
//         }
//         let count = styles.get(style)
//         styles.set(style,count+1)
//     }

// }

// console.log(subsets)
// console.log(weights)
// console.log(styles)






// const file = findFile(fonts['zilla-slab-highlight'], 'latin-ext', '400', 'normal')
// console.log(file)






// for(let font of Object.values(fonts)) {
//     for(let subset of font.subsets) {
//         for(let weight of font.weights) {
//             for(let style of font.styles) {
//                 let file = findFile(font, subset, weight, style)
//                 // console.log(file)
//             }
//         }
//     }
// }








export default {
    loadFonts: 'bla'


}



*/