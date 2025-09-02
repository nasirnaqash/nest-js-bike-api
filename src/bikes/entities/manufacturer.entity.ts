import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bike } from './bike.entity';

@Entity()
export class Manufacturer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  makeId: number; // Bikewale Manufacturer ID

  @Column()
  name: string; // e.g. Yamaha

  @Column({ nullable: true })
  maskingName: string; // e.g. yamaha

  @OneToMany(() => Bike, (bike) => bike.manufacturer)
  bikes: Bike[];
}
