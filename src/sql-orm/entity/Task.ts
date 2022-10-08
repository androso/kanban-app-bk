import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "./Board";
import { Status } from "./Status";

@Entity()
export class Task {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "text" })
	title: string;

	@Column({ type: "text" })
	description: string;

	@ManyToOne(() => Board, (board) => board.id)
	board_id: number;

	@ManyToOne(() => Status, (status) => status.id)
	status_id: number;
}
