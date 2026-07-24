const studentService = require("../services/student.service");
const studentRepository = require("../repositories/student.repository");

exports.getAllsStudent = async (req, res) => {
  try {
    const students = await studentService.getAllStudents();

    res.json(students);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getSomeStudents = async (req, res) => {
  try {
    const { id } = req.query;
    const students = await studentService.getStudentsByIds(id);

    res.json(students);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);

    res.json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    // เช็คสิทธิ์: ต้องเป็นเจ้าของโปรไฟล์นี้เอง (user_id ตรงกับ token) หรือ
    // เป็นแอดมิน — เดิมไม่มีการเช็คเลย นักศึกษาคนไหนก็แก้โปรไฟล์คนอื่นได้
    // แค่เดา id ใน URL
    const existing = await studentRepository.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "ไม่พบนักศึกษานี้" });
    }

    const isOwner = existing.user_id === req.user.id;
    const isAdmin = req.user.role_id === 3;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const student = await studentService.updateStudent(
      req.params.id,
      req.body
    );

    res.json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Could not update student" });
  }
};

exports.deleteAllsStudent = async (req, res) => {
  try {
    const { sid, uid } = req.params;
    const result = await studentService.deleteStudent(sid, uid);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};