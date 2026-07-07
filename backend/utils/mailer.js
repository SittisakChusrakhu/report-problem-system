const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendProblemNotification = async ({
  to,
  studentName,
  pro_title,
  pro_desc,
  pro_image,
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `มีการแจ้งปัญหามาจาก ${studentName}`,
    html:
      `<h2>หัวข้อ: ${pro_title}</h2>` +
      `<p>รายละเอียด: ${pro_desc}</p>` +
      (pro_image ? `<img src="${pro_image}"/>` : ""),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Email error:", error);
  }
};

exports.sendPasswordResetEmail = async ({ to, resetLink }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "รีเซ็ตรหัสผ่านบัญชีของคุณ",
    html:
      `<h2>คำขอรีเซ็ตรหัสผ่าน</h2>` +
      `<p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้ใช้ได้ 15 นาที):</p>` +
      `<p><a href="${resetLink}">${resetLink}</a></p>` +
      `<p>ถ้าคุณไม่ได้เป็นคนขอรีเซ็ตรหัสผ่าน สามารถละเว้นอีเมลนี้ได้เลย</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: " + info.response);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};
