import { ObjectId } from "mongoose";

export interface ISharedPasskey {
    _id?: ObjectId
    passkey: string
    expiresAt: Date,
    viewsRemaining: number
    createdBy: ObjectId
}