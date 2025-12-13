import path from "path";
import fs from "fs/promises";
import http from "http";
import crypto from "crypto";

// serving html and css file through nodejs...
const serveFile = async (res, file, filetype) => {
  try {
    const filedata = await fs.readFile(path.join("Public", `${file}`), "utf-8");

    res.writeHead(200, { "Content-Type": filetype });
    res.end(filedata);
  } catch (err) {
    res.writeHead(404, { "Content-Type": `text/html` });
    res.end("404 Page not found.");
  }
};

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

// handling get request ...
const server = http.createServer(async (req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      return serveFile(res, "index.html", "text/html");
    } else if (req.url === "/style.css") {
      return serveFile(res, "style.css", "text/css");
    }
    //sending data to frontend...
    else if (req.url === "/getlinks") {
      const links = await loadLinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(links));
    }
    // redirect location....
    else {
      const redirectCode = req.url.slice(1);
      const links = await loadLinks();
      console.log(redirectCode);
      
      if (links[redirectCode]) {
        // redirect to the desired location...
        res.writeHead(302, { location: links[redirectCode] });
        return res.end();
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("ShortCode not found!");
      }
    }
  }

  // handling post request...
  if (req.method === "POST" && req.url === "/shorten") {
    let data = "";

    // while the req is sending data in the form of chunk collect it.
    req.on("data", (chunk) => {
      data += chunk;
    });

    // when req stops sending data parse it and use.
    req.on("end", async () => {
      console.log(JSON.parse(data));
      const { url, shortcode } = JSON.parse(data);

      if (!url) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("URL is required!");
      }

      const links = await loadLinks();
      const finalCode = shortcode || crypto.randomBytes(5).toString("hex");

      if (links[finalCode]) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("ShortCode already exist choose another!");
      }

      links[finalCode] = url;

      await saveLinks(links);

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("URL added successfully!");
    });
  }

  // handling delete request...
  if (req.method === "POST" && req.url === "/deletelink") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", async () => {
      const finalData = JSON.parse(data);
      const id = finalData.id;
      console.log(id);
      
      if (id) {
        const links = await loadLinks();
        delete links[id];
        await saveLinks(links);

        res.writeHead(200, { "Content-Type": "text/plain" });
        return res.end("URL deleted successfully!");
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("Some error occured while deleteing URL!");
      }
    });
  }
});

const PORT = process.env.POST || 3000;
server.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is listening on ${PORT} port number...`);
});
