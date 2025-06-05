//_____________IMPORTS____________
// Mongoose
import mongoose from 'mongoose';

//_____________IMPORTS____________


// start connection with mongo DB
export async function connectTo_Mongoose(serverURL: string, MONGO_DB: string) {
    try {
        await mongoose.connect(`${serverURL}${MONGO_DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        
        console.log(`MONGODB SUCCESS \t DB URL:\t ${process.env.MONGO_URL}${process.env.MONGO_DB}`.green);
    } catch (error: any) {
        console.log(`MONGODB ERROR \t DB URL:\t ${process.env.MONGO_URL}${process.env.MONGO_DB}\nError:${error.message}`.red);
    }
}

export async function close_mongoose() {
    await mongoose.connection.close();
}
