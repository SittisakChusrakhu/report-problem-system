require("dotenv").config();
const express = require("express");
const cors = require("cors");
const UserRoute = require("../routes/user_route");

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.json());
app.use(cors());

app.use("/api", UserRoute);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
  console.log(`
Server ready at: http://localhost:${PORT}`)
);