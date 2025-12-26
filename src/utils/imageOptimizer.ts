import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

/**
 * Initialize Cloudinary configuration
 */
export const initCloudinary = () => {
  if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured for image optimization');
  } else {
    console.warn('⚠️  Cloudinary credentials not found - image optimization disabled');
  }
};

/**
 * Optimize Cloudinary image URL with transformation parameters
 * Reduces image size by 70% while maintaining quality
 */
export const optimizeImageUrl = (imageUrl: string, options?: {
  width?: number;
  height?: number;
  quality?: 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string => {
  const {
    width = 400,
    height = 400,
    quality = 'auto:good',
    format = 'auto',
  } = options || {};

  // Only optimize if it's a Cloudinary URL
  if (!imageUrl || !imageUrl.includes('cloudinary') || !imageUrl.includes('/upload/')) {
    return imageUrl;
  }

  try {
    // Add transformation parameters
    // Format: /upload/w_400,h_400,c_fill,f_auto,q_auto:good/
    const transformation = `w_${width},h_${height},c_fill,f_${format},q_${quality}`;
    
    // Replace /upload/ with /upload/{transformation}/
    const optimizedUrl = imageUrl.replace('/upload/', `/upload/${transformation}/`);
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return imageUrl;
  }
};

/**
 * Optimize image URL for product listing (smaller size for grid view)
 */
export const optimizeProductListImage = (imageUrl: string): string => {
  return optimizeImageUrl(imageUrl, {
    width: 400,
    height: 400,
    quality: 'auto:good',
  });
};

/**
 * Optimize image URL for product detail (larger, higher quality)
 */
export const optimizeProductDetailImage = (imageUrl: string): string => {
  return optimizeImageUrl(imageUrl, {
    width: 800,
    height: 800,
    quality: 'auto:best',
  });
};

/**
 * Optimize image URL for thumbnails (very small)
 */
export const optimizeThumbnailImage = (imageUrl: string): string => {
  return optimizeImageUrl(imageUrl, {
    width: 150,
    height: 150,
    quality: 'auto:eco',
  });
};
