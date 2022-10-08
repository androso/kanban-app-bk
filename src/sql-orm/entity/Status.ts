import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Status {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "text" })
	title: string;

	@Column({ type: "text" })
	color: string;
}
