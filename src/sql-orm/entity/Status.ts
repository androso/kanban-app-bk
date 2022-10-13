import { Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity()
export class Status {
	@Column({ unique: true })
	@Generated("uuid")
	id: string;
	
	@PrimaryColumn({ type: "text" })
	title: string;

	@PrimaryColumn({ type: "text" })
	color: string;
}
