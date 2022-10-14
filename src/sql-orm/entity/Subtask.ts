import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./Task";

@Entity()
export class Subtask {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "int" })
	taskId: number;

	@ManyToOne(() => Task, (task) => task)
	@JoinColumn({ name: "taskId" })
	task: Task;

	@Column({ type: "text" })
	title: string;

	@Column({ type: "boolean" })
	completed: boolean;
}
