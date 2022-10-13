import { Entity, ManyToOne } from "typeorm";
import { Board } from "./Board";
import { Status } from "./Status";

@Entity()
export class BoardStatus {
	@ManyToOne(() => Board, (board) => board.id)
	board_id: number;

	@ManyToOne(() => Status, (status) => status.id)
	status_id: string;
}
