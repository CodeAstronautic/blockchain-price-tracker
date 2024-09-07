// src/price/price.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('prices')
export class PriceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal')
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('price_alert')
export class PriceAlertEntity {
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
