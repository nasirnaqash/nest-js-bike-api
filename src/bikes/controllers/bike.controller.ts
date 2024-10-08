import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BikesService } from '../services/bike.services';
import { CreateBikeDto } from '../dto/create-bike.dto';
import { UpdateBikeDto } from '../dto/update-bike.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bikes')
@Controller('bikes')
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}

  @Get() findAll() {
    return this.bikesService.findAll();
  }

  @Post() create(@Body() createBikeDto: CreateBikeDto) {
    return this.bikesService.create(createBikeDto);
  }

  @Put(':id') update(
    @Param('id') id: string,
    @Body() updateBikeDto: UpdateBikeDto,
  ) {
    return this.bikesService.update(id, updateBikeDto);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.bikesService.remove(id);
  }
}
