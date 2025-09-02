import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';

interface BikeWaleManufacturerResponse {
  makeList: Array<{
    makeId: number;
    makeName: string;
    makeMaskingName?: string;
    logoUrl?: string;
    isSelected?: boolean;
  }>;
}

interface BikeWaleBikeResponse {
  models: Array<{
    modelId: number;
    modelName: string;
    modelMaskingName?: string;
    makeId: number;
    makeName: string;
    bodyStyleId?: number;
    fuelTypeId?: number;
    modelAggregateRating?: number;
    modelReviewCount?: number;
    imagePath?: string;
    priceOverview?: {
      formattedPrice: string;
      price: number;
      priceLabel: string;
      priceSuffix?: string;
      pricePrefix?: string;
    };
    versionId?: number;
    versionName?: string;
    specsSummary?: Array<{
      itemId: number;
      value: string;
      unitType: string;
    }>;
    features?: Array<{
      itemId: number;
      value: string;
      itemName?: string;
      unitType: string;
    }>;
    isMostPopular?: boolean;
    isJustLaunched?: boolean;
    isLaunchingSoon?: boolean;
    launchedOn?: string;
  }>;
  upcomingModels?: any[];
  totalModels?: number;
}

interface SyncResults {
  syncInfo: {
    startTime: string;
    endTime: string;
    totalManufacturers: number;
    successfulManufacturers: number;
    failedManufacturers: number;
    totalBikes: number;
    durationMs: number;
  };
  manufacturers: any[];
  errors: any[];
}

@Injectable()
export class BikeService {
  private readonly logger = new Logger(BikeService.name);
  private readonly dataDir = path.join(process.cwd(), 'data');

  constructor(private readonly httpService: HttpService) {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
      this.logger.log(`📁 Created data directory: ${this.dataDir}`);
    }
  }

  async fetchManufacturers(): Promise<
    BikeWaleManufacturerResponse['makeList']
  > {
    try {
      this.logger.log('🔄 Fetching manufacturers from BikeWale API...');

      const { data } = await firstValueFrom(
        this.httpService.get<BikeWaleManufacturerResponse>(
          'https://www.bikewale.com/api/makes/',
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              Accept: 'application/json',
            },
          },
        ),
      );

      this.logger.log(`✅ Fetched ${data.makeList.length} manufacturers`);
      return data.makeList;
    } catch (error) {
      this.logger.error('❌ Failed to fetch manufacturers:', error.message);
      throw new Error(`Failed to fetch manufacturers: ${error.message}`);
    }
  }

  async fetchBikesByManufacturer(
    makeId: number,
    makeName?: string,
  ): Promise<BikeWaleBikeResponse['models']> {
    const url = `https://www.bikewale.com/api/v4/new-bike-search/?cityId=-1&sortField1=modelPopularity&sortOrder1=desc&makeIds=${makeId}&isMobile=false`;

    try {
      const displayName = makeName || `Manufacturer ID ${makeId}`;
      this.logger.log(`🔄 Fetching bikes for ${displayName}...`);

      const { data } = await firstValueFrom(
        this.httpService.get<BikeWaleBikeResponse>(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: 'application/json',
          },
        }),
      );

      const bikes = data.models || [];
      this.logger.log(`✅ Fetched ${bikes.length} bikes for ${displayName}`);
      return bikes;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch bikes for makeId ${makeId}:`,
        error.message,
      );
      return []; // Return empty array instead of throwing to continue with other manufacturers
    }
  }

  async syncAll(): Promise<string> {
    this.logger.log('🚀 Starting BikeWale sync process...');
    const startTime = Date.now();

    try {
      await this.ensureDataDirectory();

      // Fetch all manufacturers
      const manufacturers = await this.fetchManufacturers();

      const syncResults: SyncResults = {
        syncInfo: {
          startTime: new Date().toISOString(),
          endTime: '',
          totalManufacturers: manufacturers.length,
          successfulManufacturers: 0,
          failedManufacturers: 0,
          totalBikes: 0,
          durationMs: 0,
        },
        manufacturers: [],
        errors: [],
      };

      // Process each manufacturer
      for (let i = 0; i < manufacturers.length; i++) {
        const manufacturer = manufacturers[i];

        try {
          this.logger.log(
            `📥 Processing ${manufacturer.makeName} (${i + 1}/${manufacturers.length})...`,
          );

          // Fetch bikes for this manufacturer
          const bikes = await this.fetchBikesByManufacturer(
            manufacturer.makeId,
            manufacturer.makeName,
          );

          const manufacturerData = {
            manufacturer: {
              makeId: manufacturer.makeId,
              makeName: manufacturer.makeName,
              makeMaskingName: manufacturer.makeMaskingName,
              logoUrl: manufacturer.logoUrl,
            },
            bikes: bikes.map((bike) => ({
              modelId: bike.modelId,
              modelName: bike.modelName,
              modelMaskingName: bike.modelMaskingName,
              bodyStyleId: bike.bodyStyleId,
              fuelTypeId: bike.fuelTypeId,
              rating: bike.modelAggregateRating,
              reviewCount: bike.modelReviewCount,
              imagePath: bike.imagePath,
              launchedOn: bike.launchedOn,
              variant: bike.versionId
                ? {
                    versionId: bike.versionId,
                    versionName: bike.versionName,
                    price: bike.priceOverview?.price,
                    formattedPrice: bike.priceOverview?.formattedPrice,
                    priceLabel: bike.priceOverview?.priceLabel,
                    specsSummary: bike.specsSummary || [],
                    features: bike.features || [],
                    isMostPopular: bike.isMostPopular || false,
                    isJustLaunched: bike.isJustLaunched || false,
                    isLaunchingSoon: bike.isLaunchingSoon || false,
                  }
                : null,
            })),
            bikeCount: bikes.length,
            syncedAt: new Date().toISOString(),
          };

          syncResults.manufacturers.push(manufacturerData);
          syncResults.syncInfo.successfulManufacturers++;
          syncResults.syncInfo.totalBikes += bikes.length;

          // Save individual manufacturer data
          const manufacturerFileName = `${manufacturer.makeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-bikes.json`;
          const manufacturerFilePath = path.join(
            this.dataDir,
            manufacturerFileName,
          );
          await fs.writeFile(
            manufacturerFilePath,
            JSON.stringify(manufacturerData, null, 2),
          );

          this.logger.log(
            `💾 Saved ${bikes.length} bikes for ${manufacturer.makeName}`,
          );

          // Rate limiting - wait between requests
          if (i < manufacturers.length - 1) {
            await this.sleep(500);
          }
        } catch (error) {
          this.logger.error(
            `❌ Failed to process ${manufacturer.makeName}:`,
            error.message,
          );

          syncResults.errors.push({
            manufacturer: manufacturer.makeName,
            makeId: manufacturer.makeId,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          syncResults.syncInfo.failedManufacturers++;
        }
      }

      // Finalize sync info
      const duration = Date.now() - startTime;
      syncResults.syncInfo.endTime = new Date().toISOString();
      syncResults.syncInfo.durationMs = duration;

      // Save complete results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const summaryFileName = `bikewale-sync-${timestamp}.json`;
      const summaryFilePath = path.join(this.dataDir, summaryFileName);
      await fs.writeFile(summaryFilePath, JSON.stringify(syncResults, null, 2));

      // Save latest sync (overwrite each time)
      const latestFilePath = path.join(this.dataDir, 'latest-sync.json');
      await fs.writeFile(latestFilePath, JSON.stringify(syncResults, null, 2));

      const successMessage = `🎉 Sync completed! 
📊 Stats:
- Duration: ${Math.round(duration / 1000)}s
- Manufacturers: ${syncResults.syncInfo.successfulManufacturers}/${syncResults.syncInfo.totalManufacturers} successful
- Total Bikes: ${syncResults.syncInfo.totalBikes}
- Files saved in: ${this.dataDir}`;

      this.logger.log(successMessage);
      return successMessage;
    } catch (error) {
      this.logger.error('❌ Sync process failed:', error.message);
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  // Helper method to get local data
  async getLocalSyncData(): Promise<SyncResults | null> {
    try {
      const latestFilePath = path.join(this.dataDir, 'latest-sync.json');
      const data = await fs.readFile(latestFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.warn('No local sync data found');
      return null;
    }
  }

  // Helper method to get manufacturer data from local file
  async getLocalManufacturerData(manufacturerName: string): Promise<any> {
    try {
      const fileName = `${manufacturerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-bikes.json`;
      const filePath = path.join(this.dataDir, fileName);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.warn(
        `No local data found for manufacturer: ${manufacturerName}`,
      );
      return null;
    }
  }

  // Get all bikes from local files
  async getAllBikes(): Promise<any[]> {
    const localData = await this.getLocalSyncData();
    if (localData) {
      return localData.manufacturers.flatMap((m) => m.bikes);
    }
    throw new Error('No local bike data found. Please run sync first.');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
