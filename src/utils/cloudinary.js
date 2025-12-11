import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath);

    return result;

  } catch (err) {
    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath);
    console.error("Cloudinary Upload Error:", err);
    return null;
  }
};

// DELETE OLD IMAGE
const deleteFromCloudinaryByUrl = async (cloudinaryUrl) => {
  if (!cloudinaryUrl) return;

  try {
    const parts = cloudinaryUrl.split("/");
    const filename = parts[parts.length - 1];  // abcxyz.png
    const publicId = filename.split(".")[0];   // abcxyz

    await cloudinary.uploader.destroy(publicId);

  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
  }
};

export { uploadOnCloudinary, deleteFromCloudinaryByUrl };
