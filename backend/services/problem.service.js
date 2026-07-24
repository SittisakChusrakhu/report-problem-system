const problemRepository = require("../repositories/problem.repository");
const mailer = require("../utils/mailer");
const notificationService = require("./notification.service");

exports.getAllProblems = async ({ lid, sid }) => {
  if (lid) {
    return await problemRepository.findByLecturerId(lid);
  }

  if (sid) {
    return await problemRepository.findByStudentId(sid);
  }

  return await problemRepository.findAll();
};

// ใช้ตอนเปิดดู/แก้ไขปัญหารายการเดียว — คืนข้อมูลเต็มรวม pro_images ต่างจาก
// getAllProblems ที่ตัด pro_images ออกเพื่อความเร็วของหน้ารายการ
exports.getProblemById = async (id) => {
  const problem = await problemRepository.findById(id);

  if (!problem) {
    throw { status: 404, message: "ไม่พบปัญหานี้" };
  }

  return problem;
};

exports.createProblem = async (body) => {
  const { pro_title, pro_type, pro_desc, pro_image, lecturerId, stu, tags } =
    body;

  const student = await problemRepository.findStudentWithUser(stu);

  const problem = await problemRepository.create({
    pro_title,
    pro_type,
    pro_desc,
    pro_images: pro_image,
    student: { connect: { id: Number(stu) } },
    // A problem can be created unassigned (auto-assign / admin triage later),
    // so lecturerId is optional here — unlike the old many-to-many lect_id.
    lecturer: lecturerId
      ? { connect: { id: Number(lecturerId) } }
      : undefined,
    // Frontend sends full Tag objects ({id, name}), but Prisma's connect
    // where-clause only accepts exactly one unique field — passing both id
    // and name together is rejected. Strip down to just the id.
    tags: tags && tags.length
      ? { connect: tags.map((tag) => ({ id: tag.id })) }
      : undefined,
  });

  if (lecturerId) {
    const lecturer = await problemRepository.findLecturerWithUser(
      lecturerId
    );

    if (lecturer) {
      await mailer.sendProblemNotification({
        to: lecturer.user.user_email,
        studentName: student.user.user_name,
        pro_title,
        pro_desc,
        pro_image,
      });
    }

    // แจ้งเตือนอาจารย์ (กระดิ่งฝั่งอาจารย์) ว่ามีนักศึกษาแจ้งปัญหาใหม่เข้ามา
    // ไม่ throw ถ้าล้มเหลว เพื่อไม่ให้กระทบ flow การสร้างปัญหาหลัก
    try {
      await notificationService.notifyLecturerByLecturerId({
        lecturerId,
        pro_id: problem.id,
      });
    } catch (error) {
      console.error("แจ้งเตือนอาจารย์ไม่สำเร็จ:", error);
    }
  }
  // NOTE: if no lecturer is assigned at creation time, this is where an
  // auto-assign step (matching stu_faculty -> LecturerExpertise/lect_faculty)
  // would plug in. Not implemented here — flagging it since the schema
  // comments describe that as the intended design.

  return problem;
};

exports.updateProblem = async (id, body) => {
  const { pro_title, pro_type, pro_desc, pro_images } = body;

  return await problemRepository.update(id, {
    pro_title,
    pro_type,
    pro_desc,
    pro_images,
  });
};

exports.updateStatus = async (id, status) => {
  return await problemRepository.updateStatus(id, status);
};

// Called when a lecturer opens a problem's detail view. Only moves it
// forward (PENDING/UNASSIGNED -> IN_PROGRESS) — never moves it backward
// just because someone reopened an already RESOLVED/CLOSED problem.
exports.openProblem = async (id) => {
  const problem = await problemRepository.findById(id);

  if (!problem) {
    throw { status: 404, message: "ไม่พบปัญหานี้" };
  }

  if (problem.status === "PENDING" || problem.status === "UNASSIGNED") {
    const updated = await problemRepository.updateStatus(id, "IN_PROGRESS");

    // แจ้งเตือนนักศึกษาเจ้าของปัญหาว่าสถานะเปลี่ยนแล้ว ไม่ throw ถ้าล้มเหลว
    try {
      await notificationService.notifyStudentByStudentId({
        studentId: problem.sid,
        pro_id: id,
      });
    } catch (error) {
      console.error("แจ้งเตือนนักศึกษาไม่สำเร็จ:", error);
    }

    return updated;
  }

  return problem;
};

exports.deleteProblem = async (id) => {
  await problemRepository.delete(id);

  return "delete successfully";
};