//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

// Interfaces
import { ISharedPasskey } from '../interfaces/sharedPasskey';

//_____________IMPORTS__________________

interface ISharedPasskeyModel extends mongoose.Model<ISharedPasskey, {}>{};


const sharedPasskeySchema = new mongoose.Schema<ISharedPasskey, ISharedPasskeyModel>({
    passkey: { 
        type: String, 
        required: true 
    },
    expiresAt: {
        type: Date,
        required: true 
    },
    viewsRemaining: {
        type: Number, 
        default: 1 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { 
    timestamps: true 
});

const SharedPasskey = mongoose.model<ISharedPasskey, ISharedPasskeyModel>("SharedPsskey", sharedPasskeySchema);

export default SharedPasskey;
