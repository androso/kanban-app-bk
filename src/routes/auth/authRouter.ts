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
		console.log("posting to /login");
	});

authRouter
	.route("/register")
	.get((req, res) => {
		res.send("register");
	})
	.post(async (req, res) => {
		const { email, password } = req.body;

		// check if we already have a user with that email
		try {
			const user = await userExists(email);
			if (user) {
				console.log("user already exists!");
				res.redirect("/users/login");
			} else {
				const userId = getNewId(users);
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(password, salt);

				const newUser = {
					id: userId,
					email,
					password: hashedPassword,
				};
				//save to db
				users.push(newUser);
				writeJSONFile(usersFilename, users);
				console.log("user created correctly");
				console.log(newUser);
				res.redirect("/login");
			}
		} catch (e) {
			console.error(e);
		}
	});

authRouter.get("/logout", (req, res) => {
	res.send("logout");
});

export default authRouter;
