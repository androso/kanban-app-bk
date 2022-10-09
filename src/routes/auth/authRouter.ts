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
			res.status(404).json({ message: "User not found", status: 404 });
		} else {
			const passwordsMatch = await bcrypt.compare(password, record.password);
			if (!passwordsMatch) {
				res
					.status(401)
					.json({ message: "Invalid password/email", status: 401 });
			} else {
				req.session.user = {
					username: record.username,
					email: record.email,
					id: record.id,
				};
				req.session.save((err) => {
					if (err) {
						res.status(500).json({ message: "Error in the server" });
					} else {
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
		res.status(500).json({ message: e.message, status: 500 });
	}
});

authRouter.route("/register").post(async (req, res) => {
	const { email, username, password } = req.body;
	try {
		const userExists = await UserRepository.findOneBy({ email });
		if (userExists) {
			res.status(409).json({ message: "User already exists", status: 409 });
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
			res.status(201).json({ message: "User created correctly", status: 201 });
		}
	} catch (e) {
		if (e instanceof Error) {
			console.error(e);
		}
	}
});

export default authRouter;
