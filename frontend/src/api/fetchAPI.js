import store from '../store/store'
import { addBackendError } from '../store/error'
import RequestError from './RequestError'


function handleError(error,doNotThrowFor) {

    let doNotThrow = false
    
    if(Array.isArray(doNotThrowFor) && typeof error.status === 'number') {
        doNotThrow = doNotThrowFor.includes(error.status)
    }

    if(doNotThrow == false) {
        store.dispatch(addBackendError(error))
    }

    return error
}


function executeFetch(url, fetchOptions, doNotThrowFor) {

    // create error before promise to get stacktrace infos
    let requestError = new RequestError("API request returned http error code")

    // return promise
    return new Promise( (resolve, reject) => {
        fetch(url, fetchOptions)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => resolve(data)).catch(error => reject(handleError(error,doNotThrowFor)))
                } else {
                    requestError.setStatus(response.status)
                    response.json().then(data => {
                        requestError.setCause(data)
                        reject(handleError(requestError,doNotThrowFor))
                    })
                    .catch(error => {
                        requestError.setCause(error)
                        reject(handleError(requestError,doNotThrowFor))
                    })
                }
            })
            .catch(error => reject(handleError(error,doNotThrowFor)))
    })
}


export default {

    get: function(url, options) {
        let fetchOptions = { method: 'GET' }
        if (options && options.params) url += '?' + (new URLSearchParams(options.params)).toString()
        return executeFetch(url, fetchOptions, options ? options.doNotThrowFor : undefined)
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

        return executeFetch(url, fetchOptions, options ? options.doNotThrowFor : undefined)
    },

    sendFile: function(url, file, options) {
        const formData = new FormData()
        formData.append('file', file)

        // das hier taugt nur für einfache key value pairs, json stringify ist da eine echte verbesserung
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

        return executeFetch(url, fetchOptions, options ? options.doNotThrowFor : undefined)
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

        return executeFetch(url, fetchOptions, options ? options.doNotThrowFor : undefined)
    }

}



