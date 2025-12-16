import express from "express";
import { fileURLToPath } from "url";
import path from "path"
import { shortenerRoutes } from "./routes/shortener.routes.js";
import { fileURLToPath } from "url";

const app = express();
app.set("view engine","ejs")

// serving html and css file through express.static() middleware.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname,"public")));


app.use("/",shortenerRoutes);

// this line tells the application that we are using EJS.

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on ${PORT} port number...`);
});
