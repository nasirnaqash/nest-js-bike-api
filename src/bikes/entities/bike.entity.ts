import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Variant } from './variant.entity';

@Entity()
export class Bike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  modelId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  maskingName: string;

  @Column({ nullable: true })
  bodyStyleId: number;

  @Column({ nullable: true })
  fuelTypeId: number;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ nullable: true })
  reviewCount: number;

  @Column({ nullable: true })
  imagePath: string;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.bikes, {
    onDelete: 'CASCADE',
  })
  manufacturer: Manufacturer;

  @OneToMany(() => Variant, (variant) => variant.bike, { cascade: true })
  variants: Variant[];
}
