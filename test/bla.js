






// var path = "hello.there.how.are.you"
var path = "hellothere"

let pos = path.indexOf('.')
if(pos > 0) {

    let current = path.substring(0,pos)
    let remaining = path.substring(pos+1)
    console.log(current)
    console.log(remaining)

} else if(pos === -1) {

    let current = path.substring(0,pos)
    let remaining = path.substring(pos+1)
    console.log(current)
    console.log(remaining)


} else {
    // FEHLER
}





