//_____________IMPORTS__________________
// Node Models
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Models
import User from "../models/userModel";
import PinUser from "../models/pinUserModel";

// Utils
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import asyncHandler from "../utils/async";
import { Email } from "../utils/nodemailer/email";
import { randomString } from "../utils/randomString";

// Interface
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________________


/* @desc        Login user
 * @route       POST /auth/login
 * @access      Public
*/
const login = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    /* Validate email & password */
    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400, 'Invalid Input'));
    }

    /* Check for user */
    let user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorResponse("User not found or Invalid Password", 401));
    }

    /* Check for password */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new ErrorResponse("Invalid Credentials", 401));   
    }

    /* Create random pin with 8 characters */
    let randomPin = randomString(8, true);

    /* Create new pin */
    const pin = await PinUser.create({
        idUser: user._id,
        pin: randomPin,
    });
    if (!pin) {
        return next(new ErrorResponse("Error creating Pin", 422));
    }

    /* Sending an email with pin */
    try {
        await Email(email, "Pin to Login", "AuthPin", "", randomPin);
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Email could not be sent`, 400));
    }

    return res.status(200).send(genMessage(200, "Email sent!"));
});


/* @desc        Log user out / clear cookie
 * @route       GET /auth/logout
 * @access      Private
*/
const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await User.findById(req.params.id);

    if(!user) {
        return next( new ErrorResponse("User not in DB!", 404));
    }
    
    /* Remove the tokens */
    user.refresh_token = "";
    await user.save();

    res.status(200).send(genMessage(200, "Successfully logged out."));
});


/* @desc        Validate Login with Pin
 * @route       Post /auth/validate
 * @access      Private
*/
const validateLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const { pin, email } = req.body;
    if (!pin || !email) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    const user = await User.findOne({ email });
    if (!user){
      return next(new ErrorResponse('User not found', 404));
    }

    /* Check if pin is valid */
    const validPin = await PinUser.findOne({ pin, idUser: user._id, finishDate: { $gt: new Date() } });
    if (!validPin) {
      return next(new ErrorResponse(`This pin is invalid`, 400));
    }

    /* Generate new tokens */
    user.refresh_token = user.generateRefreshToken();
    await user.save();

    let _user = user.toJSON();
    delete _user.password;

    res.status(201).send(genMessage(200, _user));
});


/* @desc        Validate Login with Pin
 * @route       POST /auth/update
 * @access      Private
*/
const updateToken = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {

    let { password } = req.body
    if (!password){
        return next(new ErrorResponse("Please provide apassword", 400));
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorResponse("No token provided", 403));
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = jwt.decode(token) as JwtPayload;
    const user = await User.findById(decoded?.sub);
    if (!user) {
        return next(new ErrorResponse("User not found", 404));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new ErrorResponse("Invalid Credentials", 401));   
    }

    user.refresh_token = user.generateRefreshToken();
    await user.save();

    let _user = user.toJSON();
    delete _user.password;

    return res.status(201).send(genMessage(200, _user));
});


export {login, logout, validateLogin, updateToken};