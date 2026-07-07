const lecturerService = require("../services/lecturer.service");

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
    const lecturer = await lecturerService.deleteLecturer(req.params.id);

    res.json(lecturer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
