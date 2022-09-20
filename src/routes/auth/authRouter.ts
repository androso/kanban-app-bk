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
authRouter
	.route("/login")
	.get((req, res) => {
		res.send("login");
	})
	.post((req, res, next) => {
		const { email, password } = req.body;
		console.log(email, password);
		findUserByEmail(email, async (err: Error | null, user: User | null) => {
			if (err) {
				console.log("there was an error");
				res.status(500).send("there was an error");
			} else if (!user) {
				console.log("there's no user registered with this email");
				res.status(401).send("there's no user registered with this email");
			} else {
				const passwordsMatch = await bcrypt.compare(password, user.password);
				if (!passwordsMatch) {
					console.log("Wrong password");
					res.status(401).json({ message: "wrong passwor" });
				} else {
					// Things inside req.session object persists between requests. Why?
					req.session.authenticated = true;
					req.session.userId = user.id;
					res
						.status(200)
						.json({ id: user.id, email: user.email, name: user.name });
				}
			}
		});
	});

authRouter
	.route("/register")
	.get((req, res) => {
		res.send("register");
	})
	.post(async (req, res) => {
		const { email, name, password } = req.body;
		// check if we already have a user with that email
		try {
			const user = await userExists(email);
			if (user) {
				console.log("user already exists!");
				res.status(409).send("user already exists!");
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
				res.status(201).send("user created correctly");
			}
		} catch (e) {
			console.error(e);
		}
	});

authRouter.get("/logout", (req, res) => {
	res.send("logout");
});

export default authRouter;
