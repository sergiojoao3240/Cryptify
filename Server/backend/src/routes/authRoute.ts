//_____________IMPORTS_______________
// Node Modules
import express from "express";

// Controllers
import { login, logout, validateLogin, updateToken, refreshToken } from "../controllers/authController";
//_____________IMPORTS_______________

const router = express.Router();

router.post("/login", login);
router.route("/logout/:id").get(logout);
router.route("/validate").post(validateLogin);
router.route("/update").post(updateToken);
router.route("/refresh").post(refreshToken);

export default router;