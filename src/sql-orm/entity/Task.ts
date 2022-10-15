import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Board } from "./Board";
import { Status } from "./Status";
import { Subtask } from "./Subtask";

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

	@ManyToOne(() => Board, (board) => board.tasks, { onDelete: "CASCADE" })
	@JoinColumn({ name: "boardId" })
	board: Board;

	@Column({ type: "int" })
	statusId: number;

	@ManyToOne(() => Status, (status) => status, { onDelete: "CASCADE"})
	@JoinColumn({ name: "statusId" })
	status: Status;

	@OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
	subtasks: Subtask[];
}
