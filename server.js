const express = require("express");
const {
  generatePyFile,
  executePyFile,
  generateJsFile,
  executeJsFile,
} = require("./py_jy");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); // Add this line to parse JSON

// const baseURL = process.env.NODE_ENV === 'production' ? 'https://code-editor-b2st.onrender.com' : 'http://localhost:5000';

//deploy
const path = require("path");

app.use(express.static(path.join(__dirname, "build")));

//routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to code editor</h1>");
});

app.post("/py", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.json({ message: "write code! !" });
  }
  (async () => {
    try {
      const filePath = await generatePyFile("py", code);
      const output = await executePyFile(filePath);
      res.json({ output });
    } catch (error) {
      console.error("Error:", error);
    }
  })();
});

app.post("/js", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.json({ message: "write code! !" });
  }

  try {
    const filePath = await generateJsFile("js", code);
    const output = await executeJsFile(filePath);
    return res.json({ output });
  } catch (error) {
    res.json(error);
  }
});

// Catch-all handler to serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
const PORT = process.env.PORT || 3715;

app.listen(PORT, () => {
  console.log("app server started on ", PORT);
});
