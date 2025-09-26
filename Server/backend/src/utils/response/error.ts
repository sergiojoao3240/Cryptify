//_____________IMPORTS__________________
//Utils
import { genMessage } from "./messageResponse";
//_____________IMPORTS__________________

// Creation of the error to show in the container console and on  HTTP response object
export function errorHandler(error: any, req: any, res: any, next: any) {
    let message = error.message;
    let httpCode = error.statusCode;

    /* Log to console for dev */
    //console.log("Error :", error);

    switch (error.name) {

        case "TypeError":
            {
                /* Internal Server Error */
                message = `Internal Server Error -> ${error.message}`;
                httpCode = 500;
                break;
            }
        case "CastError":
            {
                /* Mongoose Bad ObjectID */
                message = "Resource invalid";
                httpCode = 404;
                break;
            }
        case "ValidationError":
            {
                /* Mongoose Validation Error */
                message = Object.values(error.errors).map((val: any) => val.message);
                httpCode = 400;
                break;
            }
        case "JsonWebTokenError":
            {
                /* Problems with CSRF Token */
                message = "Unrecognized JWT Format";
                httpCode = 400;
                break;
            }
        case "InputError":
            {
                message = "Invalid Input";
                httpCode = 400;
                break;
            }
        case "ObjectError":
            {
                /* Objects with Invalid ID */
                message = "Invalid Object";
                httpCode = 404;
                break;
            }

        default: {
            break;
        }
    }

    switch (error.code) {

        case 11000:
            {
                /* Mongoose Duplicate Key */
                message = `Duplicate field entered - ${Object.values(error.keyValue)[0]}`;
                httpCode = 400;
            }
    }


    res.status(httpCode || 500).json(genMessage(httpCode, message || "Server Error"));
}