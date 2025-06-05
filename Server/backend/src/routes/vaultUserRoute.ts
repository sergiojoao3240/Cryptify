//________________IMPORTS______________
// Node Modules
import express from "express";

// Controllers
import {
    createVaultUser,
    getAllByParameters,
    getById,
    deleteVaultUser,
    deleteVaultUserById,
    updateVaultUserById,
    getAllVaultUserOfVault
} from "../controllers/vaultUserController";

// Middlewares
import { tokenValidation } from "../middleware/tokenValidation";

//________________IMPORTS______________

const router = express.Router();

router
  .route("/")
  .post(tokenValidation, createVaultUser)
  .delete(tokenValidation, deleteVaultUser)
  .get(tokenValidation, getAllByParameters);

router.route("/vault/:id").get(tokenValidation, getAllVaultUserOfVault);

router
  .route("/:id")
  .get(tokenValidation, getById)
  .patch(tokenValidation, updateVaultUserById)
  .delete(tokenValidation, deleteVaultUserById);

export default router;
