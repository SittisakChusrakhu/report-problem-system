const lecturerService = require("../services/lecturer.service");
const lecturerRepository = require("../repositories/lecturer.repository");

exports.getAllLecturer = async (req, res) => {
  try {
    const lecturers = await lecturerService.getAllLecturers();

    res.json(lecturers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getSomeLecturers = async (req, res) => {
  try {
    const { id } = req.query;
    const lecturers = await lecturerService.getLecturersByIds(id);

    res.json(lecturers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.createLecturer(req.body);

    res.json(lecturer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.updateLecturer = async (req, res) => {
  try {
    // เช็คสิทธิ์: ต้องเป็นเจ้าของโปรไฟล์นี้เอง (user_id ตรงกับ token) หรือ
    // เป็นแอดมิน — เดิมไม่มีการเช็คเลย
    const existing = await lecturerRepository.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "ไม่พบอาจารย์นี้" });
    }

    const isOwner = existing.user_id === req.user.id;
    const isAdmin = req.user.role_id === 3;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const lecturer = await lecturerService.updateLecturer(
      req.params.id,
      req.body
    );

    res.json(lecturer);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Could not update lecturer" });
  }
};

exports.deleteLecturer = async (req, res) => {
  try {
    const lecturer = await lecturerService.deleteLecturer(
      req.params.id,
      req.params.uid
    );

    res.json(lecturer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};