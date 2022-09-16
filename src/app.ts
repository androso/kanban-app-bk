import express from "express";
import authRouter from "./routes/auth/authRouter";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
	res.send("Hello world!!");
});

app.get("/profile", (req, res) => {
	res.send("My profile! if you were redirected heFre, you are logged in!");
});

app.use(authRouter);
app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
