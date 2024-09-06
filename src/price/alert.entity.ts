// src/price/alert.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class AlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal')
  dollar: number;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
