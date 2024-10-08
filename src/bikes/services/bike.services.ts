import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bike } from '../entities/bike.entitiy';
import { CreateBikeDto } from '../dto/create-bike.dto';
import { UpdateBikeDto } from '../dto/update-bike.dto';

@Injectable()
export class BikesService {
  constructor(
    @InjectRepository(Bike) private readonly bikeRepo: Repository<Bike>,
  ) {}

  findAll(): Promise<Bike[]> {
    return this.bikeRepo.find();
  }

  findOne(id: string): Promise<Bike> {
    return this.bikeRepo.findOneBy({ id });
  }

  async create(data: CreateBikeDto): Promise<Bike> {
    const bike = this.bikeRepo.create(data);
    return this.bikeRepo.save(bike);
  }

  async update(id: string, data: UpdateBikeDto): Promise<Bike> {
    await this.bikeRepo.update(id, data);
    const bike = await this.findOne(id);
    if (!bike) throw new NotFoundException(`Bike with ID ${id} not found`);
    return bike;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bikeRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Bike with ID ${id} not found`);
  }
}
