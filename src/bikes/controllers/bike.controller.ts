import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { BikeService } from '../services/bike.services';

@Controller('bikes')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Post('sync')
  async syncBikes() {
    try {
      const result = await this.bikeService.syncAll();
      return {
        success: true,
        message: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('manufacturers')
  async getManufacturers(@Query('source') source?: string) {
    if (source === 'local') {
      const syncData = await this.bikeService.getLocalSyncData();
      return syncData ? syncData.manufacturers.map((m) => m.manufacturer) : [];
    }

    return this.bikeService.fetchManufacturers();
  }

  @Get('sync/:makeId')
  async getBikesByManufacturer(@Param('makeId') makeId: string) {
    const manufacturers = await this.bikeService.fetchManufacturers();
    const manufacturer = manufacturers.find((m) => m.makeId === Number(makeId));

    if (!manufacturer) {
      return { error: 'Manufacturer not found' };
    }

    return this.bikeService.fetchBikesByManufacturer(
      Number(makeId),
      manufacturer.makeName,
    );
  }

  @Get('all-bikes')
  async getAllBikes() {
    try {
      return await this.bikeService.getAllBikes();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('local/:manufacturerName')
  async getLocalManufacturerData(
    @Param('manufacturerName') manufacturerName: string,
  ) {
    const data =
      await this.bikeService.getLocalManufacturerData(manufacturerName);
    return data || { error: 'No local data found for this manufacturer' };
  }
}
