/**
 * Transforms Cloudinary image URLs for groupcodes to be responsive and optimized
 * @param {string} url - The original Cloudinary URL
 * @returns {Object} - Object containing responsive image URLs for different device sizes
 */
const transformGroupcodeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return { original: url };
  
  // Skip if not a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return { original: url };
  }
  
  try {
    // Base transformations for all images
    const baseTransformations = 'c_scale/f_auto/q_auto:good';
    
    // Define different sizes for different device breakpoints
    const sizes = {
      xs: { width: 320, height: 320 },  // Mobile
      sm: { width: 480, height: 480 },  // Small tablets
      md: { width: 768, height: 768 },  // Tablets
      lg: { width: 1024, height: 1024 }, // Small desktops
      xl: { width: 1280, height: 1280 }, // Large desktops
      original: { width: 2000, height: 2000 } // Original size with max dimensions
    };
    
    // Generate responsive URLs for each size
    const responsiveUrls = {};
    
    Object.entries(sizes).forEach(([key, size]) => {
      const transformation = `${baseTransformations},w_${size.width},h_${size.height},c_limit`;
      
      // Insert transformation parameters after /upload/ or /v1/
      const uploadIndex = url.indexOf('/upload/');
      const versionIndex = url.indexOf('/v1/');
      
      if (uploadIndex !== -1) {
        responsiveUrls[key] = url.replace('/upload/', `/upload/${transformation}/`);
      } else if (versionIndex !== -1) {
        responsiveUrls[key] = url.replace('/v1/', `/v1/${transformation}/`);
      } else {
        responsiveUrls[key] = url;
      }
    });
    
    return responsiveUrls;
  } catch (error) {
    console.error('Error transforming groupcode image URL:', error);
    return { original: url };
  }
};

/**
 * Transforms all image URLs in a groupcode object
 * @param {Object|Array} groupcode - The groupcode object or array of groupcode objects
 * @returns {Object|Array} - Groupcode data with transformed image URLs
 */
const transformGroupcodeImages = (groupcode) => {
  if (!groupcode) return groupcode;
  
  // Helper function to transform a single image URL or array of URLs
  const transformImageField = (image) => {
    if (!image) return image;
    if (Array.isArray(image)) {
      return image.map(img => (typeof img === 'string' ? transformGroupcodeImageUrl(img) : img));
    }
    return typeof image === 'string' ? transformGroupcodeImageUrl(image) : image;
  };
  
  // Handle array of groupcodes
  if (Array.isArray(groupcode)) {
    return groupcode.map(gc => {
      const transformed = {
        ...(gc.toObject ? gc.toObject() : gc),
      };
      
      // Transform image URL if it exists
      if (transformed.img) {
        transformed.img = transformGroupcodeImageUrl(transformed.img);
      }
      
      return transformed;
    });
  }
  
  // Handle single groupcode
  const transformed = {
    ...groupcode.toObject ? groupcode.toObject() : groupcode,
  };
  
  // Transform image URL if it exists
  if (transformed.img) {
    transformed.img = transformGroupcodeImageUrl(transformed.img);
  }
  
  return transformed;
};

module.exports = {
  transformGroupcodeImageUrl,
  transformGroupcodeImages
};
