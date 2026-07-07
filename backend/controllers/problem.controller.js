const problemService = require("../services/problem.service");

// Translates common Prisma error codes into messages a user can actually
// act on, instead of a raw stack trace / generic "Server Error".
// https://www.prisma.io/docs/orm/reference/error-reference
function friendlyDbError(error) {
  if (error.code === "P2000") {
    const column = error.meta?.column_name || error.meta?.target;
    return `ข้อมูล${column ? ` (${column})` : ""}ยาวเกินไป กรุณากรอกให้สั้นลง`;
  }
  if (error.code === "P2025") {
    return "ไม่พบข้อมูลที่ต้องการ อาจถูกลบไปแล้ว";
  }
  if (error.code === "P2003") {
    return "ข้อมูลที่อ้างอิงไม่ถูกต้อง (เช่น อาจารย์หรือแท็กที่เลือกไม่มีอยู่จริง)";
  }
  return null;
}

exports.getAllsProblem = async (req, res) => {
  try {
    const { lid, sid } = req.query;
    const problems = await problemService.getAllProblems({ lid, sid });

    res.json(problems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const problem = await problemService.createProblem(req.body);

    res.json(problem.id);
  } catch (error) {
    console.error(error);

    const friendly = friendlyDbError(error);
    res.status(friendly ? 400 : 500).json({
      message: friendly || "Server Error",
    });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const problem = await problemService.updateProblem(
      req.params.id,
      req.body
    );

    res.json(problem);
  } catch (error) {
    console.error(error);

    const friendly = friendlyDbError(error);
    res.status(friendly ? 400 : 500).json({
      message: friendly || "Server Error",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await problemService.updateStatus(req.params.id, status);

    res.json(problem);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.openProblem = async (req, res) => {
  try {
    const problem = await problemService.openProblem(req.params.id);

    res.json(problem);
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      message: error.message || "Server Error",
    });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const result = await problemService.deleteProblem(req.params.pid);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
