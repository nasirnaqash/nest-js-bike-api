import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BikeController } from '../controllers/bike.controller';
import { BikeService } from '../services/bike.services';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BikeController],
  providers: [BikeService],
  exports: [BikeService],
})
export class BikesModule {}
