import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure temp folder exists
const tempPath = "./public/temp";
if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Export the MULTER INSTANCE — NOT fields()
export const upload = multer({ storage });
