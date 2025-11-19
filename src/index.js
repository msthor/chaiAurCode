import express from "express";  
const app = express();
import { config } from "dotenv";
config(); 
import { connectDB } from "./db/index.js";

// Connect to the database
      connectDB()
        .then(() => {
            app.listen(process.env.PORT, ()=>{
                console.log(`Server is running on port ${process.env.PORT}`);
            })
        })
        .catch((error) => {
            console.log("Failed to start server due to database connection error", error);
        });


// import mongoose, { mongo }  from "mongoose";
// import { DB_NAME} from "./constants.js";

/* (async ()=>{
    try {
        await mongoose.connect(`${process.env.mongoDb_URI}/${DB_NAME}`)
        app.on("error", (err)=>{
            console.log("Error connecting to database", err);
            throw err;
        })
        console.log("Connected to database successfully");


        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error connecting to database", error);
    }
})()
*/