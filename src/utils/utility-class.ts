class ErrorHandler extends Error {
    constructor(public message: string, public statusCode: number) {
        //The Error class constructor expects a single parameter, message, which is why super(message) is called to set the error message.
        super(message);
        this.statusCode = statusCode
        //Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler