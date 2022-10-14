import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
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

	@Column({ type: "int" })
	boardId: number;

	@ManyToOne(() => Board, (board) => board)
	@JoinColumn({ name: "boardId" })
	board: Board;

	@Column({ type: "int" })
	statusId: number;

	@ManyToOne(() => Status, (status) => status)
	@JoinColumn({ name: "statusId" })
	status: Status;
}
