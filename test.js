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






let str = "wlkenwfnwöjnfkjwenfkjewnf"

console.log(str.split('/'))
