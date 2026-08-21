const cloudinary = require("../config/cloudinary");
const config = require("../config");

/**
 * Extracts Cloudinary publicId from a secure URL.
 * @param {string} url 
 * @returns {string|null}
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Everything after upload/[v123456/] is the public_id + extension
    const pathAfterUpload = parts.slice(uploadIndex + 1);
    // Ignore version segment if present (e.g. v1787233405)
    const relevantParts = pathAfterUpload[0].startsWith("v")
      ? pathAfterUpload.slice(1)
      : pathAfterUpload;

    const fullPathWithExt = relevantParts.join("/");
    // Remove extension (.jpg, .webp, etc.)
    const publicId = fullPathWithExt.substring(
      0,
      fullPathWithExt.lastIndexOf(".")
    );
    return publicId || null;
  } catch (err) {
    return null;
  }
};

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * @param {Buffer} buffer File buffer from Multer memoryStorage
 * @param {string} [folder="properties"] Cloudinary destination folder
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadImageStream = (buffer, folder = "properties") => {
  return new Promise((resolve, reject) => {
    // Fallback if Cloudinary credentials are not configured yet
    if (
      !config.cloudinary.cloudName ||
      !config.cloudinary.apiKey ||
      !config.cloudinary.apiSecret
    ) {
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const mockUrl = `https://res.cloudinary.com/rental-platform/image/upload/v1/${folder}/${mockId}.webp`;
      console.warn(
        `[CLOUDINARY WARNING] Cloudinary credentials missing in .env. Generated mock image URL: ${mockUrl}`
      );
      return resolve({ url: mockUrl, publicId: `${folder}/${mockId}` });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("[CLOUDINARY ERROR]", error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its URL or publicId.
 * @param {string} imageUrlOrPublicId 
 * @returns {Promise<boolean>}
 */
const deleteCloudinaryImage = async (imageUrlOrPublicId) => {
  if (!imageUrlOrPublicId) return false;

  const publicId = imageUrlOrPublicId.startsWith("http")
    ? extractPublicId(imageUrlOrPublicId)
    : imageUrlOrPublicId;

  if (!publicId) return false;

  if (
    !config.cloudinary.cloudName ||
    !config.cloudinary.apiKey ||
    !config.cloudinary.apiSecret
  ) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("[CLOUDINARY DELETE ERROR]", error.message);
    return false;
  }
};

module.exports = {
  uploadImageStream,
  deleteCloudinaryImage,
  extractPublicId,
};
