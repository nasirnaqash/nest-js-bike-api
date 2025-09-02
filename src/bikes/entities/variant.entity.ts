import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bike } from './bike.entity';

@Entity()
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  versionId: number; // Bikewale Variant ID

  @Column()
  versionName: string; // e.g. Deluxe

  @Column({ nullable: true })
  price: number; // Ex-showroom numeric

  @Column({ nullable: true })
  formattedPrice: string; // ₹ 1,70,583

  @Column('jsonb', { nullable: true })
  specsSummary: any[];

  @Column('jsonb', { nullable: true })
  features: any[];

  @Column({ default: false })
  isMostPopular: boolean;

  @Column({ default: false })
  isJustLaunched: boolean;

  @Column({ default: false })
  isLaunchingSoon: boolean;

  @ManyToOne(() => Bike, (bike) => bike.variants, { onDelete: 'CASCADE' })
  bike: Bike;
}
