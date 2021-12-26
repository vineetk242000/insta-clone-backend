const express = require("express");
require("dotenv").config();
const app = express();
const connectToDb = require("./utility/db");
const cors = require("cors");
const uploadFile = require("./middlewares/fileUpload");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

connectToDb;

app.use(uploadFile);
app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Server is up");
});

// Register new User

app.listen(8080, () => {
  console.log("Server is up");
});
