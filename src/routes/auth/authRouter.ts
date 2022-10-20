import express from "express";
import bcrypt from "bcrypt";
import { User } from "../../sql-orm/entity/User";
import { AppDataSource } from "../../sql-orm/data-source";
const authRouter = express.Router();
const UserRepository = AppDataSource.getRepository(User);

authRouter.route("/login").post(async (req, res) => {
	const { email, password } = req.body;
	try {
		const record = await UserRepository.findOneBy({ email });
		if (!record) {
			res.sendStatus(404);
		} else {
			const passwordsMatch = await bcrypt.compare(password, record.password);
			if (!passwordsMatch) {
				res
					.sendStatus(401);
			} else {
				req.session.user = {
					username: record.username,
					email: record.email,
					id: record.id,
				};
				req.session.save((err) => {
					if (err) {
						res.sendStatus(500);
					} else {
						console.log("User saved", req.session.user)
						res.status(200).json({
							username: record.username,
							email: record.email,
							id: record.id,
						});
					}
				});
			}
		}
	} catch (e) {
		res.sendStatus(500)
	}
});

authRouter.route("/register").post(async (req, res) => {
	const { email, username, password } = 
req.body;
	try {
		const userExists = await UserRepository.findOneBy({ email });
		if (userExists) {
			res.statusMessage = "User already exists";
			res.status(409).end();
		} else {
			const newUser = new User();
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			newUser.password = hashedPassword;
			newUser.email = email;
			newUser.username = username;
			// save to db
			await AppDataSource.manager.save(newUser);
			// await UserRepository.save(newUser);
			res.sendStatus(201)
		}
	} catch (e) {
		if (e instanceof Error) {
			res.statusMessage = "Internal Error";
			res.status(500).end();
		}
	}
});

authRouter.route("/logout").post(async (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.statusMessage = "Internal Error";
			
			res.status(500).end();
		} else {
			res.sendStatus(200);
		}
	});
});

export default authRouter;
