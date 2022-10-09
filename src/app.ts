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
import boardsRouter from "./routes/boards/boardsRouter";
import morgan from "morgan";

app.use(morgan("tiny"));

app.use(
	cors({
		credentials: true,
		origin: "http://localhost:3000",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	})
);
app.use(bodyParser.json());

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

const authMiddleware = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	if (req.session.user) {
		next();
	} else {
		res.status(401).json({ message: "Unauthorized", status: 401 });
	}
};

app.get("/", (_, res) => {
	res.send("Hello world!!");
});

app.use("/auth", authRouter);

app.route("/user").get((req, res) => {
	if (req.session.user) {
		res.json(req.session.user);
	} else {
		res.status(403).json({ messsage: "Get out!" });
	}
});

app.use("/user/boards", authMiddleware, boardsRouter);

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
