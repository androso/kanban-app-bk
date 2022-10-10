import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./Task";

@Entity()
export class Subtask {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Task, (task) => task.id)
	task_id: number;

	@Column({ type: "text" })
	title: string;

	@Column({ type: "boolean" })
	completed: boolean;
}
