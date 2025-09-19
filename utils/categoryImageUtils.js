/**
 * Transforms Cloudinary image URLs for categories to include specific dimensions and optimizations
 * @param {string} url - The original Cloudinary URL
 * @returns {string} - Transformed URL with dimensions and optimizations
 */
const transformCategoryImageUrl = (url) => {
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
    console.error('Error transforming category image URL:', error);
  }
  
  return url;
};

/**
 * Transforms all image URLs in a category object
 * @param {Object|Array} category - The category object or array of category objects
 * @returns {Object|Array} - Category data with transformed image URLs
 */
const transformCategoryImages = (category) => {
  if (!category) return category;
  
  // Handle array of categories
  if (Array.isArray(category)) {
    return category.map(cat => ({
      ...cat.toObject ? cat.toObject() : cat,
      image: cat.image ? transformCategoryImageUrl(cat.image) : null
    }));
  }
  
  // Handle single category
  return {
    ...category.toObject ? category.toObject() : category,
    image: category.image ? transformCategoryImageUrl(category.image) : null
  };
};

module.exports = {
  transformCategoryImageUrl,
  transformCategoryImages
};
