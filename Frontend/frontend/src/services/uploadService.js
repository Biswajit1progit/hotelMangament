 import axios from "axios";

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload multiple images directly to Cloudinary from frontend
 * No backend involved — direct to Cloudinary CDN
 * Returns array of secure Cloudinary URLs
 */
export const uploadImagesToCloudinary = async (files, onProgress) => {
  const uploadPromises = files.map(async (file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "safarsetu/hotels");

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) onProgress(index, percent);
        },
      }
    );

    return res.data.secure_url; // ✅ returns https://res.cloudinary.com/...
  });

  return Promise.all(uploadPromises);
};