const prisma = require("../src/connection");

exports.create = (data) => {
  return prisma.feedback.create({ data });
};

exports.findByProblemId = (pro_id) => {
  return prisma.feedback.findMany({
    where: { pro_id: Number(pro_id) },
    orderBy: { create_at: "asc" },
  });
};
