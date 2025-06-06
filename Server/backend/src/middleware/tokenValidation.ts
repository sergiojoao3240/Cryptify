//_____________IMPORTS__________
// Node Models
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";

// Models
import User from "../models/userModel";

// Utils
import asyncHandler from "../utils/async";
import ErrorResponse from "../utils/response/errorResponse";
import { genMessage } from "../utils/response/messageResponse";

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
        try {
            const decodedToken: JwtPayload | string = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY!);
            const user = await User.findById((decodedToken as JwtPayload).sub).select('+refresh_token').select('+password');
        
            if (!user) {
                return next(new ErrorResponse("Access denied!", 403));
            }
        
            if (!user.refreshTokenValid()) {
                return next(new ErrorResponse("Invalid credentials, please Login", 403));
            }
        
            req.user = user;
            return next();
            } catch (err: any) {
            if (err.name === "TokenExpiredError") {                
                const decoded = jwt.decode(token) as JwtPayload;

                if (decoded?.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    const secondsSinceExpiration = now - decoded.exp;
              
                    if (secondsSinceExpiration <= 1800) {
                        const user = await User.findById(decoded?.sub);
                        if (!user) {
                            return next(new ErrorResponse("User not found", 404));
                        }

                        user.refresh_token = user.generateRefreshToken();
                        await user.save();

                        let _user = user.toJSON();
                        delete _user.password;
                        req.newToken = user.refresh_token;
                        return next();      

                    } else {
                        return next(new ErrorResponse("Token expired. You can request a new one.", 401));
                    }
                }
            }
        }
    }
    return next(new ErrorResponse("Access denied!", 403));

});


export { tokenValidation };
