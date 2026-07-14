import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Role } from '../guards/roles/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'nvarchar', length: 50 })
  name!: string;

  @Column({
    type: 'nvarchar',
    unique: true,
    length: 50,
  })
  email!: string;

  @Column({ type: 'nvarchar', length: 200 })
  password!: string;

  @Column('simple-array', { default: Role.USER })
  roles!: Role[];
}