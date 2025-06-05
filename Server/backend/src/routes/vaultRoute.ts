//________________IMPORTS______________
// Node Modules
import express from "express";

// Controllers
import {
  createVault,
  getAllByParameters,
  getById,
  getAllMyVaults,
  deleteVaults,
  deleteVaultById,
  updateVaultById
} from "../controllers/vaultController";

// Middlewares
import { tokenValidation } from "../middleware/tokenValidation";

//________________IMPORTS______________

const router = express.Router();

router
  .route("/")
  .post(tokenValidation, createVault)
  .delete(tokenValidation, deleteVaults)
  .get(tokenValidation, getAllByParameters);

router.route("/me").get(tokenValidation, getAllMyVaults);

router
  .route("/:id")
  .get(tokenValidation, getById)
  .patch(tokenValidation, updateVaultById)
  .delete(tokenValidation, deleteVaultById);

export default router;
