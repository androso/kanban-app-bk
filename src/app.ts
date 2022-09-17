import express from "express";
import authRouter from "./routes/auth/authRouter";
import session from "express-session";
import cors from "cors";
import { findById } from "./helpers/helpers";
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(
	session({
		secret: "mySecretNoob",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			secure: false,
			sameSite: "strict",
		},
	})
);
// Deserialize user
app.use((req, res, next) => {
	if (req.session.authenticated && req.session.userId) {
		findById(req.session.userId, (err, user) => {
			if (err) {
				console.log(err);
				res.status(500).send("there was an error");
			} else if (!user) {
				console.log("there's no user with that id");
				res.status(401).send("there's no user with that id");
			} else {
				req.user = user;
				next();
			}
		});
	} else {
		next();
	}
});
app.get("/", (req, res) => {
	res.send("Hello world!!");
});

app.get("/profile", (req, res) => {
	if (req.session.authenticated) {
		res.send(
			`<h1>My profile! if you were redirected heFre, you are logged in! </h1><p> ${req.user?.name} </p><p> ${req.user?.email} </p><p> ${req.user?.id} </p>`
		);
	} else {
		res.send("You are not logged in");
	}
});

app.use(authRouter);
app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
