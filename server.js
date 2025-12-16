import express from "express";
import path from "path"
import { shortenerRoutes } from "./routes/shortener.routes.js";

const app = express();
// serving html and css file through express.static() middleware.
app.use(express.static(path.resolve("public")));
app.use("/",shortenerRoutes);

// this line tells the application that we are using EJS.
app.set("view engine","ejs")

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on ${PORT} port number...`);
});
