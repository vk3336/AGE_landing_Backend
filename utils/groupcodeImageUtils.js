/**
 * Transforms Cloudinary image URLs for groupcodes to include specific dimensions and optimizations
 * @param {string} url - The original Cloudinary URL
 * @returns {string} - Transformed URL with dimensions and optimizations
 */
const transformGroupcodeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Skip if already transformed or not a Cloudinary URL
  if (url.includes('/c_scale,w_') || !url.includes('res.cloudinary.com')) {
    return url;
  }
  
  try {
    // Insert transformation parameters after /upload/ or /v1/
    const uploadIndex = url.indexOf('/upload/');
    const versionIndex = url.indexOf('/v1/');
    
    if (uploadIndex !== -1) {
      return url.replace(
        '/upload/', 
        '/upload/c_scale,w_500,h_500/f_auto/q_auto/'
      );
    } else if (versionIndex !== -1) {
      return url.replace(
        '/v1/', 
        '/v1/c_scale,w_500,h_500/f_auto/q_auto/'
      );
    }
  } catch (error) {
    console.error('Error transforming groupcode image URL:', error);
  }
  
  return url;
};

/**
 * Transforms all image URLs in a groupcode object
 * @param {Object|Array} groupcode - The groupcode object or array of groupcode objects
 * @returns {Object|Array} - Groupcode data with transformed image URLs
 */
const transformGroupcodeImages = (groupcode) => {
  if (!groupcode) return groupcode;
  
  // Handle array of groupcodes
  if (Array.isArray(groupcode)) {
    return groupcode.map(gc => {
      const transformed = {
        ...gc.toObject ? gc.toObject() : gc,
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
