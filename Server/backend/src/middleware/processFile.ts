//_____________IMPORTS__________
// Node Models
import multer from "multer";
import { Request } from "express";

// Utils
import ErrorResponse from "../utils/response/errorResponse";

//_____________IMPORTS__________

export const uploadFile = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: function(req: Request, file: Express.Multer.File, cb: any) {
        file.originalname.endsWith("json") ? cb(null, true):
        cb(new ErrorResponse("Wrong file type. Only .json is acceptable", 400), false);
    }
}).single("file");