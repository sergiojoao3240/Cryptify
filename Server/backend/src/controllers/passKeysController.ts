//_____________IMPORTS__________
// Node Models
import { Response, NextFunction } from "express";
import * as crypto from 'crypto';
import axios from "axios";

// Models
import Category from "../models/categoryModel";
import Vault from "../models/vaultModel";
import VaultUser from "../models/vaultUserModel";
import PassKeys from "../models/passKeysModel";
import SharedPasskey from "../models/sharedPasskeyModel";

// Utils
import asyncHandler from "../utils/async";
import { genMessage } from "../utils/response/messageResponse";
import ErrorResponse from "../utils/response/errorResponse";
import { advancedSearch } from "../utils/advancedSearch";
import { isUpdateValid } from "../utils/updateValidation";
import { generatePasswordFromQuery } from "../utils/generatepassword";
import { Email } from "../utils/nodemailer/email";

// Interfaces
import { RequestExt } from "../interfaces/requestInterface";

//_____________IMPORTS__________

/* @desc        Create passkey 
 * @route       POST /passkeys
 * @access      Private
 */
const createPassKey = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { name, vaultId, username, password: inputPassword, categoryId } = req.body;
    let password = inputPassword;

    if (!name || !vaultId || !username /*|| !password*/) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    const existVault = await Vault.findById(vaultId);
    if (!existVault){
        return next(new ErrorResponse("Vault not found", 404));
    }

    const isOwner = existVault.ownerId.toString() === req.user._id!.toString();

    const hasPermission = await VaultUser.findOne({
        vaultId: vaultId,
        userId: req.user._id,
        role: "readWrite"
    });

    if (!isOwner && !hasPermission) {
        return next(new ErrorResponse("Permission Denied", 403));
    }

    if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new ErrorResponse("Error creating category", 422));
        }
    }

    if(req.query && !password) {
        try {
            password = generatePasswordFromQuery(req.query);
            if (!password) {
                return next(new ErrorResponse("Password failed to generate.", 400));
            }
        } catch (err: any) {
            return next(new ErrorResponse(err.message, 400));
        }       
    }

    let checkPasswordExpose = await checkPasswordPwned(password);
    if (checkPasswordExpose > 0) {
        return next(new ErrorResponse(`This password has been seen ${checkPasswordExpose} times before in data breaches! Please try another one!.`, 400));
    }

    const keyRaw = `${req.user._id}-${vaultId}`;
    const key = crypto.createHash('sha256').update(keyRaw).digest('base64').substr(0, 32);
    const iv = crypto.randomBytes(16);
    let encrypted: string;
    let forceCreate = req.query.force === "true";

    // Check if password is in use in other passkey in the same vault 
    if (!forceCreate) {
        const existing = await PassKeys.findOne({ vaultId, hash: key });
        if (existing) {
            return res.status(200).json({
                warning: "Password already used in this vault.",
                message: "Do you want to continue anyway? Use '?force=true' to skip this warning.",
                existingPasskeyId: existing._id
            });
        }
    }

    // Encrypt Password
    const cipher = crypto.createCipheriv(process.env.ALGORITHM!, key, iv);
    encrypted = cipher.update(password, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    /* Create passkey */
    const passkey = await PassKeys.create({
        name,
        username,
        password: encrypted,
        vaultId,
        hash: key,
        key: keyRaw,
        iv: iv.toString('hex'),
        lastUpdateUserId: req.user._id,
        ...(categoryId && { categoryId })
    });
    if (!passkey) {
        return next(new ErrorResponse("Error creating passkey", 422));
    }

    return res.status(201).send(genMessage(201, passkey, req.newToken));
});


/* @desc        Get all passkeys registered
 * @route       GET /passkeys
 * @access      Private
 */
const getAllByParameters = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const data: any = await advancedSearch(req, PassKeys);
    return res.status(200).json(genMessage(200, data, req.newToken));
});


/* @desc        Get passkey by ID
 * @route       GET /passkeys/:id
 * @access      Private
 */
const getById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const passkeyID = req.params.id;
    const userId = req.user!._id;
  
    const passkey = await PassKeys.findById(passkeyID).populate('categoryId', 'name');
    if (!passkey) {
        return next(new ErrorResponse(`Passkey not found or access denied!`, 404));
    }
  
    let vault = await Vault.findById(passkey.vaultId);
    if (!vault) {
      return next(new ErrorResponse(`Vault not found`, 404));
    }

    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId: userId });

    if (vault.ownerId.toString() === userId!.toString() || isInVault === true){
        const keyRaw = passkey.key;
        const key = crypto.createHash('sha256').update(keyRaw!).digest('base64').substr(0, 32);
        const iv = Buffer.from(passkey.iv!, 'hex');

        const decipher = crypto.createDecipheriv(process.env.ALGORITHM!, key, iv);
        let decrypted = decipher.update(passkey.password, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        passkey.password = decrypted;
    }

    let finalPassKey = passkey.toJSON();
    delete finalPassKey.iv;
    delete finalPassKey.key;
    delete finalPassKey.hash;
  
    return res.status(200).json(genMessage(200, finalPassKey, req.newToken));
});


/* @desc        Delete all passkeys
 * @route       DELETE /passkeys
 * @access      Private/admin
 */
const deletePasskeys = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    await PassKeys.deleteMany();
    return res.status(204).json(genMessage(204, "All passkeys deleted from DB.", req.newToken));}
);


/* @desc        Delete passkey by ID
 * @route       GET /passekeys/:id
 * @access      Private
 */
const deletePasskeyById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const passkey = await PassKeys.findOne({_id: req.params.id});
    if (!passkey) {
        return next(new ErrorResponse(`Category not found!`, 404));
    }
    
    let vaultPermission = await VaultUser.findOne({ vaultId:passkey.vaultId, userId: req.user._id, role: "readWrite" });

    let vault = await Vault.findById(passkey.vaultId);
    if (!vault) {
        return next(new ErrorResponse(`Vault not Found!`, 404));
    }

    if (vaultPermission || vault.ownerId.toString() == req.user._id?.toString()) {  
        /* Remove passkey */
        await passkey.remove();    
    } else {
        return res.status(404).send(genMessage(403, "Access Denied!!"))
    }

    return res.status(204).send(genMessage(204, `Passkey ${passkey._id} removed successfully.`, req.newToken));
});


/* @desc        Update Passkey by ID
 * @route       PATCH /passkeys/:id
 * @access      Private
 */
const updatePasskeyById = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    /* Checks if the values to be updated by client are the ones expected by server */
    const allowedUpdates = ["name", "password", "categoryId", "username"];
    if (!isUpdateValid(req.body, allowedUpdates)) {
      return next(new ErrorResponse("Invalid update options provided.", 400, "InputError"));
    }

    const passkeyId = req.params.id;

    const passkey = await PassKeys.findById(passkeyId);
    if (!passkey) {
        return next(new ErrorResponse("Passkey not found.", 403));
    }

    const vault = await Vault.findById(passkey.vaultId);
    if (!vault) {
        return next(new ErrorResponse("Vault not Found!", 404));
    }

    const isOwner = vault.ownerId.toString() === req.user._id!.toString();
    const hasPermission = await VaultUser.findOne({
        vaultId: passkey.vaultId,
        userId: req.user._id,
        role: "readWrite"
    });

    if (!isOwner && !hasPermission) {
        return next(new ErrorResponse("Access Denied!", 403));
    }

    if (req.body.categoryId) {
        const category = await Category.findOne({ _id: req.body.categoryId, vaultId: passkey.vaultId});
        if (!category) {
            return next(new ErrorResponse("Invalid category.", 400));
        }
    }

    if (req.body.password) {
        let password = req.body.password;
        if (password === undefined && req.query && req.body.password !== "") {
            try {
                password = generatePasswordFromQuery(req.query);
            } catch (err: any) {
                return next(new ErrorResponse(err.message, 400));
            }
        }

        let checkPasswordExpose = await checkPasswordPwned(password);
        if (checkPasswordExpose > 0) {
            return next(new ErrorResponse(`This password has been seen ${checkPasswordExpose} times before in data breaches! Please try another one!.`, 400));
        }

        if (password) {
            const keyRaw = passkey.key;
            const key = crypto.createHash('sha256').update(keyRaw!).digest('base64').substr(0, 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(process.env.ALGORITHM!, key, iv);
            let encrypted = cipher.update(password, 'utf-8', 'hex');
            encrypted += cipher.final('hex');

            passkey.password = encrypted;
            passkey.iv = iv.toString('hex');
        }
    } 

    if (req.body.name) passkey.name = req.body.name;
    if (req.body.username) passkey.username = req.body.username;
    if (req.body.categoryId) passkey.categoryId = req.body.categoryId;
    passkey.lastUpdateUserId = req.user._id!;

    await passkey.save();

    res.status(200).send(genMessage(200, passkey, req.newToken));
});


/* @desc        Get all my passkeys's Vaults 
 * @route       GET /passkeys/vault/:id
 * @access      Private
 */
const getAllPasskeysOfVaultID = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user._id!;

    const vault = await Vault.findById(req.params.id);
    if (!vault) {
        return next(new ErrorResponse("Vault not found.", 404));
    }
  
    const allPasskeys = await PassKeys.find({ vaultId: vault._id }).populate('categoryId', 'name');

    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId });

    if (userId.toString() != vault.ownerId.toString() && isInVault === false) {
        return next(new ErrorResponse("Access Denied!.", 403));
    }

    const sanitizedPasskeys = allPasskeys.map(pk => {
        const passKeyObj = pk.toJSON();
        delete passKeyObj.hash;
        delete passKeyObj.key;
        delete passKeyObj.iv;
        return passKeyObj;
    });

    return res.status(200).json(genMessage(200, sanitizedPasskeys, req.newToken));
});


/* @desc        Export passkeys's Vaults 
 * @route       GET /passkeys/export/vault/:id
 * @access      Private
 */
const exportAllPasskeysOfVaultID = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user._id!;

    const vault = await Vault.findById(req.params.id);
    if (!vault) {
        return next(new ErrorResponse("Vault not found.", 403));
    }
  
    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId });

    if (userId.toString() != vault.ownerId.toString() && isInVault === false) {
        return next(new ErrorResponse("Access Denied!.", 403));
    }

    const allPasskeys = await PassKeys.find({ vaultId: vault._id });

    const decryptedPasskeys = allPasskeys.map(pk => {
            const key = crypto.createHash('sha256').update(pk.key!).digest('base64').substr(0, 32);
            const iv = Buffer.from(pk.iv!, 'hex');
            const decipher = crypto.createDecipheriv(process.env.ALGORITHM!, key, iv);
            let decrypted = decipher.update(pk.password, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');

            return {
                name: pk.name,
                username: pk.username,
                password: decrypted,
                categoryId: pk.categoryId || null
            };
    });

    return res.status(200)
    .setHeader("Content-Disposition", `attachment; filename=passkeys-${vault._id}.json`)
    .json(decryptedPasskeys);
});


/* @desc        Import passkeys's Vaults 
 * @route       Post /passkeys/import/vault/:id
 * @access      Private
 */
const importPasskeysToVaultID = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    
    const userId = req.user._id!;

    const vault = await Vault.findById(req.params.id);
    if (!vault) {
        return next(new ErrorResponse("Vault not found.", 404));
    }
  
    const isInVault = await VaultUser.exists({ vaultId: vault._id, userId });

    if (userId.toString() != vault.ownerId.toString() && isInVault === false) {
        return next(new ErrorResponse("Access Denied!.", 403));
    }

    if (!req.file) return next(new ErrorResponse("No file uploaded", 400));

    let imported;
    try {
        imported = JSON.parse(req.file.buffer.toString('utf-8'));
    } catch {
        return next(new ErrorResponse("Invalid JSON format", 422));
    }

    const keyRaw = `${req.user._id}-${req.params.id}`;
    const key = crypto.createHash('sha256').update(keyRaw).digest('base64').substr(0, 32);

    const prepared = imported.map((item: any) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(process.env.ALGORITHM!, key, iv);
        let encrypted = cipher.update(item.password, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        return {
            name: item.name,
            username: item.username,
            password: encrypted,
            vaultId: req.params.id,
            key: keyRaw,
            iv: iv.toString('hex'),
            lastUpdateUserId: req.user._id,
        };
    });

    await PassKeys.insertMany(prepared);

    return res.status(201).send(genMessage(201, `${prepared.length} passkeys imported`, req.newToken));

});


/**
 * Verifica se a password foi comprometida com base no serviço Pwned Passwords.
 * @param password - A password a verificar.
 * @returns Número de vezes que a password apareceu em vazamentos (0 = não encontrada).
 */
export async function checkPasswordPwned(password: string): Promise<number> {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);

    const lines = response.data.split('\n');

    for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
            return parseInt(count, 10); // foi encontrada!
        }
    }

    return 0
}


/* @desc        Create sharedpasskey 
 * @route       POST /passkey/shared
 * @access      Private
 */
const createSharedPassKey = asyncHandler(async (req: RequestExt, res: Response, next: NextFunction) => {
    const { idPasskey, emailDest } = req.body;
    
    if (!idPasskey || !emailDest) {
      return next(new ErrorResponse("Missing required field in the request", 400, "InputError"));
    }

    const existPasskey = await PassKeys.findById(idPasskey);
    if (!existPasskey){
        return next(new ErrorResponse("Passkey not found", 404));
    }

    const existVault = await Vault.findById(existPasskey.vaultId);
    if (!existVault){
        return next(new ErrorResponse("Vault not found", 404));
    }

    const isOwner = existVault.ownerId.toString() === req.user._id!.toString();

    const hasPermission = await VaultUser.findOne({
        vaultId: existPasskey.vaultId,
        userId: req.user._id,
        role: "readWrite"
    });

    if (!isOwner && !hasPermission) {
        return next(new ErrorResponse("Permission Denied", 403));
    }

    
    /* Create sharedPasskey */
    const sharedPasskey = await SharedPasskey.create({
        passkey: existPasskey.password,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        viewsRemaining: 1,
        createdBy: req.user._id
    });
    if (!sharedPasskey) {
        return next(new ErrorResponse("Error creating sharedPasskey", 422));
    }

    let link = `https://api.cryptify.ss-centi.com/passkeys/shared/${sharedPasskey._id.toString()}`;

    Email(emailDest, "Share Password", "SharedPasskey", "", link)

    return res.status(201).send(genMessage(201, sharedPasskey, req.newToken));
});



// função para abrir o link e desencriptar a password -> por terminar
export const getShareData = asyncHandler(async (req: any, res: any, next: any) => {
    const { id } = req.params;
    const share = await SharedPasskey.findById(id);
  
    if (!share || share.expiresAt < new Date() || share.viewsRemaining < 1) {
      return res.status(410).json({ message: 'Expired link or used.' });
    }
  
    share.viewsRemaining -= 1;
    await share.save();

    // Falta desencriptar a palavra passe e enviar
    // const keyRaw = passkey.key;
    // const key = crypto.createHash('sha256').update(keyRaw!).digest('base64').substr(0, 32);
    // const iv = Buffer.from(passkey.iv!, 'hex');

    // const decipher = crypto.createDecipheriv(process.env.ALGORITHM!, key, iv);
    // let decrypted = decipher.update(passkey.password, 'hex', 'utf-8');
    // decrypted += decipher.final('utf-8');
    // passkey.password = decrypted;
  
    res.json({ data: share.passkey });
  });
  

export {
  createPassKey,
  getAllByParameters,
  getById,
  deletePasskeys,
  deletePasskeyById,
  updatePasskeyById,
  getAllPasskeysOfVaultID,
  exportAllPasskeysOfVaultID,
  importPasskeysToVaultID
};



