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
		user: {
			username: string;
			email: string;
			id: number;
		};
	}
}
export {};
