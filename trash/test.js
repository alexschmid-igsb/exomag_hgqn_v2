// const hpoCheck = /^[hH][pP]:\d{7}$/

// const hpoParse = /([hH][pP][: ]?\d{7})[\s;,]*/g

// let str = "HP:0001250   HP 0000750 ;hP:0002149; ,HP 0000717  ; ,  HP0000486 HP:0000540"

// console.log(str)


// for(let match of str.matchAll(hpoParse)) {
//     let term = 'HP' + match[1].replace(' ',':').substring(2)
//     if(term.charAt(2) !== ':') {
//         term = 'HP:' + term.substring(2)
//     }
//     console.log(term)
// }






// let str = "wlkenwfnwöjnfkjwenfkjewnf"

// console.log(str.split('/'))






// let bla = Array(3).fill({})
// let bla = Array(3).fill(0).map(() => ({}))
// bla[0].xyz = 1
// console.log(bla)



// const { DateTime } = require("luxon")
// let bla = DateTime.fromISO("03.11.2020")
// console.log(bla)







/*
bla = (item) => {
    item.push('neu',123)
}
let dings = ['xyz']
bla(dings)
console.log(dings)
*/




let ui = [
    {abc: 123},
    {xyz: 456}
]


for(let item of ui) {
    item.neu = 'x'
    item.xyz = 'abc'
}


console.log(ui)












