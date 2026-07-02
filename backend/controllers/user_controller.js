var nodemailer = require("nodemailer");
const prisma = require("../src/connection");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//roles

module.exports.createroles = function (req, res) {
  const { role_name, role_desc } = req.body;
  prisma.roles
    .create({
      data: {
        role_name,
        role_desc,
      },
    })
    .then((roles) => {
      res.json(roles);
    });
};

module.exports.getAllsroles = function (req, res) {
  prisma.roles.findMany().then((roles) => {
    res.json(roles);
  });
};

module.exports.getOneroles = function (req, res) {
  const { id } = req.params;
  prisma.roles.findUnique({ where: { id: Number(id) } }).then((roles) => {
    res.json(roles);
  });
};

//

//User
module.exports.getAllsUser = function (req, res) {
  prisma.User.findMany().then((User) => {
    res.json(User);
  });
};

module.exports.createUser = function (req, res) {
  const { user_name, user_password, user_email, role_id } = req.body;
  prisma.User.create({
    data: {
      user_name,
      user_password,
      user_email,
      role_id,
    },
  }).then((User) => {
    res.json(User);
  });
};

module.exports.updateUser = function (req, res) {
  const { id } = req.params;
  const { user_name, user_password, user_email, roles_id } = req.body;
  prisma.User.update({
    where: { id: Number(id) },
    data: {
      user_name,
      user_password,
      user_email,
      user_avatar,
      roles_id,
    },
  }).then((User) => {
    res.json(User);
  });
};

module.exports.deleteUser = function (req, res) {
  const { id } = req.params;
  prisma.User.delete({
    where: { id: Number(id) },
  }).then((User) => {
    res.json(User);
  });
};

//login

module.exports.login = function (req, res) {
  const { user_email, user_password } = req.body;
  prisma.User.findUnique({
    where: {
      user_email: user_email,
    },
  }).then((User) => {
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (User.user_password === user_password) {
      if (User.role_id === 1) {
        prisma.Student.findFirst({
          where: { user_id: User.id },
        }).then((result) => res.json(result));
      } else if (User.role_id === 2) {
        prisma.Lecturer.findFirst({
          where: { user_id: User.id },
        }).then((result) => res.json(result));
      } else if (User.role_id === 3) {
        // Admin — ส่งข้อมูล User กลับไปเลย
        res.json(User);
      }
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  }).catch((error) => {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  });
};

//Student
module.exports.getAllsStudent = async function (req, res) {
  const students = await prisma.Student.findMany();
  const result = await Promise.all(
    students.map((Student) => {
      return (user = prisma.User.findUnique({
        where: {
          id: Student.user_id,
        },
      }).then((user) => {
        return {
          id: Student.id,
          uid: user.id,
          username: user.user_name,
          stu_id: Student.stu_id,
          stu_email: user.user_email,
          stu_grade: Student.stu_grade,
          stu_faculty: Student.stu_faculty,
          stu_major: Student.stu_major,
        };
      }));
    })
  );
  res.json(result);
};

module.exports.getSomeStudents = async function (req, res) {
  const { id } = req.query;
  const ids = [Number(id)];
  const students = await prisma.Student.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  const result = await Promise.all(
    students.map((student) => {
      return (user = prisma.User.findUnique({
        where: {
          id: student.user_id,
        },
      }).then((user) => {
        return {
          id: student.id,
          uid: user.id,
          username: user.user_name,
          stu_id: student.stu_id,
          stu_email: user.user_email,
          stu_grade: student.stu_grade,
          stu_faculty: student.stu_faculty,
          stu_major: student.stu_major,
          avatar: student.avatar,
        };
      }));
    })
  );
  res.json(result);
};

module.exports.createStudent = function (req, res) {
  const { stu_id, stu_major, stu_grade, stu_faculty, avatar, user_id } =
    req.body;
  prisma.Student.create({
    data: {
      stu_id,
      stu_major,
      stu_grade,
      stu_faculty,
      user_id,
      avatar,
    },
  }).then((Student) => {
    res.json(Student);
  });
};

module.exports.updateStudent = function (req, res) {
  const { id } = req.params;
  const { stu_id, stu_major, stu_grade, stu_faculty, avatar, uid } = req.body;

  prisma.Student.update({
    where: { id: Number(id) },
    data: {
      stu_id,
      stu_major,
      stu_grade,
      stu_faculty,
      avatar,
      uid: {
        update: {
          user_name: uid.username,
          user_email: uid.stu_email,
        },
      },
    },
    include: {
      uid: true,
    },
  })
    .then((updatedStudent) => {
      res.json(updatedStudent);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Could not update student" });
    });
};

module.exports.deleteStudent = function (req, res) {
  const { id } = req.params;
  prisma.Student.delete({
    where: { id: Number(id) },
  }).then((Student) => {
    res.json(Student);
  });
};

module.exports.deleteAllsStudent = async function (req, res) {
  const { sid, uid } = req.params;
  prisma.Student.delete({
    where: { id: Number(sid) },
  }).then((Student) => {
    prisma.User.delete({
      where: { id: Number(uid) },
    }).then((response) => res.json("delete successfully"));
  });
};

//lecturer
module.exports.getAllLecturer = async function (req, res) {
  const Lecturers = await prisma.Lecturer.findMany();
  const result = await Promise.all(
    Lecturers.map((Lecturer) => {
      return (user = prisma.User.findUnique({
        where: {
          id: Lecturer.user_id,
        },
      }).then((user) => {
        return {
          id: Lecturer.id,
          uid: user.id,
          username: user.user_name,
          lect_id: Lecturer.lect_id,
          lect_roomnum: Lecturer.lect_roomnum,
          avatar: Lecturer.avatar,
        };
      }));
    })
  );
  res.json(result);
};

module.exports.getAllsLecturer = function (req, res) {
  prisma.Lecturer.findMany().then((Lecturer) => {
    res.json(Lecturer);
  });
};

module.exports.getSomeLecturers = async function (req, res) {
  const { id } = req.query;
  const ids = [Number(id)];
  const Lecturers = await prisma.lecturer.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  const result = await Promise.all(
    Lecturers.map((Lecturer) => {
      return prisma.user
        .findUnique({
          where: {
            id: Lecturer.user_id,
          },
        })
        .then((user) => {
          return {
            id: Lecturer.id,
            uid: user.id,
            user_email: user.user_email,
            user_name: user.user_name,
            lect_id: Lecturer.lect_id,
            lect_roomnum: Lecturer.lect_roomnum,
            avatar: Lecturer.avatar,
          };
        });
    })
  );
  res.json(result);
};

module.exports.createLecturer = function (req, res) {
  const { lect_roomnum, avatar, user_id } = req.body;
  prisma.Lecturer.create({
    data: {
      lect_roomnum,
      user_id,
      avatar,
    },
  }).then((Lecturer) => {
    res.json(Lecturer);
  });
};

module.exports.updateLecturer = function (req, res) {
  const { id } = req.params;
  const { lect_roomnum, avatar, uid } = req.body;
  prisma.Lecturer.update({
    where: { id: Number(id) },
    data: {
      lect_roomnum,
      avatar,
      uid: {
        update: {
          user_name: uid.user_name,
          user_email: uid.user_email,
        },
      },
    },
    include: {
      uid: true,
    },
  })
    .then((updateLecturer) => {
      res.json(updateLecturer);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Could not update student" });
    });
};

module.exports.deleteStudent = function (req, res) {
  const { id } = req.params;
  prisma.Lecturer.delete({
    where: { id: Number(id) },
  }).then((Lecturer) => {
    res.json(Lecturer);
  });
};

//problem
module.exports.getAllsProblem = function (req, res) {
  const { lid, sid } = req.query;
  console.log(lid);
  if (lid) {
    prisma.problem
      .findMany({
        where: { lect_id: { some: { id: Number(lid) } } },
        include: { tags: true },
      })
      .then((problem) => {
        res.json(problem);
      });
  } else if (sid) {
    prisma.problem
      .findMany({
        where: { sid: Number(sid) },
        include: { tags: true },
      })
      .then((problem) => {
        res.json(problem);
      });
  } else {
    prisma.problem.findMany({ include: { tags: true } }).then((problem) => {
      res.json(problem);
    });
  }
};

module.exports.createProblem = async function (req, res) {
  const { pro_title, pro_type, pro_desc, pro_image, lect_id, stu, tags } =
    req.body;
  console.log(pro_image);
  const student = await prisma.student.findUnique({
    where: { id: stu },
    include: { uid: true },
  });

  const problem = await prisma.problem.create({
  data: {
    pro_title,
    pro_type,
    pro_desc,
    pro_images: pro_image,
    lect_id: { connect: lect_id },
    stu: { connect: { id: stu } },
    tags: { connect: tags.map((tag) => ({ id: tag.id })) },
  },
});
  await Promise.all(
    lect_id.map((element) =>
      prisma.student
        .findFirst({
          where: { id: element.stu_id },
          include: { uid: true },
        })
        .then((student) =>
          prisma.lecturer
            .findFirst({ where: { id: element.id } })
            .then((lecturer) =>
              prisma.user
                .findFirst({ where: { id: lecturer.user_id } })
                .then((user) => {
                  const mailOptions = {
                    from: "youremail@gmail.com",
                    to: user.user_email, //เปลี่ยนจาก element.uid.user_email เป็น user.user_email
                    subject: "มีการแจ้งปัญหามาจาก " + student.uid.user_name,
                    html:
                      "<h2>หัวข้อ: " +
                      pro_title +
                      "</h2>" +
                      "<p>รายละเอียด: " +
                      pro_desc +
                      "</p>" +
                      "<img src='" +
                      pro_image +
                      "'/>",
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log("Email sent: " + info.response);
                    }
                  });
                })
            )
        )
    )
  );

  res.json(problem.id);
};

module.exports.updateProblem = function (req, res) {
  const { id } = req.params;
  const { pro_title, pro_type, pro_desc, pro_images,datetime } = req.body;

  prisma.Problem.update({
    where: { id: Number(id) },
    data: {
      pro_title,
      pro_type,
      pro_desc,
      pro_images,
      datetime,
    },
  }).then((Problem) => {
    res.json(Problem);
  });
};



//tags
module.exports.getAllTags = async function (req, res) {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports.createTag = async function (req, res) {
  const { name } = req.body;
  const tag = await prisma.tag.create({ data: { name } });
  res.json(tag);
};

module.exports.deleteTag = async function (req, res) {
  const { id } = req.params;
  await prisma.tag.delete({ where: { id: Number(id) } });
  res.send("Tag deleted.");
};

module.exports.updateStatus = function (req, res) {
  const { id } = req.params;
  const { status } = req.body;
  prisma.Problem.update({
    where: { id: Number(id) },
    data: {
      status,
    },
  }).then((Problem) => {
    res.json(Problem);
  });
};

module.exports.deleteProblem = function (req, res) {
  const { pid } = req.params;
  prisma.Problem.delete({
    where: { id: Number(pid) },
  }).then((response) => res.json("delete successfully"));
};
