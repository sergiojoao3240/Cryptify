//_____________IMPORTS__________
// Node Models
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";

// Models
import User from "../models/userModel";

// Utils
import asyncHandler from "../utils/async";
import ErrorResponse from "../utils/response/errorResponse";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

const tokenValidation = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {

    if(req.headers.authorization === undefined){
        return next( new ErrorResponse("Access denied!", 403));
    }

    /* Checks that authorization header is present and it is not on redis */
    let token = req.headers.authorization.split("Bearer ")[1];

    if (token !== undefined) {
        /* Check if Token is valid */
            /* Get user information */
            const decodedToken: JwtPayload | string = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY!);
            const user = await User.findById(decodedToken.sub).select('+refresh_token').select('+password');
            if (!user){
                return next(new ErrorResponse("Access denied!", 403));
            }
            /* Validate accessToken */
            if (user.refreshTokenValid()){
                req.user = user;
                return next();
            }
            if (!user.refreshTokenValid()){
                return next(new ErrorResponse("Invalid credentials, please Login", 403)); 
            }
    }
    return next(new ErrorResponse("Access denied!", 403));
   
});


export { tokenValidation };
