const feedbackRepository = require("../repositories/feedback.repository");
const problemRepository = require("../repositories/problem.repository");
const notificationService = require("./notification.service");

exports.createFeedback = async (body) => {
  const { pro_id, lect_id, stu_id, feed_massage } = body;

  const feedback = await feedbackRepository.create({
    feed_massage,
    problem: { connect: { id: Number(pro_id) } },
    lecturer: { connect: { id: Number(lect_id) } },
    student: { connect: { id: Number(stu_id) } },
  });

  // A lecturer replying to a problem is treated as resolving it. If a
  // problem needs multiple back-and-forth replies before it's truly done,
  // this is the spot to revisit (e.g. only resolve on an explicit
  // "mark resolved" action instead of on every reply).
  await problemRepository.updateStatus(pro_id, "RESOLVED");

  // แจ้งเตือนนักศึกษาเจ้าของปัญหาว่าอาจารย์ตอบกลับแล้ว ไม่ throw ถ้าล้มเหลว
  // เพราะการตอบกลับของอาจารย์ควรสำเร็จแม้แจ้งเตือนจะมีปัญหา
  try {
    await notificationService.notifyStudentByStudentId({
      studentId: stu_id,
      pro_id,
      feed_id: feedback.id,
    });
  } catch (error) {
    console.error("แจ้งเตือนนักศึกษาไม่สำเร็จ:", error);
  }

  return feedback;
};

exports.getFeedbackForProblem = async (pro_id) => {
  return await feedbackRepository.findByProblemId(pro_id);
};
