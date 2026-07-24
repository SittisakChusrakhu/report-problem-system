require("dotenv").config();
const express = require("express");
const cors = require("cors");
const UserRoute = require("../routes/user.route");
const errorHandler = require("../middleware/errorHandler");

const app = express();

// Railway วาง app ไว้หลัง reverse proxy — ถ้าไม่ตั้งค่านี้ express-rate-limit
// (และ req.ip ทั่วไป) จะเห็นแค่ IP ของ proxy เดียวสำหรับทุกคน ทำให้ผู้ใช้
// ทุกคนไปแชร์โควต้า rate limit ก้อนเดียวกัน (คนหนึ่งโดนลิมิต คนอื่นโดนไปด้วย)
app.set("trust proxy", 1);
// NOTE: the second app.use(express.json()) call that used to be here
// re-registered the parser with default options, silently overriding the
// 100mb limit set above. Removed.
app.use(express.json({ limit: "100mb" }));
// express-rate-limit ใส่ header RateLimit-* มาบอกว่าเหลือกี่ครั้ง แต่
// เบราว์เซอร์บล็อก JS ไม่ให้อ่าน response header เองเป็นค่า default
// (เว้นแต่ server จะอนุญาตผ่าน exposedHeaders) เปิดไว้ให้ frontend
// เอาไปโชว์ "เหลือโอกาสอีกกี่ครั้ง" ได้
app.use(
  cors({
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  })
);

app.use("/api", UserRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
  console.log(`
Server ready at: http://localhost:${PORT}`)
);