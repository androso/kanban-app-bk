import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerJsDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
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
import { initializeStatuses } from "./helpers/helpers";

app.use(morgan("tiny"));

app.use(
	cors({
		credentials: true,
		origin: true,
	})
);

app.set("trust proxy", 1); // trust first proxy

app.use(bodyParser.json());

const swaggerOptions: Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Express API Documentation",
			version: "1.0.0",
			description: "API documentation for our Express application",
		},
		servers: [
			{
				url: "http://localhost:8080",
				description: "Development server",
			},
		],
	},
	apis: ["./src/routes/**/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// initialize AppDataSource
AppDataSource.initialize()
	.then(async () => {
		// create a new status
		initializeStatuses();
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
			// httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			secure: process.env.NODE_ENV === "production", // Only require HTTPS in production
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		},
		store: store,
	})
);

const authMiddleware = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	console.log(req.protocol);
	if (req.session.user) {
		next();
	} else {
		res.status(401).json({ message: "Unauthorized", status: 401 });
	}
};

app.get("/", (_, res) => {
	res.send("<h1>Hello world!!</h1>");
});

app.use("/auth", authRouter);

app.route("/user").get((req, res) => {
	if (req.session.user) {
		res.json(req.session.user);
	} else {
		res.status(403).json({ messsage: "Get out!", status: 403 });
	}
});

app.use("/user/boards", authMiddleware, boardsRouter);

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
