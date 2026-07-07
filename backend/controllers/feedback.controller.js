const feedbackService = require("../services/feedback.service");

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback(req.body);

    res.json(feedback);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getFeedbackForProblem = async (req, res) => {
  try {
    const { pro_id } = req.query;
    const feedback = await feedbackService.getFeedbackForProblem(pro_id);

    res.json(feedback);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
