//_____________IMPORTS__________
// Node Models
import { Response, NextFunction } from "express";

// Models
import Category from "../models/categoryModel";
import Vault from "../models/vaultModel";
import VaultUser from "../models/vaultUserModel";

// Utils
import asyncHandler from "../utils/async";
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import { advancedSearch } from "../utils/advancedSearch";
import { isUpdateValid } from "../utils/updateValidation";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

/* @desc        Create category 
 * @route       POST /category
 * @access      Private
 */
const createCategory = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { name, vaultId } = req.body;
    if (!name || ! vaultId) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    const existVault = await Vault.findById(vaultId);
    if (!existVault){
        return next(new ErrorResponse("Vault not found", 404));
    }

    /* Create category */
    const category = await Category.create(req.body);
    if (!category) {
      return next(new ErrorResponse("Error creating category", 422));
    }

    return res.status(201).send(genMessage(201, category, req.newToken));
});


/* @desc        Get all categories registered
 * @route       GET /categpry
 * @access      Private
 */
const getAllByParameters = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const data: any = await advancedSearch(req, Category);
    return res.status(200).json(genMessage(200, data, req.newToken));
});


/* @desc        Get category by ID
 * @route       GET /category/:id
 * @access      Private
 */
const getById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const mongoId = req.params.id;
    const userId = req.user!._id;
  
    const category = await Category.findById(mongoId);
    if (!category) {
        return next(new ErrorResponse(`Category not found or access denied!`, 404));
    }
  
    let vault = await Vault.findById(category.vaultId);
    if (!vault) {
      return next(new ErrorResponse(`Vault not found`, 404));
    }

    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId: userId });

    if (vault.ownerId.toString() !== userId!.toString() && isInVault === false){
        return next(new ErrorResponse(`Category not found or access denied`, 404));
    }
  
    return res.status(200).json(genMessage(200, category, req.newToken));
});


/* @desc        Delete all categories
 * @route       DELETE /category
 * @access      Private/admin
 */
const deleteCategories = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    await Category.deleteMany();
    return res.status(204).json(genMessage(204, "All categories deleted from DB.", req.newToken));}
);


/* @desc        Delete category by ID
 * @route       GET /category/:id
 * @access      Private
 */
const deleteCategoryById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const category = await Category.findOne({_id: req.params.id});
    if (!category) {
        return next(new ErrorResponse(`Category not found!`, 404));
    }
    
    let vaultPermission = await Vault.findById(category.vaultId);
    if (!vaultPermission) {
        return next(new ErrorResponse(`Vault not found!`, 404));
    }

    if (req.user._id?.toString() == vaultPermission.ownerId.toString()) {
        /* Remove category */
        await category.remove();
    } else {
        return res.status(404).send(genMessage(404, "Access Denied!!"))
    }

    return res.status(204).send(genMessage(204, `Category ${category._id} removed successfully.`, req.newToken));
});


/* @desc        Update Category by ID
 * @route       PATCH /category/:id
 * @access      Private
 */
const updateCategoryById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["name"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }

    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorResponse("Category not found.", 403));
    }

    let vaultPermission = await Vault.findById(category.vaultId);
    if (!vaultPermission) {
        return next(new ErrorResponse(`Vault not found!`, 404));
    }

    if (req.user._id == vaultPermission.ownerId) {
        /* Remove category */
        Object.keys(req.body).forEach((key) => {
            (category as any)[key] = req.body[key];
        });
    
        await category.save();

    } else {
        return res.status(404).send(genMessage(404, "Access Denied!!"))
    }

    res.status(200).send(genMessage(200, category, req.newToken));
});


/* @desc        Get all my Vaults 
 * @route       GET /category/vault/:id
 * @access      Private
 */
const getAllCategoriesOfVaultiD = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user!._id;

    const vault = await Vault.findById(req.params.id);
    if (!vault) {
        return next(new ErrorResponse("Vault not found.", 403));
    }
  
    const allCategories = await Category.find({ vaultId: vault._id });

    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId });

    if (userId.toString() != vault.ownerId.toString() && isInVault === false) {
        return next(new ErrorResponse("Access Denied!.", 403));
    }

    return res.status(200).json(genMessage(200, allCategories, req.newToken));
});


export {
  createCategory,
  getAllByParameters,
  getById,
  deleteCategories,
  deleteCategoryById,
  updateCategoryById,
  getAllCategoriesOfVaultiD
};
