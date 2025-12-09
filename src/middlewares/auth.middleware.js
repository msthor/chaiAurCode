import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try{
        const token =  req.cookies?.accessToken||req.headers
     ("authorization")?.replace("Bearer ","") ;
      if (!token) {
        throw new ApiError(401, "Unathorized token");
      }
     const decodeToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
     
     if(!user){
        throw new ApiError(401, "invalid token ");
     }
        req.user = user;//attach user to req object bcoz we will need it in next middlewares or controllers
     next();
    }catch(error){
        throw new ApiError(401, error?.message || "Unathorized token");
    }
   
});