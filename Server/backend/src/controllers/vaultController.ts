//_____________IMPORTS__________
// Node Models
import { Response, NextFunction } from "express";

// Models
import Vault from "../models/vaultModel";
import VaultUser from "../models/vaultUserModel";

//Utils
import asyncHandler from "../utils/async";
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import { advancedSearch } from "../utils/advancedSearch";
import { isUpdateValid } from "../utils/updateValidation";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

/* @desc        Create vault 
 * @route       POST /vaults
 * @access      Private
 */
const createVault = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { name } = req.body;
    if (!name) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    /* Create vault */
    const vault = await Vault.create({
        ownerId: req.user._id,
        name
    });
    if (!vault) {
      return next(new ErrorResponse("Error creating vault", 422));
    }

    return res.status(201).send(genMessage(201, vault));
});


/* @desc        Get all vaults registered
 * @route       GET /vaults
 * @access      Private
 */
const getAllByParameters = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const data: any = await advancedSearch(req, Vault);
    return res.status(200).json(genMessage(200, data));
});


/* @desc        Get vault by ID
 * @route       GET /vault/:id
 * @access      Private
 */
const getById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const mongoId = req.params.id;
    const userId = req.user!._id;
  
    const ownerVault = await Vault.findOne({ _id: mongoId, ownerId: userId });
    if (ownerVault) {
      return res.status(200).json(genMessage(200, ownerVault));
    }
  
    const hasAccess = await VaultUser.find({ vaultId: mongoId, userId });
  
    if (!hasAccess) {
      return next(new ErrorResponse(`Vault not found or access denied`, 404));
    }
  
    const vault = await Vault.findById(mongoId);
    return res.status(200).json(genMessage(200, vault));
});


/* @desc        Delete all vaults
 * @route       DELETE /users
 * @access      Private/admin
 */
const deleteVaults = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    await Vault.deleteMany();
    return res.status(204).json(genMessage(204, "All vaults deleted from DB."));}
);


/* @desc        Delete vault by ID
 * @route       GET /users/:id
 * @access      Private
 */
const deleteVaultById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const isOwner = await Vault.findOne({_id: req.params.id, ownerId: req.user._id})
    if (isOwner) {
        /* Remove vault */
        await isOwner.remove();
        await VaultUser.deleteMany({vaultId: isOwner._id});
    } else {
        return res.status(404).send(genMessage(404, "Vault not Found!"))
    }

    return res.status(204).send(genMessage(204, `Vault ${isOwner._id} removed successfully.`));
});


/* @desc        Update Vault by ID
 * @route       PATCH /users/:id
 * @access      Private
 */
const updateVaultById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["name"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }

    const userId = req.user!._id;
    const vaultId = req.params.id;

    const vault = await Vault.findOne({ _id: vaultId, ownerId: userId });

    if (!vault) {
        return next(new ErrorResponse("Vault not found or you're not authorized to edit it.", 403));
    }

    Object.keys(req.body).forEach((key) => {
        (vault as any)[key] = req.body[key];
    });

    await vault.save();

    res.status(200).send(genMessage(200, vault));
});


/* @desc        Get all my Vaults 
 * @route       GET /vault/me
 * @access      Private
 */
const getAllMyVaults = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user!._id;
  
    const myVaults = await Vault.find({ ownerId: userId });
  
    const otherVault = await VaultUser.find({userId});

    const sharedVaultIds = otherVault.map(v => v._id);
    const sharedVaultDetails = await Vault.find({ _id: { $in: sharedVaultIds } });

    const allVaults = [...myVaults, ...sharedVaultDetails];

    return res.status(200).json(genMessage(200, allVaults));
});


export {
  createVault,
  getAllByParameters,
  getById,
  deleteVaults,
  deleteVaultById,
  updateVaultById,
  getAllMyVaults
};
