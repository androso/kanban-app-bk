import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRouter from "./routes/auth/authRouter";
import session from "express-session";
import cors from "cors";
import { MemoryStore } from "express-session";
import bodyParser from "body-parser";
const app = express();
const PORT = process.env.PORT || 8080;
const store = new MemoryStore();
import { AppDataSource } from "./sql-orm/data-source";

// initialize AppDataSource
AppDataSource.initialize()
	.then(async () => {
		console.log("database initialized correctly!");
	})
	.catch((err) => {
		console.log("database initialization failed!");
		console.log(err);
	});

app.use(
	cors({
		credentials: true,
		origin: "http://localhost:3000",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	})
);
app.use(bodyParser.json());

app.use(
	session({
		name: "sessionId",
		secret: "mySecretNoob",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			sameSite: "lax",
			secure: false,
		},
		store: store,
	})
);

app.get("/", (_, res) => {
	res.send("Hello world!!");
});

app.use("/auth", authRouter);

app.route("/me").get((req, res) => {
	if (req.session.user) {
		res.json(req.session.user);
	} else {
		res.json({ messsage: "Get out!" });
	}
});

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
