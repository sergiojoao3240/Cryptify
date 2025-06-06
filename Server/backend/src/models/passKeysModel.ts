//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

// Interfaces
import { IPassKeys, IPasskeysMethods } from '../interfaces/passKeysInterface';

//_____________IMPORTS__________________

interface IPassKeysModel extends mongoose.Model<IPassKeys, {}, IPasskeysMethods>{};


const passKeysSchema = new mongoose.Schema<IPassKeys, IPassKeysModel>({
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vault",
        required: [true, "Please provide a vaultId."],
    },
    name: {
        type: String,
        required: [true, "Please provide a name"],        
    },
    username: {
        type: String,
        required: [true, "Please provide a username."],
    },
    password: {
        type: String,
        minlength: [8, "Password min 8 characters"],
        trim: true,
        match: [
        /^(?!.*password).*$/,
        "Password cannot contain the word 'password'",
        ],   
    },
    lastUpdateUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide a userId."],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        //required: [true, "Please provide a categoryId"],        
    }
});

passKeysSchema.pre("save", async function (this: any, next: any) {
      if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password + process.env.PASSWORD_SECRET,10);
      }
      next();
});

passKeysSchema.methods.comparePassword = async function (this: any, password: string) {
  return await bcrypt.compare(password + process.env.PASSWORD_SECRET, this.password);
};


const PassKeys = mongoose.model<IPassKeys, IPassKeysModel>("PassKeys", passKeysSchema);

export default PassKeys;
