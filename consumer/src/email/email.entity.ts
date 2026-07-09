import { Column,PrimaryGeneratedColumn,Entity } from "typeorm";

@Entity('Email')
export class EntityEmail{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;

    @Column()
    email!:string;


}
