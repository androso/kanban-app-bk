import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Board } from "./Board";
import { Status } from "./Status";

@Entity()
export class BoardToStatus {
	@PrimaryGeneratedColumn()
	id: number;

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
