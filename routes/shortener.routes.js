import express from "express";
import path from "path";
import fs from "fs/promises";
export const shortenerRoutes = express.Router();

shortenerRoutes.use(express.urlencoded());
shortenerRoutes.use(express.json());


const dataPath = path.join("Data", "links.json");

// getting data from file...
const loadLinks = async () => {
  try {
    const links = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(links);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(dataPath, JSON.stringify({}), "utf-8");
      return {};
    }

    console.error(err);
  }
};

// saving the data into file....
const saveLinks = async (data) => {
  data = JSON.stringify(data);
  await fs.writeFile(dataPath, data, "utf-8");
};


// handling get request for home page and rendering with ejs...
shortenerRoutes.get("/", async (req, res) => {
  const links = await loadLinks()
  // this line tells that we want to render index.ejs with links.
  res.render("index",{links,host : req.host});
});

// getting form data...
shortenerRoutes.post("/senddata", async (req, res) => {
  console.log(req.body);
  const { url, shortcode } = req.body;
  const links = await loadLinks();

  if (links[shortcode]) {
    return res.status(400).redirect("/");
  }

  links[shortcode] = url;

  await saveLinks(links);

  res.redirect("/");
});


// handling delete request...
shortenerRoutes.post("/deletelink", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  const links = await loadLinks();

  delete links[id];

  await saveLinks(links);

  res.end("link deleted");
});


// code to redirect to actual link...
shortenerRoutes.get("/shorted/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  console.log(shortcode);
  const links = await loadLinks();

  if (links[shortcode]) {
    return res.redirect(links[shortcode]);
  } else {
    const filePath = path.resolve("views", "404.html");
    return res.sendFile(filePath);
  }
});
