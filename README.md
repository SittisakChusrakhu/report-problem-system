# 📋 โปรเจกต์จบ: ระบบรายงานปัญหา

ระบบจัดการรายงานปัญหา รองรับ role **student / lecturer / admin**

| ส่วน | เทคโนโลยี | โฟลเดอร์ |
|---|---|---|
| Backend | Express + Prisma + MySQL | `/backend` |
| Frontend | Next.js + TypeScript + MUI | `/frontend` |

---

## 🔧 สิ่งที่ต้องติดตั้งก่อนรัน (Windows)

| โปรแกรม | ใช้ทำอะไร | ลิงก์ดาวน์โหลด |
|---|---|---|
| **Node.js** (v18+) | รันทั้ง backend และ frontend | [nodejs.org](https://nodejs.org) |
| **Docker Desktop** | รันฐานข้อมูล MySQL ผ่าน `docker-compose.yml` | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | โคลน/จัดการเวอร์ชันโค้ด | [git-scm.com](https://git-scm.com/download/win) |
| **Yarn** *(ตัวเลือก)* | backend มี `yarn.lock` ให้ (ใช้ npm แทนได้) | ติดตั้งผ่าน npm |
| **VS Code** | โปรแกรมแก้โค้ด | [code.visualstudio.com](https://code.visualstudio.com) |

> ภาษา/เฟรมเวิร์กอื่นๆ เช่น JavaScript/TypeScript, Express.js, Next.js + React, Prisma จะติดมากับ `npm install` อัตโนมัติ ไม่ต้องลงแยก

---

## 🪜 ขั้นตอนติดตั้งโปรแกรมพื้นฐาน

### 1. Node.js
1. เข้า [https://nodejs.org](https://nodejs.org)
2. กดปุ่มเขียว **LTS** (เวอร์ชันเสถียร แนะนำ)
3. เปิดไฟล์ `.msi` ที่โหลดมา แล้วกด Next ไปเรื่อยๆ จนติดตั้งเสร็จ (ใช้ค่า default ได้เลย)
4. เปิด Command Prompt หรือ PowerShell แล้วเช็คว่าลงสำเร็จ:
   ```bash
   node -v
   npm -v
   ```
   ถ้าขึ้นเลขเวอร์ชัน (เช่น `v20.x.x`) แปลว่าใช้ได้แล้ว

### 2. Git
1. เข้า [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. ตัวติดตั้งจะเริ่มดาวน์โหลดอัตโนมัติ
3. เปิดไฟล์ติดตั้ง กด Next ไปเรื่อยๆ (ค่า default โอเคหมด)
4. เช็คผล:
   ```bash
   git --version
   ```

### 3. Docker Desktop (สำหรับรัน MySQL)
1. เข้า [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. กด **Download for Windows**
3. ติดตั้งแล้ว รีสตาร์ทเครื่องตามที่มันบอก
4. เปิดโปรแกรม Docker Desktop ทิ้งไว้ (ต้องเปิดค้างไว้ตลอดเวลาที่จะรันโปรเจกต์)
5. ถ้าเครื่องเป็น Windows Home อาจต้องติดตั้ง WSL2 เพิ่ม — ตัวติดตั้ง Docker จะมีลิงก์/คำสั่งให้กดอัตโนมัติ ทำตามหน้าจอได้เลย
6. เช็คผล (เปิด PowerShell ใหม่):
   ```bash
   docker --version
   docker compose version
   ```

### 4. Yarn *(ตัวเลือก)*
หลังจากมี Node.js แล้ว เปิด PowerShell พิมพ์:
```bash
npm install -g yarn
yarn -v
```

### 5. VS Code
1. เข้า [https://code.visualstudio.com](https://code.visualstudio.com)
2. กด **Download for Windows** แล้วติดตั้งตามปกติ

---

## 🚀 ขั้นตอนเปิดโปรเจกต์ (หลังลงโปรแกรมข้างบนครบแล้ว)

1. แตกไฟล์ zip โปรเจกต์ไปไว้ที่โฟลเดอร์ที่ต้องการ เช่น
   ```
   C:\Users\ชื่อคุณ\Documents\Project-main
   ```

2. เปิด VS Code → `File > Open Folder` → เลือกโฟลเดอร์ `Project-main`

3. เปิด Terminal ใน VS Code (`Terminal > New Terminal`) แล้วตั้งฐานข้อมูล MySQL ด้วย Docker:
   ```bash
   cd backend
   docker compose up -d
   ```

4. สร้างไฟล์ `.env` ใหม่ในโฟลเดอร์ `backend`
   (คลิกขวาในช่อง Explorer ของ VS Code → New File → ตั้งชื่อ `.env`) — ในโปรเจกต์มีไฟล์ `backend/.env.example` เป็นตัวอย่างอยู่แล้ว สามารถ copy แล้วเปลี่ยนชื่อเป็น `.env` ได้เลย ข้างในต้องมีตัวแปรดังนี้:
   ```env
   # ฐานข้อมูล (MySQL ผ่าน Docker)
   DATABASE_URL="mysql://user:password@localhost:3306/db"

   # พอร์ตของ server (ค่า default คือ 4000)
   PORT=4000

   # ใช้เข้ารหัส JWT token ตอน login
   JWT_SECRET=change-this-to-a-long-random-string

   # ใช้ส่งอีเมลแจ้งเตือน/ลืมรหัสผ่าน (ต้องใช้ Gmail App Password ไม่ใช่รหัสผ่านปกติ)
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=your-gmail-app-password

   # URL ของ frontend (ใช้สร้างลิงก์ในอีเมล เช่น ลิงก์ reset password)
   FRONTEND_URL=http://localhost:3000
   ```
   > ⚠️ ตัวแปร `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` จำเป็นต่อการทำงานของระบบ login และแจ้งเตือนทางอีเมล ถ้าไม่ใส่ ฟีเจอร์พวกนี้จะพัง

5. ติดตั้ง dependency แล้วสร้างตารางฐานข้อมูล (โปรเจกต์นี้มี migration ไว้อยู่แล้วใน `prisma/migrations` ให้ใช้ `migrate deploy` เพื่อรัน migration ที่มีอยู่เข้าฐานข้อมูล ไม่ต้องสร้างใหม่):
   ```bash
   yarn install          # หรือ npm install
   npx prisma migrate deploy
   ```
   *(`npx prisma generate` จะถูกรันอัตโนมัติหลัง install อยู่แล้ว ไม่ต้องรันแยก)*

   ถ้าต้องการข้อมูลตัวอย่างในฐานข้อมูล (seed data) รันเพิ่ม:
   ```bash
   npx prisma db seed
   ```

6. รัน backend:
   ```bash
   npm run dev
   ```
   จะขึ้นว่า server ready ที่ **http://localhost:4000** — เปิด terminal ทิ้งไว้แบบนี้ ห้ามปิด

7. เปิด Terminal ใหม่อีกอัน (กด `+` ที่มุมขวาบนของ Terminal panel) แล้วรัน frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   จะรันที่ **http://localhost:3000** — เปิดเบราว์เซอร์เข้าไปดูได้เลย

---

## 📝 สรุปคำสั่งทั้งหมด (Quick Reference)

```bash
# 1. ตั้งฐานข้อมูล
cd backend
docker compose up -d
# copy backend/.env.example เป็น backend/.env แล้วใส่ค่าให้ครบ (ดูรายละเอียดด้านบน)

# 2. ติดตั้ง dependency + สร้างตาราง
yarn install                # หรือ npm install
npx prisma migrate deploy   # รัน migration ที่มีอยู่แล้วในโปรเจกต์เข้าฐานข้อมูล

# 3. รัน backend
npm run dev                 # -> http://localhost:4000
# (หรือ npm run moni ถ้าอยากให้ auto-restart ตอนแก้โค้ดด้วย nodemon)

# 4. อีก terminal หนึ่ง รัน frontend
cd ../frontend
npm install
npm run dev                 # -> http://localhost:3000
```

> 💡 **หมายเหตุ:** ถ้าคำสั่ง `npx prisma migrate deploy` ใช้ไม่ได้ ลองใช้:
> ```bash
> node_modules\.bin\prisma migrate deploy
> ```
