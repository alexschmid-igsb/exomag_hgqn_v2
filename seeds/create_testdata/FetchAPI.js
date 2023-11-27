const RequestError = require('./RequestError')

function executeFetch(url, fetchOptions) {

    // create error before promise to get stacktrace infos
    let requestError = new RequestError("API request returned http error code")

    // return promise
    return new Promise( (resolve, reject) => {
        fetch(url, fetchOptions)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => resolve(data)).catch(error => reject(error))
                } else {
                    requestError.setStatus(response.status)
                    response.json().then(data => {
                        requestError.setCause(data)
                        reject(requestError)
                    })
                    .catch(error => {
                        requestError.setCause(error)
                        reject(requestError)
                    })
                }
            })
            .catch(error => reject(error))
    })
}


module.exports = {

    get: function(url, options) {
        let fetchOptions = { method: 'GET' }
        if (options && options.params) url += '?' + (new URLSearchParams(options.params)).toString()
        return executeFetch(url, fetchOptions)
    },

    post: function(url, options) {

        let fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
              }
        }

        if (options && options.params) {
            fetchOptions.body = JSON.stringify(options.params);
        }

        return executeFetch(url, fetchOptions)
    },

    sendFile: function(url, file, options) {
        const formData = new FormData()
        formData.append('file', file)

        // das hier taugt nur für einfache key value pairs, json stringify ist da sinnvoller
        // if(options && options.params) {
        //     for(let key of Object.keys(options.params)) {
        //         if(key !== 'file') {
        //             formData.append(key,options.params[key])
        //         }
        //     }
        // }

        if(options && options.params) {
            formData.append('params',JSON.stringify(options.params))
        }

        const fetchOptions = {
            method: 'POST',
            body: formData
        }

        return executeFetch(url, fetchOptions)
    },


    sendFiles: function(url, files, options) {
        
        let formData = new FormData()

        for(let file of files) {
            formData.append('files', file)
        }

        if(options && options.params) {
            formData.append('params',JSON.stringify(options.params))
        }

        const fetchOptions = {
            method: 'POST',
            body: formData
        }

        return executeFetch(url, fetchOptions)
    }

}



