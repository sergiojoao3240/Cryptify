export interface Category {
    _id: string;
    name: string;
}

export interface Passkey {
    _id: string;
    username: string;
    password: string;
    vaultId: string;
    name: string;
    categoryId?: Category;
}

export interface Vault {
    _id: string;
    name: string;
}

export interface VaultUser {
    _id: string;
    vaultId: string;
    userId: string;
    role: string;
}