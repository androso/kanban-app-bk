import {
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Board } from "./Board";
import { Status } from "./Status";

// ! the problem is here
@Entity()
export class BoardToStatus {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Board, (board) => board)
	board: Board;

	@ManyToOne(() => Status, (status) => status)
	status: Status;

	// @ManyToOne(() => Board, (board) => board.id)
	// board: number;

	// @ManyToOne(() => Status, (status) => status.id)
	// status: number;
}
