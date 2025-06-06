import { Types } from "mongoose";

interface IPinUser {
    idUser: Types.ObjectId,
    pin: string,
    finishDate: Date,
    createDate?: Date,
}

export { IPinUser }