import { Types } from "mongoose";

export interface IVaultUser {
    userId: Types.ObjectId,
    vaultId: Types.ObjectId,
    role: string
}