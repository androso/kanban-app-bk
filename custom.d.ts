import { User } from "types";

declare global {
	namespace Express {
		interface Request {
			authenticated?: boolean;
			user?: {
				id: number;
				email: string;
				password: string;
				name: string;
			};
		}
	}
}
declare module "express-session" {
	interface SessionData {
		authenticated?: boolean;
		userId?: number;
		user: User
	}
}
export {};
