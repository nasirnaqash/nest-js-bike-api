import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikesController } from './controllers/bike.controller';
import { BikesService } from './services/bike.services';
import { Bike } from './entities/bike.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([Bike])], // Import the TypeORM module for the Bike entity
  controllers: [BikesController], // Register the controller
  providers: [BikesService], // Register the service
})
export class BikesModule {}
