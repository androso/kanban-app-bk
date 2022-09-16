import express from "express";
import {
	findUserByEmail,
	getNewId,
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
		if (email && password) {
			// check if we already have a user with that email
			let userExists;
			findUserByEmail(email, async (err: Error | null, user: User) => {
				if (err) {
					console.log("error while looking up database");
					res.redirect("/register");
				} else if (user) {
					console.log("Email already registered");
					res.redirect("/login");
				} else {
					// get id
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
					console.log("user creted correctly");
					console.log(newUser);
					res.redirect("/login");
				}
			});
		}
	});

authRouter.get("/logout", (req, res) => {
	res.send("logout");
});

export default authRouter;
