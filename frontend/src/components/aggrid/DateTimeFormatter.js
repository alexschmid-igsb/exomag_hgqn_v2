
export default ({type,stuff=null}) => {

    switch(type) {

        case 'date':
            return params => {

                // korrekter weg um vom ISO String zum lokal date zu kommen

                if(typeof params === 'undefined' || params == null || typeof params.value === 'undefined' || params.value == null) {
                    return undefined
                }

                let date = new Date(params.value)       // Der ISO String wird geparst und nach local umgerechnet, d.h. die Zeitzone fliegt raus

                let day = date.getDate()
                let month = date.getMonth() + 1
                let year = date.getFullYear()

                if(isNaN(day) || isNaN(month) || isNaN(year)) {
                    return undefined
                }

                if (day < 10) {
                  day = '0' + day;
                }

                if (month < 10) {
                    month = '0' + month;
                }

                let formatted = day + '.' + month + '.' + year

                return formatted
            }
            
        case 'datetime':
            return params => {

                if(typeof params === 'undefined' || params == null || typeof params.value === 'undefined' || params.value == null) {
                    return undefined
                }

                let date = new Date(params.value)       // Der ISO String wird geparst und nach local umgerechnet, d.h. die Zeitzone fliegt raus

                let day = date.getDate()
                let month = date.getMonth() + 1
                let year = date.getFullYear()

                let hours = date.getHours()
                let minutes = date.getMinutes()
                let seconds = date.getSeconds()

                if(isNaN(day) || isNaN(month) || isNaN(year)) {
                    return undefined
                }

                if (day < 10) {
                  day = '0' + day;
                }

                if (month < 10) {
                    month = '0' + month;
                }

                if(hours < 10) {
                    hours = '0' + hours
                }

                if(minutes < 10) {
                    minutes = '0' + minutes
                }

                if(seconds < 10) {
                    seconds = '0' + seconds
                }

                let formatted = day + '.' + month + '.' + year + ', ' + hours + ':' + minutes + ':' + seconds
                // let formatted =   + hours + ':' + minutes + ':' + seconds + ', ' + day + '.' + month + '.' + year

                return formatted
            }


        case 'time':
        default:
            return params => "value formatter not implemented"
    }
}
