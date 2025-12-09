import mongoose from "mongoose";
// import User from "./models/user.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String, // cloudinary url
        required: true  
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String, // cloudinary url
        required: true
    },
    duration: {
        type: Number, // duration in seconds
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPubliced: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
} , { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);
export default Video;