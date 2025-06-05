//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

// Interfaces
import { IPinUser } from '../interfaces/pinUserInterface';

//_____________IMPORTS__________________

interface IPinUserModel extends mongoose.Model<IPinUser, {}>{};


const pinUserSchema = new mongoose.Schema<IPinUser, IPinUserModel>({
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide an idUser."],
    },
    pin: {
        type: String,
        required: [true, "Please provide a Pin"],        
    },
    finishDate: {
        type: Date,
    },
    createDate:{
        type: Date
    }

});

pinUserSchema.pre('save', async function (this: any, next: any) {
    this.createDate = Date.now();
    this.finishDate = new Date(this.createDate.getTime() + 5 * 60000);
    next()
})


const PinUser = mongoose.model<IPinUser, IPinUserModel>("PinUser", pinUserSchema);

export default PinUser;
