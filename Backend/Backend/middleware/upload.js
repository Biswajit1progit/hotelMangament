const multer = require("multer");
const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Configure Cloudinary v1
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "set" : "missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "set" : "missing",
});

// ✅ Cloudinary Storage
/* const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "safarsetu/hotels",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
}); */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "safarsetu/hotels",
    format: file.mimetype.split("/")[1],
    public_id: Date.now() + "-" + file.originalname,
  }),
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP images allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;