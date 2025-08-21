export interface City {
    id: number;
    countryId: number;
    name: string;
    slug: string;
    description: string;
    center: [number, number];
    radius: string;
    avgMealPrice: string;
    isActive: boolean;
    avgRating: string;
    ratingCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    country: {
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
      deletedAt: null | string;
    };
    cityMealPrices: {
      id: number;
      cityId: number;
      mealPricePerPerson: string;
      createdAt: string;
      updatedAt: string;
    }[];
    distanceRates: {
      id: number;
      cityId: number;
      transportRatePerKm: string;
      createdAt: string;
      updatedAt: string;
    }[];
    mainImage: {
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
    } | null;
    galleryImages: {
      id: number;
      bucket: string;
      objectKey: string;
      mime: string;
      size: number;
      scope: string;
      ownerId: null | number;
      encrypted: boolean;
      uploadedAt: string;
      deletedAt: null | string;
    }[];
  }