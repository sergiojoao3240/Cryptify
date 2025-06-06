import { ObjectId } from "mongoose"

export interface ICategory {
    id?: string
    name: string
    vaultId: ObjectId
}