//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

// Interfaces
import { IVaultUser } from '../interfaces/vaultUserInterface';

//_____________IMPORTS__________________

interface IVaultUserModel extends mongoose.Model<IVaultUser, {}>{};


const vaultUserSchema = new mongoose.Schema<IVaultUser, IVaultUserModel>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide an userId."],
    },
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vault",
        required: [true, "Please provide a vaultId"],        
    },
    role: {
        type: String,
        enum: ["read", "readWrite"],
        required: [true, "Please provide a role"],        
    },
    createAt:{
        type: Date
    }
});

vaultUserSchema.pre('save', async function (this: any, next: any) {
    this.createDate = Date.now();
    next()
})

const VaultUser = mongoose.model<IVaultUser, IVaultUserModel>("VaultUser", vaultUserSchema);

export default VaultUser;
