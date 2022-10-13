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
	// @PrimaryColumn({ type: "int" })
	@ManyToOne(() => Board, (board) => board.id)
	board: number;

	@ManyToOne(() => Status, (status) => status.id)
	status: number;
	// @PrimaryColumn({ type: "text" })
	// @ManyToOne(() => Status, (status) => status.id)
	// statusTitle: string;

	// @PrimaryColumn({ type: "text" })
	// @ManyToOne(() => Status, (status) => status.color)
	// statusColor: string;
}
