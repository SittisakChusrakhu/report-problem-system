const authService = require("../services/auth.service");

exports.login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const result = await authService.login(
      user_email,
      user_password
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      message: error.message || "Server Error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { user_email } = req.body;

    await authService.requestPasswordReset(user_email);

    // Same response whether or not the email exists — see the comment in
    // authService.requestPasswordReset for why.
    res.json({
      message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว",
    });
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      message: error.message || "Server Error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { user_email, token, new_password } = req.body;

    await authService.resetPassword(user_email, token, new_password);

    res.json({ message: "ตั้งรหัสผ่านใหม่สำเร็จ" });
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      message: error.message || "Server Error",
    });
  }
};