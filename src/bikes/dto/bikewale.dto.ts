// src/bikes/dto/bikewale-api.dto.ts

export interface BikeWaleManufacturer {
  makeId: number;
  makeName: string;
  makeMaskingName: string;
}

export interface BikeWaleSpec {
  itemId: number;
  value: string;
  unitType: string;
  itemName?: string;
}

export interface BikeWalePriceOverview {
  formattedPrice: string;
  price: number;
  priceLabel: string;
}

export interface BikeWaleVariant {
  versionId: number;
  versionName: string;
  priceOverview?: BikeWalePriceOverview;
  specsSummary?: BikeWaleSpec[];
  features?: BikeWaleSpec[];
  isMostPopular?: boolean;
  isJustLaunched?: boolean;
  isLaunchingSoon?: boolean;
}

export interface BikeWaleModel {
  modelId: number;
  modelName: string;
  modelMaskingName?: string;
  bodyStyleId?: number;
  fuelTypeId?: number;
  modelAggregateRating?: number;
  modelReviewCount?: number;
  imagePath?: string;
  versions?: BikeWaleVariant[];
}
