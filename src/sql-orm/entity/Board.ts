import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
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

	@Column({ type: "int" })
	userId: number;

	@ManyToOne(() => User, (user) => user)
	@JoinColumn({ name: "userId" })
	user: User;
}
