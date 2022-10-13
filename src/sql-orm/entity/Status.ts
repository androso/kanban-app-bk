import {
	Column,
	Entity,
	Generated,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Status {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	color: string;
}
