//________________IMPORTS______________
// Node Modules
import express from "express";

// Controllers
import {
  createUser,
  getById,
  getAllByParameters,
  deleteUserById,
  updateUserById,
  deleteUsers,
  forgotPassword,
  pinValidation,
  changePassword,
  updatePassword,
} from "../controllers/userController";

// Middlewares
import { tokenValidation } from "../middleware/tokenValidation";

//________________IMPORTS______________

const router = express.Router();

router
  .route("/")
  .post(createUser)
  .delete(tokenValidation, deleteUsers)
  .get(tokenValidation, getAllByParameters);

router.route("/forgotPassword").post(forgotPassword);

router.route("/pinValidation").post(pinValidation);

router.route("/changePassword/:email").patch(changePassword);

router.route("/updatePassword/:email").patch(tokenValidation, updatePassword);

router
  .route("/:id")
  .get(tokenValidation, getById)
  .patch(tokenValidation, updateUserById)
  .delete(tokenValidation, deleteUserById);

export default router;
