
module.exports = class BackendError extends Error {
    constructor(message,status,cause) {
        super(message);
        this.name = "BackendError"
        this.status = status ? status : 500
        this.cause = cause ? cause : undefined
    }
}
