import { Types } from "mongoose"

export interface ICategory {
    id?: Types.ObjectId
    name: string
    vaultId: Types.ObjectId
}