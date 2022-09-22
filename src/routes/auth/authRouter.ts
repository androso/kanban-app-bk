import express from "express";
import {
	findUserByEmail,
	getNewId,
	userExists,
	writeJSONFile,
} from "../../helpers/helpers.js";
import users from "../../data/users.json";
import { User } from "types.js";
import bcrypt from "bcrypt";
import path from "path";
const usersFilename = path.join(__dirname, "../../data/users.json");
const authRouter = express.Router();

authRouter.route("/login").post((req, res) => {
	const { email, password } = req.body;
	findUserByEmail(email, async (err: Error | null, record: User | null) => {
		if (err) {
			res.status(500).json({ message: err.message, status: 500 });
		} else if (!record) {
			res.status(404).json({ message: "User not found", status: 404 });
		} else {
			const passwordsMatch = await bcrypt.hash(password, record.password);
			// const passwordsMatch = password === record.password;
			if (!passwordsMatch) {
				res
					.status(401)
					.json({ message: "Invalid password/email", status: 401 });
			} else {
				req.session.user = record;
				req.session.save((err) => {
					if (err) {
						res.status(500).json({ message: "Error in the server" });
					} else {
						console.log(req.session);
						res.status(200).json(record);
					}
				});
			}
		}
	});
});

authRouter.route("/register").post(async (req, res) => {
	const { email, name, password } = req.body;
	try {
		const user = await userExists(email);
		if (user) {
			console.log("user already exists!");
			res.status(409).json({ message: "User already exists", status: 409 });
		} else {
			const userId = getNewId(users);
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const newUser = {
				id: userId,
				email,
				name,
				password: hashedPassword,
			};
			//save to db
			users.push(newUser);
			writeJSONFile(usersFilename, users);
			console.log("user created correctly");
			console.log(newUser);
			res.status(201).json({ message: "User created correctly", status: 201 });
		}
	} catch (e) {
		if (e instanceof Error) {
			console.error(e);
		}
	}
});

export default authRouter;
