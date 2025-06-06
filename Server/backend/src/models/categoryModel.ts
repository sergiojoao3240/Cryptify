//_____________IMPORTS__________________
// Node Modules
import mongoose from 'mongoose';

// Interfaces
import { ICategory } from '../interfaces/categoryinterface';

//_____________IMPORTS__________________

interface ICategoryModel extends mongoose.Model<ICategory, {}>{};


const categorySchema = new mongoose.Schema<ICategory, ICategoryModel>({
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vault",
        required: [true, "Please provide a vaultId."],
    },
    name: {
        type: String,
        required: [true, "Please provide a name"],        
    }
});

const Category = mongoose.model<ICategory, ICategoryModel>("Category", categorySchema);

export default Category;
