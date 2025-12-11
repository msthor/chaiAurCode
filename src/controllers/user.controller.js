import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary,deleteFromCloudinaryByUrl } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Token generator
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// REGISTER USER

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;//req.body insted of req.params because data comes from body not url req.params used where like /:id 

    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const exist = await User.findOne({ $or: [{ username }, { email }] });

    if (exist) throw new ApiError(400, "User already exists");

    const avatarLocal = req.files?.avatar?.[0]?.path;
    const coverLocal = req.files?.coverImage?.[0]?.path;

    if (!avatarLocal) throw new ApiError(400, "Avatar is required");

    const avatarUpload = await uploadOnCloudinary(avatarLocal);
    const coverUpload = coverLocal ? await uploadOnCloudinary(coverLocal) : null;

    const user = await User.create({
        username,
        email,
        fullName,
        password,
        avatar: avatarUpload.url,
        coverImage: coverUpload?.url || null
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// LOGIN USER
const loggedInUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) throw new ApiError(404, "User not found");

    const validPassword = await user.isPasswordCorrect(password);
    if (!validPassword) throw new ApiError(401, "Invalid password");

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    const sanitizedUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200,
                { user: sanitizedUser, accessToken, refreshToken },
                "User logged in successfully")
        );
});

// LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true   // <--- options must be separate 3rd argument
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        
    };
    

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
}); 

 const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id);

        if (!user) {
            throw new ApiError(404, "Invalid refresh token - user not found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token expired or invalid");
        }

        // generate new tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: false, // IMPORTANT: must be false on localhost
            sameSite: "lax"
        };

        return res
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Token refreshed successfully"
                )
            );

    } catch (err) {
        throw new ApiError(401, err.message || "Could not refresh token");
    }
});



const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    
    const user = User.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
     if (!isPasswordValid) {
        throw new ApiError(401, "Old password is incorrect");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});   

    return res.status(200).json(new ApiResponse(true, "Password changed successfully"));  

});


// get current user bcause req.user is there from auth middleware
 const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
   });
 

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;
    if(!email || !fullName){
        throw new ApiError(400, "email and fullName are required");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                email:email ,   
                fullName
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account details updated successfully"));

});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const user = await User.findById(req.user._id);

    // Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
        throw new ApiError(500, "Could not upload avatar image");
    }

    // DELETE OLD AVATAR
    if (user.avatar) {
        await deleteFromCloudinaryByUrl(user.avatar);
    }

    // UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avatar updated successfully")
    );
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }

    const user = await User.findById(req.user._id);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.url) {
        throw new ApiError(500, "Could not upload cover image");
    }

    // DELETE OLD COVER IMAGE
    if (user.coverImage) {
        await deleteFromCloudinaryByUrl(user.coverImage);
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(404, "Username is required");
    }

    const sanitizedUsername = username.toLowerCase();

    const channel = await User.aggregate([
        {
            $match: {
                username: sanitizedUsername
            }
        },
        {
            // Who has subscribed to this user?
            $lookup: {
                from: "subscriptions",
                localField: "_id", 
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // Which channels this user has subscribed to?
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id || null,
                                "$subscribers.subscriber"
                            ]
                        },
                        then: true,
                        else: false
                    }
                             
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.aggregate([
        {
            $match: { _id: userId }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },

        {
            $project: {
                watchHistory: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0]?.watchHistory || [],
                "Watch history fetched successfully"
            )
        );
});



export {
    registerUser,
    loggedInUser,
    logoutUser,
    refreshAccessToken ,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};