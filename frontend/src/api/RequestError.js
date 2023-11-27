
export default class RequestError extends Error {
    constructor(message) {
        super(message)
        this.name = "RequestError"
    }
    setStatus(status) {
        this.status = status
    }
    setCause(cause) {
        this.cause = cause
    }
}
