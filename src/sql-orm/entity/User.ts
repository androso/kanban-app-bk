import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn({type: "int"})
    id: number

    @Column({type: "text"})
    username: string

    @Column({type: "text"})
    email: string

    @Column({type: "text"})
    password: string

		@CreateDateColumn()
		created_at: Date;
}
