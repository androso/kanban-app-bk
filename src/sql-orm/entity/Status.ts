import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "./Board";

@Entity()
export class Status {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	color: string;

	@ManyToMany(() => Board, (board) => board.statuses)
	boards: Board[];
}
