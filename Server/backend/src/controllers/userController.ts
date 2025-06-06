//_____________IMPORTS__________
// Node Models
import { Response, NextFunction } from "express";

// Models
import User from "../models/userModel";
import PinUser from "../models/pinUserModel";
import Vault from "../models/vaultModel";

// Utils
import asyncHandler from "../utils/async";
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import { advancedSearch } from "../utils/advancedSearch";
import { isUpdateValid } from "../utils/updateValidation";
import { Email } from "../utils/nodemailer/email";
import { randomString } from "../utils/randomString";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

/* @desc        Create user 
 * @route       POST /users
 * @access      Private
 */
const createUser = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    const existUserEmail = await User.findOne({ email: email });
    if (existUserEmail) {
      return next(new ErrorResponse(`This email already exists`, 400));
    }

    /* Create new user */
    const user = await User.create({
      email,
      name,
      password,
    });
    if (!user) {
      return next(new ErrorResponse("Error creating user", 422));
    }

    const vault = await Vault.create({
      ownerId: user._id,
      name: "My Vault"
    });
    if (!vault) {
      return next(new ErrorResponse("Error creating vault", 422));
    }

    return res.status(201).send(genMessage(201, user));
});


/* @desc        Get all users registered
 * @route       GET /users
 * @access      Private
 */
const getAllByParameters = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const data: any = await advancedSearch(req, User);
    return res.status(200).json(genMessage(200, data, req.newToken));
});


/* @desc        Get user by ID
 * @route       GET /users/:id
 * @access      Private
 */
const getById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const mongoId = req.params.id;

    const data = await User.findById(mongoId);
    if (!data) {
      return next(new ErrorResponse(`No user with id: ${mongoId}`, 404));
    }

    return res.status(200).json(genMessage(200, data, req.newToken));
});


/* @desc        Delete all users
 * @route       DELETE /users
 * @access      Private/admin
 */
const deleteUsers = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    await User.deleteMany();
    return res.status(204).json(genMessage(204, "All users deleted from DB."));}
);


/* @desc        Delete user by ID
 * @route       GET /users/:id
 * @access      Private
 */
const deleteUserById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`No user with id: ${req.params.id}`, 404));
    }

    /* Remove user */
    await user.remove();

    return res.status(204).send(genMessage(204, `User ${user._id} removed successfully.`, req.newToken));
});


/* @desc        Update User by ID
 * @route       PATCH /users/:id
 * @access      Private
 */
const updateUserById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["email", "name"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }
    /* Search for user and update the fields */
    let user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return next(new ErrorResponse(`Error when updating data`, 400));
    }

    res.status(200).send(genMessage(200, user, req.newToken));
});


/* @desc        Create pinUser in forgetPassword
 * @route       POST /users/forgotPassword
 * @access      Private
 */
const forgotPassword = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
  const { email } = req.body;
    if (!email) {
      return next(new ErrorResponse("Missing required field in the request",400,"InputError"));
    }

    /* Check if user exist */
    const existUserEmail = await User.findOne({ email: email });
    if (!existUserEmail) {
      return next(new ErrorResponse(`This email don't exist`, 404));
    }

    /* Create random pin with 8 characters */
    let randomPin = randomString(8, true);

    /* Create new pin */
    const pin = await PinUser.create({
      idUser: existUserEmail._id,
      pin: randomPin,
    });
    if (!pin) {
      return next(new ErrorResponse("Error creating new Pin", 422));
    }

    /* Sending an email with pin */
    try {
      await Email(email, "Change Password", "AuthPin", "", randomPin);
    } catch (error) {
      console.log(error);
      return next(new ErrorResponse(`Email could not be sent`, 400));
    }

    res.status(201).send(genMessage(201, "Email sent"));
});


/* @desc        Validate pin to update password
 * @route       GET /users/pinValidation
 * @access      Private
 */
const pinValidation = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
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

    res.status(201).send(genMessage(200, "Pin validated"));
});


/* @desc        Update password by email
 * @route       PATCH /users/changePassword/:email
 * @access      Private
 */
const changePassword = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["password", "pin"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }

    /* Check if email exist */
    let user = await User.findOne({ email: req.params.email });
    if (!user) {
      return next(new ErrorResponse(`This email don't exist`, 404));
    }
    const userId = user._id;

    /* Check if pin exist and is valid */
    const pin = await PinUser.findOne({
      idUser: userId,
      pin: req.body.pin,
      finishDate: { $gt: new Date() },
    });
    if (!pin) {
      return next(new ErrorResponse(`Invalid Pin or Expired`, 404));
    }

    /* Change user password */
    user.password = req.body.password;
    user.refresh_token = "";

    /* Sending an email with password changed */
    try {
      await Email(user.email, "Password Changed", "ConfirmPassswordUpdated");
    } catch (error) {
      console.log(error);
      return next(new ErrorResponse(`Email could not be sent`, 400));
    }

    // Save the updated user
    await user.save();
    return res.status(200).send(genMessage(200, user));
});


/* @desc        Update password by email
 * @route       PATCH /users/updatePassword/:email
 * @access      Private
 */
const updatePassword = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
  /* Checks if the values to be updated by client are the ones expected by server */
  const allowedUpdates = ["password", "olderPassword"];
  if (!isUpdateValid(req.body, allowedUpdates)) {
    return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
  }

  /* Check if email exist */
  let user = await User.findOne({ email: req.params.email }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`This email don't exist`, 404));
  }
 
  /* Check if olderPassord is correct */
  if(user.password !== req.body.olderPassword){
    return next(new ErrorResponse("That's not the old password", 400)); 
  }

  /* Change user password */
  user.password = req.body.password;
  user.refresh_token = "";

  /* Sending an email with password changed */
  try {
    await Email(user.email, "Password Changed", "ConfirmPassswordUpdated");
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse(`Email could not be sent`, 400));
  }

  // Save the updated user
  await user.save();
  return res.status(200).send(genMessage(200, user, req.newToken));
});


export {
  createUser,
  getAllByParameters,
  getById,
  deleteUsers,
  deleteUserById,
  updateUserById,
  forgotPassword,
  pinValidation,
  changePassword,
  updatePassword
};
