import express from "express";
const authRouter = express.Router();
authRouter
	.route("/login")
	.get((req, res) => {
		res.send("login");
	})
	.post((req, res, next) => {
		console.log("posting to /login");
	});

authRouter.route("/register").get((req, res) => {
	res.send("register");
});

authRouter.get("/logout", (req, res) => {
	res.send("logout");
});

export default authRouter;
