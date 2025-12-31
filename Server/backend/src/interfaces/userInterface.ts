import { Types } from "mongoose"

interface IUser {
    email: string,
    name: string,
    password?: string,
    refresh_token?: string,
    createdAt?: Date,
    _id?: Types.ObjectId
}

interface IUserMethods {
    generateRefreshToken(): string,
    refreshTokenValid(): boolean,
    comparePassword(password: string): boolean
}

export { IUser, IUserMethods }
