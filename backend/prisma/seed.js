const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ==================== DATA ====================

const faculties = ["วิทยาศาสตร์", "วิศวกรรมศาสตร์", "บริหารธุรกิจ", "ศิลปศาสตร์", "นิติศาสตร์"];
const majors = {
  "วิทยาศาสตร์": ["วิทยาการคอมพิวเตอร์", "เคมี", "ฟิสิกส์", "ชีววิทยา"],
  "วิศวกรรมศาสตร์": ["วิศวกรรมคอมพิวเตอร์", "วิศวกรรมไฟฟ้า", "วิศวกรรมโยธา"],
  "บริหารธุรกิจ": ["การตลาด", "การเงิน", "การจัดการ"],
  "ศิลปศาสตร์": ["ภาษาอังกฤษ", "ภาษาไทย", "ประวัติศาสตร์"],
  "นิติศาสตร์": ["นิติศาสตร์"],
};

const studentFirstNames = [
  "สมชาย", "สมหญิง", "วิชัย", "วิภา", "ประสิทธิ์", "ประไพ", "สุชาติ", "สุนิสา",
  "อานนท์", "อารีย์", "ธนกร", "ธนิดา", "พิชัย", "พิมพ์", "รัตนา", "รัตนชัย",
  "ณัฐพล", "ณัฐธิดา", "ชัยวัฒน์", "ชุติมา", "กิตติ", "กิตติยา", "ศักดิ์ชัย", "ศิริพร",
  "ปิยะ", "ปิยะมาศ", "จิรายุ", "จิราพร", "วรวุฒิ", "วรรณา", "ภาณุ", "ภาวิณี",
  "ธีรพล", "ธีรนุช", "สันติ", "สันทนา", "ทวีศักดิ์", "ทิพย์วรรณ", "เอกชัย", "เอกลักษณ์",
  "นิติ", "นิภา", "ไพรัตน์", "ไพลิน", "ศิวกร", "ศิวพร", "อภิชาติ", "อภิญญา",
  "ภูมิ", "ภูริตา"
];

const studentLastNames = [
  "ใจดี", "มีสุข", "รักดี", "สุขสม", "ดีงาม", "มั่นคง", "สว่างใจ", "แสงทอง",
  "ทองดี", "เงินดี", "ศรีสุข", "วงศ์ดี", "พงษ์ดี", "วิชาดี", "สมศรี", "ทองคำ",
  "เพชรดี", "นาคดี", "บุญมา", "บุญส่ง", "คงดี", "ยั่งยืน", "เจริญ", "รุ่งเรือง",
  "มานะ", "พากเพียร", "อุตสาหะ", "ขยันดี", "ฉลาดดี", "สุจริต"
];

const lectFirstNames = [
  "ดร.สมศักดิ์", "ผศ.วันเพ็ญ", "รศ.ประเสริฐ", "อ.สุภาพร", "ดร.ชัยณรงค์",
  "ผศ.ดร.นงลักษณ์", "อ.วิศิษฐ์", "รศ.ดร.อัจฉรา", "ดร.ธีระ", "ผศ.มาลี"
];

const lectLastNames = [
  "วงศ์วิวัฒน์", "สุขประเสริฐ", "รักวิทยา", "ใจเย็น", "มีปัญญา",
  "ดีเลิศ", "ศรีวิไล", "พัฒนาดี", "คงความดี", "เจริญวิทย์"
];

const tagNames = [
  "การบ้าน", "ข้อสอบ", "คอมพิวเตอร์", "อินเทอร์เน็ต", "ห้องเรียน",
  "อุปกรณ์การเรียน", "ตารางเรียน", "อาจารย์", "เพื่อน", "ทุนการศึกษา"
];

const problemTypes = ["ปัญหาการเรียน", "ปัญหาอุปกรณ์การเรียน"];

const problemTemplates = [
  { title: "ไม่เข้าใจเนื้อหาวิชา", desc: "ไม่เข้าใจเนื้อหาที่สอนในคาบเรียน อธิบายเร็วเกินไปและไม่มีเวลาถาม" },
  { title: "คอมพิวเตอร์ในห้องแลปเสีย", desc: "คอมพิวเตอร์ในห้องปฏิบัติการทำงานช้ามากหรือเปิดไม่ติด ทำให้ทำงานได้ยาก" },
  { title: "อินเทอร์เน็ตในห้องเรียนช้า", desc: "สัญญาณ WiFi ในห้องเรียนอ่อนมาก ทำให้ค้นคว้าข้อมูลไม่ได้" },
  { title: "ไม่มีหนังสือเรียน", desc: "หนังสือเรียนหมดแล้วในร้านค้า ไม่สามารถหาซื้อได้ทันเวลา" },
  { title: "โปรเจกเตอร์ในห้องเสีย", desc: "โปรเจกเตอร์ในห้องเรียนฉายภาพไม่ชัดหรือใช้งานไม่ได้" },
  { title: "ปัญหาการส่งงาน", desc: "ระบบออนไลน์สำหรับส่งงานล่มทำให้ไม่สามารถส่งงานตามกำหนดได้" },
  { title: "เนื้อหาในสไลด์ไม่ชัดเจน", desc: "สไลด์ที่อาจารย์ใช้สอนมีตัวหนังสือเล็กเกินไป อ่านไม่ออกจากด้านหลัง" },
  { title: "ขาดแคลนอุปกรณ์ทดลอง", desc: "อุปกรณ์สำหรับทำการทดลองในห้องปฏิบัติการไม่เพียงพอกับจำนวนนักศึกษา" },
  { title: "ตารางเรียนทับซ้อน", desc: "วิชาบังคับมีตารางเรียนทับซ้อนกัน ทำให้เลือกลงทะเบียนได้ยาก" },
  { title: "ไม่เข้าใจการทำโปรเจกต์", desc: "ไม่ชัดเจนเรื่องข้อกำหนดของโปรเจกต์ที่ได้รับมอบหมาย" },
  { title: "แอร์ในห้องเรียนเสีย", desc: "แอร์ในห้องเรียนทำงานผิดปกติ อากาศร้อนมากจนตั้งสมาธิเรียนไม่ได้" },
  { title: "เก้าอี้ในห้องชำรุด", desc: "เก้าอี้นักศึกษาหลายตัวชำรุดหรือไม่มั่นคง เป็นอันตราย" },
  { title: "ปัญหาการเข้าถึงเอกสาร", desc: "ไม่สามารถเข้าถึงเอกสารประกอบการเรียนที่อาจารย์แชร์ออนไลน์ได้" },
  { title: "ซอฟต์แวร์ที่ต้องใช้ไม่มีลิขสิทธิ์", desc: "ซอฟต์แวร์ที่ใช้ในการเรียนไม่มี license ให้นักศึกษาใช้งาน" },
  { title: "ปัญหาความเข้าใจภาษาอังกฤษ", desc: "หนังสือและเอกสารเรียนเป็นภาษาอังกฤษทั้งหมด ไม่มีฉบับภาษาไทย" },
  { title: "ระบบลงทะเบียนมีปัญหา", desc: "ระบบลงทะเบียนเรียนออนไลน์ล่มในช่วงเปิดลงทะเบียน" },
  { title: "ไม่มีพื้นที่นั่งอ่านหนังสือ", desc: "ห้องสมุดมีที่นั่งไม่เพียงพอ โดยเฉพาะช่วงก่อนสอบ" },
  { title: "ปัญหาเรื่องกลุ่มทำงาน", desc: "สมาชิกในกลุ่มไม่ร่วมมือทำงานกลุ่ม ทำให้งานไม่เสร็จตามกำหนด" },
  { title: "เครื่องพิมพ์ในคณะเสีย", desc: "เครื่องพิมพ์ที่ให้บริการนักศึกษาชำรุด ไม่สามารถพิมพ์เอกสารได้" },
  { title: "ปัญหาเสียงรบกวนในห้องเรียน", desc: "มีเสียงรบกวนจากภายนอกห้องเรียนมาก ทำให้ฟังอาจารย์สอนไม่รู้เรื่อง" },
];

// ==================== SEED ====================

async function main() {
  console.log("🌱 เริ่ม seed ข้อมูลตัวอย่าง...\n");

  // 1. Roles
  console.log("📋 สร้าง roles...");
  const roleStudent = await prisma.roles.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, role_name: "Student", role_desc: "นักศึกษา" },
  });
  const roleLecturer = await prisma.roles.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, role_name: "Lecturer", role_desc: "อาจารย์" },
  });
  const roleAdmin = await prisma.roles.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, role_name: "Admin", role_desc: "ผู้ดูแลระบบ" },
  });
  console.log("✅ roles พร้อม\n");

  // 2. Tags
  console.log("🏷️  สร้าง tags...");
  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags.push(tag);
  }
  console.log(`✅ สร้าง ${tags.length} tags\n`);

  // 3. Lecturers (10 คน)
  console.log("👨‍🏫 สร้างอาจารย์ 10 คน...");
  const lecturerIds = [];
  for (let i = 0; i < 10; i++) {
    const fname = lectFirstNames[i];
    const lname = lectLastNames[i];
    const email = `lecturer${i + 1}@ubu.ac.th`;

    const user = await prisma.User.upsert({
      where: { user_email: email },
      update: {},
      create: {
        user_name: `${fname} ${lname}`,
        user_email: email,
        user_password: `Lect${i + 1}@2024`,
        role_id: 2,
      },
    });

    const lect = await prisma.Lecturer.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        lect_roomnum: `EN${100 + (i + 1)}`,
        avatar: "",
        user_id: user.id,
      },
    });

    lecturerIds.push(lect.id);
    console.log(`  ✓ ${fname} ${lname} | ${email} | รหัสผ่าน: Lect${i + 1}@2024`);
  }
  console.log();

  // 4. Students (50 คน)
  console.log("👨‍🎓 สร้างนักศึกษา 50 คน...");
  const studentIds = [];
  for (let i = 0; i < 50; i++) {
    const fname = studentFirstNames[i];
    const lname = studentLastNames[i % studentLastNames.length];
    const email = `student${i + 1}@ubu.ac.th`;
    const stuId = `64${String(i + 1).padStart(6, "0")}`;
    const grade = String((i % 4) + 1);
    const faculty = faculties[i % faculties.length];
    const majorList = majors[faculty];
    const major = majorList[i % majorList.length];

    const user = await prisma.User.upsert({
      where: { user_email: email },
      update: {},
      create: {
        user_name: `${fname} ${lname}`,
        user_email: email,
        user_password: `Stu${i + 1}@2024`,
        role_id: 1,
      },
    });

    const stu = await prisma.Student.upsert({
      where: { stu_id: stuId },
      update: {},
      create: {
        stu_id: stuId,
        stu_major: major,
        stu_grade: grade,
        stu_faculty: faculty,
        avatar: "",
        user_id: user.id,
      },
    });

    studentIds.push(stu.id);
    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ สร้างนักศึกษาแล้ว ${i + 1}/50 คน`);
    }
  }
  console.log();

  // 5. Problems (100 รายการ)
  console.log("📝 สร้างปัญหา 100 รายการ...");
  const statuses = [
    "กำลังส่งเรื่อง",
    "กำลังส่งเรื่อง",
    "กำลังส่งเรื่อง",
    "ได้รับการแก้ปัญหาแล้ว",
    "การแจ้งปัญหาถูกปฏิเสธ",
  ];

  for (let i = 0; i < 100; i++) {
    const template = problemTemplates[i % problemTemplates.length];
    const stuId = studentIds[i % studentIds.length];
    const lectId = lecturerIds[i % lecturerIds.length];
    const proType = problemTypes[i % problemTypes.length];
    const status = statuses[i % statuses.length];

    // สุ่ม tags 1-3 อัน
    const numTags = (i % 3) + 1;
    const selectedTags = tags.slice(i % tags.length, (i % tags.length) + numTags);
    const connectTags = selectedTags.length > 0
      ? selectedTags.map((t) => ({ id: t.id }))
      : [{ id: tags[0].id }];

    // วันที่ย้อนหลัง 0-180 วัน
    const daysAgo = i * 1.8;
    const datetime = new Date();
    datetime.setDate(datetime.getDate() - Math.floor(daysAgo));

    await prisma.Problem.create({
      data: {
        pro_title: `${template.title} (${i + 1})`,
        pro_type: proType,
        pro_desc: template.desc,
        pro_images: "",
        status,
        datetime,
        stu: { connect: { id: stuId } },
        lect_id: { connect: [{ id: lectId }] },
        tags: { connect: connectTags },
      },
    });

    if ((i + 1) % 20 === 0) {
      console.log(`  ✓ สร้างปัญหาแล้ว ${i + 1}/100 รายการ`);
    }
  }

  console.log("\n✅ Seed เสร็จสมบูรณ์!\n");
  console.log("═══════════════════════════════════════════════");
  console.log("📊 สรุปข้อมูลที่สร้าง:");
  console.log("  - อาจารย์  : 10 คน  (lecturer1@ubu.ac.th – lecturer10@ubu.ac.th)");
  console.log("  - นักศึกษา : 50 คน  (student1@ubu.ac.th  – student50@ubu.ac.th)");
  console.log("  - รหัสผ่านอาจารย์ : Lect1@2024 – Lect10@2024");
  console.log("  - รหัสผ่านนักศึกษา: Stu1@2024  – Stu50@2024");
  console.log("  - ปัญหา    : 100 รายการ");
  console.log("  - แท็ก     : 10 หมวด");
  console.log("═══════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
