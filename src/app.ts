
const express = require("express") 
const app = express();
// You can set your port in the Secrets tab.
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
	
	res.send("Hello world!!");
});

app.listen(PORT, () => {
	console.log("app listening on port", PORT);
});
