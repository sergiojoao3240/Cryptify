import { Types } from "mongoose";

export interface IVault {
    name: string,
    ownerId: Types.ObjectId,
    createdAt: Date
}