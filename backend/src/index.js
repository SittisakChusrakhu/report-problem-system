require("dotenv").config();
const express = require("express");
const cors = require("cors");
const UserRoute = require("../routes/user.route");
const errorHandler = require("../middleware/errorHandler");

const app = express();
// NOTE: the second app.use(express.json()) call that used to be here
// re-registered the parser with default options, silently overriding the
// 100mb limit set above. Removed.
app.use(express.json({ limit: "100mb" }));
app.use(cors());

app.use("/api", UserRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
  console.log(`
Server ready at: http://localhost:${PORT}`)
);