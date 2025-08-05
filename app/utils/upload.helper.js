const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  },
});

// File filter (optional - restrict file types)
const fileFilter = (req, file, cb) => {
  // Example: accept only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Max file size (optional)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

const fileUpload = multer({ storage, fileFilter, limits });

module.exports = fileUpload;
