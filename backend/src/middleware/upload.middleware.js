const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Store file in memory buffer for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported file format: ${file.mimetype}. Allowed formats are JPEG, PNG, and WebP.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
    files: 10, // Max 10 files per upload request
  },
});

const uploadPropertyImages = upload.array("images", 10);
const uploadSingleImage = upload.single("image");

module.exports = {
  uploadPropertyImages,
  uploadSingleImage,
};
