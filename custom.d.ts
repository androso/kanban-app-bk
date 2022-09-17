declare namespace Express {
	export interface Request {
		authenticated?: boolean;
		user?: {
			id: number;
			email: string;
			password: string;
		};
	}
}
