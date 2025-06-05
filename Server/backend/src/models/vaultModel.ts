//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

// Interfaces
import { IVault } from '../interfaces/vaultInterface';

//_____________IMPORTS__________________

interface IVaultModel extends mongoose.Model<IVault, {}>{};


const vaultSchema = new mongoose.Schema<IVault, IVaultModel>({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide an ownerId."],
    },
    name: {
        type: String,
        required: [true, "Please provide a name"],        
    },
    createAt:{
        type: Date
    }

});

vaultSchema.pre('save', async function (this: any, next: any) {
    this.createDate = Date.now();
    next()
})

const Vault = mongoose.model<IVault, IVaultModel>("Vault", vaultSchema);

export default Vault;
