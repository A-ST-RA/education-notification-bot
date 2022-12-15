import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Scraping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group: string;

  @Column({ type: 'text' })
  rasp: string;

  @Column()
  date: number;

  @Column()
  isPrepod: boolean;
}
