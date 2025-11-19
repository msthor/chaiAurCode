 import mongoose from "mongoose";
import { DB_NAME} from "../constants.js";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.mongoDb_URI}/${DB_NAME}`);
        console.log("Connected to database successfully");
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
}