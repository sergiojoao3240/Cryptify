//_____________IMPORTS_______________
// Node Modules
import express from "express";

// Controllers
import { login, logout, validateLogin } from "../controllers/authController";
//_____________IMPORTS_______________

const router = express.Router();

router.post("/login", login);
router.route("/logout/:id").get(logout);
router.route("/validate").post(validateLogin);

export default router;