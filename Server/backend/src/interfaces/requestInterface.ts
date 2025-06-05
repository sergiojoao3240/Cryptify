import { Request } from "express";
import { IUser } from "./userInterface";

interface RequestExt extends Request {
    newAccessToken: string;
    sessionID?: string;
    user: IUser;
    files?: any
}

export { RequestExt }
