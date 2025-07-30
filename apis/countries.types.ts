export interface ImageData {
  id: number;
  bucket: string;
  objectKey: string;
  mime: string;
  size: number | null;
  scope: string;
  ownerId: string | null;
  encrypted: boolean;
  uploadedAt: string;
  deletedAt: string | null;
}

export interface City {
  id: number;
  countryId: number;
  name: string;
  slug: string;
  description: string;
  center: [number, number]; // [longitude, latitude]
  radius: string;
  avgMealPrice: string;
  isActive: boolean;
  avgRating: string;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mainImage: ImageData | null;
  galleryImages: ImageData[];
}

export interface Country {
  id: number;
  code: string;
  name: string;
  currency: string;
  timezone: string;
  description: string;
  is_active: boolean;
  avgRating: string;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mainImage: ImageData | null;
  galleryImages: ImageData[];
  cities: City[];
}

export interface CountriesResponse {
  data: Country[];
  totalCount: string;
  page: number;
  limit: number;
  totalPages: number;
  orderBy: string;
  orderDir: string;
}

export interface CountriesError {
  success: false;
  message: string;
  error?: string;
} 