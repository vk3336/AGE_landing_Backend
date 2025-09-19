/**
 * Transforms Cloudinary image URLs to include specific dimensions and optimizations
 * @param {string} url - The original Cloudinary URL
 * @returns {string} - Transformed URL with dimensions and optimizations
 */
const transformImageUrl = (url) => {
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
    console.error('Error transforming image URL:', error);
  }
  
  return url;
};

/**
 * Transforms all image URLs in a product object
 * @param {Object} product - The product object
 * @returns {Object} - Product with transformed image URLs
 */
const transformProductImages = (product) => {
  if (!product) return product;
  
  const imageFields = ['img', 'image1', 'image2', 'videoThumbnail'];
  const transformed = { ...product };
  
  // Transform each image field
  imageFields.forEach(field => {
    if (transformed[field]) {
      if (Array.isArray(transformed[field])) {
        transformed[field] = transformed[field].map(transformImageUrl);
      } else {
        transformed[field] = transformImageUrl(transformed[field]);
      }
    }
  });
  
  // Transform images in variants if they exist
  if (transformed.variants && Array.isArray(transformed.variants)) {
    transformed.variants = transformed.variants.map(variant => ({
      ...variant,
      image: variant.image ? transformImageUrl(variant.image) : undefined
    }));
  }
  
  return transformed;
};

module.exports = {
  transformImageUrl,
  transformProductImages
};
