import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikesModule } from './bikes/bikes.module';
import { Bike } from './bikes/entities/bike.entitiy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bike-library.db',
      entities: [Bike],
      synchronize: true,
    }),
    BikesModule,
  ],
})
export class AppModule {}
