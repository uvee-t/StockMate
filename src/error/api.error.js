class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message || 'Something Went Wrong');
        this.statusCode = statusCode || 500;
        if (details !== undefined) {
            this.details = details;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
export { ApiError };
