/**
 * Transforms Cloudinary image URLs to include specific dimensions and optimizations
 * @param {string} url - The original Cloudinary URL
 * @returns {string} - Transformed URL with dimensions and optimizations
 */
/**
 * Transforms Cloudinary image URLs to be responsive and optimized
 * @param {string} url - The original Cloudinary URL
 * @returns {Object} - Object containing responsive image URLs for different device sizes
 */
const transformImageUrl = (url) => {
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
    console.error('Error transforming image URL:', error);
    return { original: url };
  }
};

/**
 * Transforms all image URLs in a product object
 * @param {Object} product - The product object
 * @returns {Object} - Product with transformed image URLs
 */
const transformProductImages = (product) => {
  if (!product) return product;
  
  const imageFields = ['img', 'image1', 'image2', 'videoThumbnail'];
  const transformed = JSON.parse(JSON.stringify(product)); // Deep clone
  
  // Helper function to transform a single image URL or array of URLs
  const transformImageField = (image) => {
    if (!image) return image;
    if (Array.isArray(image)) {
      return image.map(img => (typeof img === 'string' ? transformImageUrl(img) : img));
    }
    return typeof image === 'string' ? transformImageUrl(image) : image;
  };
  
  // Transform each image field
  imageFields.forEach(field => {
    if (transformed[field]) {
      transformed[field] = transformImageField(transformed[field]);
    }
  });
  
  // Transform images in variants if they exist
  if (transformed.variants && Array.isArray(transformed.variants)) {
    transformed.variants = transformed.variants.map(variant => ({
      ...variant,
      image: variant.image ? transformImageField(variant.image) : undefined
    }));
  }
  
  return transformed;
};

module.exports = {
  transformImageUrl,
  transformProductImages
};
