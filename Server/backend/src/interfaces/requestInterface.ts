import { Request } from "express";
import { IUser } from "./userInterface";

interface RequestExt extends Request {
    newToken: string;
    sessionID?: string;
    user: IUser;
    files?: any
}

export { RequestExt }
