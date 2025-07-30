import type { ImageData } from '@/apis/countries.types';

const STORAGE_BASE_URL = 'http://192.168.137.1:9000';

export const getImageUrl = (imageData: ImageData | null): string | undefined => {
  if (!imageData || !imageData.objectKey) return undefined;
  
  return `${STORAGE_BASE_URL}/${imageData.bucket}/${imageData.objectKey}`;
};

export const getImageUrlFromObject = (bucket: string, objectKey: string): string => {
  return `${STORAGE_BASE_URL}/${bucket}/${objectKey}`;
};

// Fallback image for when no image is available
export const getFallbackImageUrl = (): string => {
  return `${STORAGE_BASE_URL}/nestjsstorage/uploads/1753030967855-icon.webp`;
}; 