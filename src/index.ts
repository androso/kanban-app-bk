// We're using ES modules instead of commonJS, you can change this in package.json
import express from 'express';
const app = express();
// You can set your port in the Secrets tab.
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
	res.send("Hello world!!");
})

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
})