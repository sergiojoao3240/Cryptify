//_____________IMPORTS__________
// Node Models
import { Response, NextFunction } from "express";

// Models
import Vault from "../models/vaultModel";
import VaultUser from "../models/vaultUserModel";
import User from "../models/userModel";

//Utils
import asyncHandler from "../utils/async";
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import { advancedSearch } from "../utils/advancedSearch";
import { isUpdateValid } from "../utils/updateValidation";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

/* @desc        Create vaultUser
 * @route       POST /vaultUser
 * @access      Private
 */
const createVaultUser = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { vaultId, userId, role } = req.body;
    if (!vaultId || !userId || !role) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    let existVault = await Vault.findById(vaultId);
    if (!existVault) {
        return next(new ErrorResponse(`Vault not found`, 404));
    }

    let existUser = await User.findById(userId);
    if (!existUser) {
        return next(new ErrorResponse(`User not found`, 404));
    }

    /* Create vaultUser */
    const vaultUser = await VaultUser.create(req.body);
    if (!vaultUser) {
      return next(new ErrorResponse("Error creating vaultUser", 422));
    }

    return res.status(201).send(genMessage(201, vaultUser, req.newToken));
});


/* @desc        Get all vaultUsers registered
 * @route       GET /vaultUser
 * @access      Private
 */
const getAllByParameters = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const data: any = await advancedSearch(req, VaultUser);
    return res.status(200).json(genMessage(200, data, req.newToken));
});


/* @desc        Get vaultUser by ID
 * @route       GET /vaultUser/:id
 * @access      Private
 */
const getById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const mongoId = req.params.id;
    const userId = req.user!._id;
  
    const vaultUser = await VaultUser.findById(mongoId).populate('vaultId');
    if (!vaultUser) {
        return next(new ErrorResponse(`VaultUser not found`, 404));
    }

    let vault = vaultUser.vaultId;

    const isOwner = vault.ownerId.toString() == userId?.toString();

    const isInVault = await VaultUser.exists({ vaultId: vault, userId });

    const isSelf = vaultUser.userId.toString() === userId?.toString();

    if (!isOwner && !isInVault && !isSelf) {
        return next(new ErrorResponse(`Access denied`, 403));
    }
  
    return res.status(200).json(genMessage(200, vaultUser, req.newToken));
});


/* @desc        Delete all vaultUsers
 * @route       DELETE /vaultUser
 * @access      Private/admin
 */
const deleteVaultUser = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    await VaultUser.deleteMany();
    return res.status(204).json(genMessage(204, "All vaultUsers deleted from DB.", req.newToken));}
);


/* @desc        Delete vaultUser by ID
 * @route       GET /vaultUser/:id
 * @access      Private
 */
const deleteVaultUserById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const authenticated = req.user._id;

    const vaultUser = await VaultUser.findById(req.params.id);
    if (!vaultUser) {
        return res.status(404).send(genMessage(404, "VaultUser not Found!"))
    }

    const vault = await Vault.findById(vaultUser.vaultId);
    if (!vault) {
        return res.status(404).send(genMessage(404, "Vault not Found!"))  
    } 

    if (vault.ownerId == authenticated || authenticated == vaultUser.userId){
        await vaultUser.remove();
    } else {
        return res.status(403).send(genMessage(403, "Access Denied!"))  
    }

    return res.status(204).send(genMessage(204, `VaultUser ${req.params.id} removed successfully.`, req.newToken));
});


/* @desc        Update VaultUser by ID
 * @route       PATCH /vaultUser/:id
 * @access      Private
 */
const updateVaultUserById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["role"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }

    const authenticated = req.user!._id;
    const vaultUserId = req.params.id;

    const vaultUser = await VaultUser.findById(vaultUserId);
    if (!vaultUser) {
        return next(new ErrorResponse("VaultUser not found.", 404));
    }

    const vault = await Vault.findById(vaultUser.vaultId);
    if (!vault) {
        return next(new ErrorResponse("Vault not found.", 404));
    }

    if (vault.ownerId != authenticated) {
        return next(new ErrorResponse("You're not authorized to edit this VaultUser.", 403));
    }

    Object.keys(req.body).forEach((key) => {
        (vaultUser as any)[key] = req.body[key];
    });

    await vaultUser.save();
    
    res.status(200).send(genMessage(200, vaultUser, req.newToken));
});


/* @desc        Get all VaultUser of Vault
 * @route       GET /vaultUser/vault/:id
 * @access      Private
 */
const getAllVaultUserOfVault = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user!._id;
    const vaultId = req.params.id;
  
    const vault = await Vault.findById(vaultId);
    if (!vault) {
        return next(new ErrorResponse("Vault not found", 404));
    }

    const isOwner = vault.ownerId.toString() === userId!.toString();
    const isMember = await VaultUser.findOne({ vaultId, userId });

    if (!isOwner && !isMember) {
        return next(new ErrorResponse("You do not have permission to view this vault's users", 403));
    }

    const vaultUsers = await VaultUser.find({vaultId});
    if (!vaultUsers) {
        return next(new ErrorResponse("VaultUsers not Found", 404));
    }

    return res.status(200).json(genMessage(200, vaultUsers, req.newToken));
});


export {
  createVaultUser,
  getAllByParameters,
  getById,
  deleteVaultUser,
  deleteVaultUserById,
  updateVaultUserById,
  getAllVaultUserOfVault
};
