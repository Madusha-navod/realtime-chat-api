import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import 'reflect-metadata';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn({ name: 'createdat', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updateat', type: 'datetime' })
  updateAt!: Date;
}
