//_____________IMPORTS__________________
// Node Modules
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Interfaces
import { IUser, IUserMethods } from "../interfaces/userInterface";

//_____________IMPORTS__________________

interface IUserModel extends mongoose.Model<IUser, {}, IUserMethods>{};

const userSchema = new mongoose.Schema<IUser, IUserModel>({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: [true, "Please provide an email"],
    match: [/^\w+@\w+\.\w+$/, "Please provide a valid email"],
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  password: {
    type: String,
    //required: [true, "Please provide a password"],
    minlength: [8, "Password min 8 characters"],
    trim: true,
    match: [
      /^(?!.*password).*$/,
      "Password cannot contain the word 'password'",
    ],
    //select: false,
  },
  refresh_token: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (this: any, next: any) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password + process.env.PASSWORD_SECRET,10);
  }

  next();
});

/* ------------- Generate Tokens  ------------- */

/* Valid for 30 minutes */
userSchema.methods.generateRefreshToken = function (this: any) {
  const refresh_token = jwt.sign( { sub: this._id, iss: "cryptify-server" }, process.env.JWT_REFRESH_SECRET_KEY!,{ expiresIn: +process.env.JWT_REFRESH_TOKEN_TIME! });
  return refresh_token;
};

/* ------------- Validate Tokens and Password  ------------- */

userSchema.methods.refreshTokenValid = function (this: any) {
  try {
    jwt.verify(this.refresh_token, process.env.JWT_REFRESH_SECRET_KEY!);
    return true;
  } catch (err) {
    return false;
  }
};


userSchema.methods.comparePassword = async function (this: any, password: string) {
  return await bcrypt.compare(password + process.env.PASSWORD_SECRET, this.password);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
