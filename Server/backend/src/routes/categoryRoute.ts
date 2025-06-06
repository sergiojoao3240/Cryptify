//________________IMPORTS______________
// Node Modules
import express from "express";

// Controllers
import {
    createCategory,
    getAllByParameters,
    getById,
    deleteCategories,
    deleteCategoryById,
    updateCategoryById,
    getAllCategoriesOfVaultiD
} from "../controllers/categoryController";

// Middlewares
import { tokenValidation } from "../middleware/tokenValidation";

//________________IMPORTS______________

const router = express.Router();

router
  .route("/")
  .post(tokenValidation, createCategory)
  //.delete(tokenValidation, deleteCategories)
  .get(tokenValidation, getAllByParameters);

router.route("/vault/:id").get(tokenValidation, getAllCategoriesOfVaultiD);

router
  .route("/:id")
  .get(tokenValidation, getById)
  .patch(tokenValidation, updateCategoryById)
  .delete(tokenValidation, deleteCategoryById);

export default router;
