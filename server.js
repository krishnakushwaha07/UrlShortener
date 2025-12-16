import express from "express";
import { shortenerRoutes } from "./routes/shortener.routes.js";

const app = express();
app.set("view engine","ejs")

// serving html and css file through express.static() middleware.
app.use(express.static("public"));


app.use("/",shortenerRoutes);

// this line tells the application that we are using EJS.

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on ${PORT} port number...`);
});
