import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BikesModule } from './bikes/modules/bikes.module';

@Module({
  imports: [
    HttpModule, 
    BikesModule,
  ],
})
export class AppModule {}
