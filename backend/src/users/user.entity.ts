import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({type:'nvarchar',length:50})
  name!: string;

  @Column({
    type: 'nvarchar',unique: true,length:50,
  })
  email!: string;

  @Column({type:'nvarchar',length:200})
  password!: string;
}