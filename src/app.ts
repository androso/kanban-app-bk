import express from "express";


const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
	res.send("Hello world!!");
});

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
