import { Types } from "mongoose";

export interface IPassKeys {
    id?: Types.ObjectId
    vaultId: Types.ObjectId
    name: string,
    hash?: string,
    key?: string,
    iv?: string,
    username: string,
    password: string,
    lastUpdateUserId: Types.ObjectId
    categoryId: Types.ObjectId
}