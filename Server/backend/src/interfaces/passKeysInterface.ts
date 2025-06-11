import { Types } from "mongoose";

export interface IPassKeys {
    id?: Types.ObjectId
    vaultId: Types.ObjectId
    name: string,
    key?: string,
    iv?: string,
    username: string,
    password: string,
    lastUpdateUserId: Types.ObjectId
    categoryId: Types.ObjectId
}

export interface IPasskeysMethods {
    comparePassword(password: string): boolean
}