//________________IMPORTS______________
// Node Modules
import express from "express";

// Controllers
import {
    createPassKey,
    getAllByParameters,
    getById,
    deletePasskeys,
    deletePasskeyById,
    updatePasskeyById,
    getAllPasskeysOfVaultID,
    exportAllPasskeysOfVaultID,
    importPasskeysToVaultID
} from "../controllers/passKeysController";

// Middlewares
import { tokenValidation } from "../middleware/tokenValidation";
import { uploadFile } from "../middleware/processFile";

//________________IMPORTS______________

const router = express.Router();

router
  .route("/")
  .post(tokenValidation, createPassKey)
  //.delete(tokenValidation, deleteCategories)
  .get(tokenValidation, getAllByParameters);

router.route("/vault/:id").get(tokenValidation, getAllPasskeysOfVaultID);

router.route("/export/vault/:id").get(tokenValidation, exportAllPasskeysOfVaultID);
router.route("/import/vault/:id").post(tokenValidation, uploadFile, importPasskeysToVaultID);

router
  .route("/:id")
  .get(tokenValidation, getById)
  .patch(tokenValidation, updatePasskeyById)
  .delete(tokenValidation, deletePasskeyById);

export default router;
