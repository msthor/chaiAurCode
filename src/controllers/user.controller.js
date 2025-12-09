import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
     try {
         const user = await User.findById(userId);
         const accessToken = await user.generateAccessToken();
         const refreshToken = await user.generateRefreshToken();
         user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

         return { accessToken, refreshToken };
     } catch (error) {
        throw new ApiError(500,"Token generation failed");
    }
};


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    // 1️⃣ VALIDATION
    if ([fullname, username, email, password].some(val => !val || val.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 2️⃣ DUPLICATE CHECK
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        const errors = [];
        if (existingUser.username === username) errors.push("Username already taken");
        if (existingUser.email === email) errors.push("Email already taken");

        throw new ApiError(400, "User already exists", errors);
    }

    // 3️⃣ FILE HANDLING
    const avatarLocal = req.files?.avatar?.[0]?.path;//req.files.avatar is an array
    const coverLocal = req.files?.coverImage?.[0]?.path; //req.files.coverImage is an array

    if (!avatarLocal) {
        throw new ApiError(400, "Avatar image is required");
    }

    // 4️⃣ CLOUDINARY UPLOAD
    const avatarUpload = await uploadOnCloudinary(avatarLocal);
    const coverUpload = coverLocal ? await uploadOnCloudinary(coverLocal) : null;

    if (!avatarUpload) throw new ApiError(500, "Avatar upload failed");

    // 5️⃣ CREATE USER
    const newUser = await User.create({
        username,
        email,
        fullname,
        password,
        avatar: avatarUpload.url,
        coverImage: coverUpload?.url || null
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Failed to create user");

    // 6️⃣ RESPONSE
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: createdUser
    });
});


const loggedInUser = asyncHandler(async (req, res) => {
    // req body
    // username or email
    // find user by username or email
    // password check
    // generate tokens
    // send cookies and response
    

    // req body
    const {email,username, password} = req.body;
    // username or email
    if(!username && !email){
        throw new ApiError(400,"username or email is required");
    }
    // find user by username or email
    const user = User.findOne({ $or: [ { username }, { email } ] })
    
    if(!user){
        throw new ApiError(404,"User not found");
    }
    // password check
    const isPasswordVaild = await user.isPasswordCorrect(password);
    if(!isPasswordVaild){
        throw new ApiError(401,"Invalid password");
    }
    // generate tokens 
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken (user._id);    
    
    const loggedInUser = User.findById(user._id).select("-password -refreshToken");
     // send cookies and response
    
     const options ={
        httpOnly:true,
        secure:true
     }
     

     return res
     .status(200)
     .cookie("refreshToken",refreshToken,options)
     .cookie("accessToken",accessToken,options)
     .json(
        new ApiResponse(200 , {
            user: loggedInUser,
            accessToken,
            refreshToken   
        }
        ,"User logged in successfully")
     )

});

const logoutUser = asyncHandler(async (req, res) => {

    // clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");  
 }
);

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { oldPassword, newPassword } = req.body;
    
//     const user = User.findById(req.user._id);

//     const isPasswordValid = await user.isPasswordCorrect(oldPassword);
//     if (!isPasswordValid) {
//         throw new ApiError(401, "Old password is incorrect");
//     }
//     user.password = newPassword;
//     await user.save({validateBeforeSave:false});   

//     return res.status(200).json(new ApiResponse(true, "Password changed successfully"));  

// });

// const getCurrent // 20:36 video no 18
// & previous video no 16 code also not writedd
export { registerUser
, loggedInUser, logoutUser
};
