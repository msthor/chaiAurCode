import mongoose from "mongoose";
import Video from "./video.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },    
  email:    {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
    },
    fullName: {
    type: String,
    required: true,
    trim: true,
    },
    avatar: {
    type: String,//cloudinary url
    // default: "https://avatar.iran.liara.run/public/18",
    // required: true
    },
    coverImage:{
    type: String,//cloudinary url
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
    type: String,
    required: ["password is required",true],  
    },
    refreshToken: {
    type: String,
    },
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,    
        email: this.email,
        fullName: this.fullName
}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

const User = mongoose.model("User", userSchema);    
export default User;
