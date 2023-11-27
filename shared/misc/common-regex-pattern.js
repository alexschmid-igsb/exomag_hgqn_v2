
const EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const USERNAME = /^[a-zA-Z]([.\-_]*[a-zA-Z0-9]+)*[a-zA-Z0-9]?$/

const validatePassword = password => {

    const minLength = 8

    const upperTest = /[ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ]/
    const lowerTest = /[abcdefghijklmnopqrstuvwxyzäöü]/
    const digitTest = /[0123456789]/
    const specialTest = /[ `°!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

    if(password == false) {
        password = ''
    }

    let result = {
        length: password.length >= minLength,
        upper: upperTest.test(password),
        lower: lowerTest.test(password),
        digit: digitTest.test(password),
        special: specialTest.test(password)
    }

    result.passed = result.length && result.upper && result.lower && result.digit && result.special

    return result
}

module.exports = {
    email: EMAIL,
    username: USERNAME,
    validatePassword: validatePassword
}
