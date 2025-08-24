import type { ImageData } from '@/apis/countries.types';

const STORAGE_BASE_URL = 'http://192.168.137.5:3000/storage/media';

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