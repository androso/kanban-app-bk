import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";

import { Status } from "./Status";
import { Task } from "./Task";
import { User } from "./User";

@Entity()
export class Board {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "text" })
	title: string;

	@CreateDateColumn()
	created_at: Date;

	@Column({ type: "text" })
	description: string;

	@Column({ type: "int" })
	userId: number;

	@ManyToOne(() => User, (user) => user.boards, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: User;

	@ManyToMany(() => Status, (status) => status.boards)
	@JoinTable({ name: "board_to_status" })
	statuses: Status[];

	@OneToMany(() => Task, (task) => task.board, { cascade: true })
	tasks: Task[];
}
