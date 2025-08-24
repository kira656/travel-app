import type { ImageData } from '@/apis/countries.types';

<<<<<<< HEAD
const STORAGE_BASE_URL = 'http://192.168.137.5:3000/storage/media';
=======
const STORAGE_BASE_URL = 'http://192.168.1.3:3000/storage/media';
>>>>>>> 1c5dcb411cdf6b3e4c4ef5ddd536117b444362ea

export const getImageUrl = (imageData: ImageData | null): string | undefined => {
  if (!imageData || !imageData.objectKey) return undefined;
  
  return `${STORAGE_BASE_URL}/${imageData.objectKey}`;
};

export const getImageUrlFromObject = (bucket: string, objectKey: string): string => {
  return `${STORAGE_BASE_URL}/${bucket}/${objectKey}`;
};

// Fallback image for when no image is available
export const getFallbackImageUrl = (): string => {
  return `${STORAGE_BASE_URL}/1753030967855-icon.webp`;
}; 