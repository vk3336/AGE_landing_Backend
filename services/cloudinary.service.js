const cloudinary = require("../utils/cloudinary");
const { Readable } = require("stream");
const slugify = require("slugify");

// Accepts imageBuffer, optional filename, optional folder, forceFolder, and resourceType
const cloudinaryImageUpload = (
  imageBuffer,
  filename = null,
  folder = null,
  forceFolder = false,
  resourceType = "image" // 'image' or 'video'
) => {
  return new Promise((resolve, reject) => {
    let public_id = undefined;
    let uploadFolder = folder;
    if (filename) {
      // Remove extension and slugify
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      const uniqueSuffix = Date.now();
      const slug = `${slugify(nameWithoutExt, {
        lower: true,
        strict: true,
      })}-${uniqueSuffix}`;
      public_id = slug; // Do NOT prepend folder here
    }
    // Set upload options
    let uploadOptions = {
      resource_type: resourceType,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      unique_filename: false,
      overwrite: false,
      ...(public_id ? { public_id } : {}),
      ...(uploadFolder ? { folder: uploadFolder } : {}),
    };
    if (resourceType === "image") {
      uploadOptions = {
        ...uploadOptions,
        format: "webp",
        transformation: [
          { width: 500, height: 500, crop: "fill" },
          { fetch_format: "webp", quality: "auto:good" },
        ],
        eager: [
          { width: 500, height: 500, crop: "fill", format: "webp", quality: "auto:good" },
        ],
        eager_async: true,
        eager_notification_url: null,
      };
    } else if (resourceType === "video") {
      uploadOptions = {
        ...uploadOptions,
        resource_type: "video",
        eager: [
          { format: "mp4", video_codec: "av1" }, // AV1 video
          { format: "jpg", transformation: [{ width: 400, crop: "scale" }] }, // Thumbnail
        ],
        eager_async: false,
      };
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(imageBuffer);
    bufferStream.push(null);

    bufferStream.pipe(uploadStream);
  });
};

// cloudinaryImageDelete (still useful for manual/utility use)
const cloudinaryImageDelete = async (public_id) => {
  const deletionResult = await cloudinary.uploader.destroy(public_id);
  return deletionResult;
};

exports.cloudinaryServices = {
  cloudinaryImageDelete,
  cloudinaryImageUpload,
};
