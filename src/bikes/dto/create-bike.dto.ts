import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateBikeDto {
  @IsNumber()
  modelId: number; // bikewale model ID

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsArray()
  variants?: any[];

  @IsNumber()
  manufacturerId: number; // foreign key reference to Manufacturer
}
