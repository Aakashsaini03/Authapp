import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  UniqueId: string;

  @Column({ type: 'nvarchar', length: 50 })
  name: string;

  @Column({
    type: 'nvarchar',
    unique: true,
    length: 50,
  })
  Gmail: string;

  @Column({ type: 'nvarchar', length: 200 })
  password!: string;

  @Column({
  type: 'nvarchar',
  length: 50
})
role: string;

@Column({name:'signup_at',type:'datetime2',insert:false,update:false})
 signup_at:Date;
}