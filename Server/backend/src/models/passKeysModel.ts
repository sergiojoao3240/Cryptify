//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

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
    key: {
        type: String,
        //required: [true, "Please provide a key"],        
    },
    iv: {
        type: String,
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


const PassKeys = mongoose.model<IPassKeys, IPassKeysModel>("PassKeys", passKeysSchema);

export default PassKeys;
