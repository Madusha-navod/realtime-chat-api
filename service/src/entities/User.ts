import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import 'reflect-metadata';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 50 })
  first_name!: string;

  @Column({ type: 'varchar', length: 50 })
  last_name!: string;

  @CreateDateColumn({ name: 'createdat', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updateat', type: 'datetime' })
  updateAt!: Date;
}
