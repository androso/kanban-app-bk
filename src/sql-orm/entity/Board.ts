import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
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

	@ManyToOne(() => User, (user) => user)
	user: User;
}
