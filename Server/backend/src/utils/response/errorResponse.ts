class ErrorResponse extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number, name?: string) {
        super(message);
        this.statusCode = statusCode;
        
        if (name != null)
            this.name = name;
    }
}

export default ErrorResponse;