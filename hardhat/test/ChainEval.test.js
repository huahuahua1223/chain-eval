const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainEval", function () {
  let chainEval;
  let owner;
  let teacher;
  let student;
  let teacherAddress;
  let studentAddress;
  let ownerAddress;

  beforeEach(async function () {
    [owner, teacher, student] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    teacherAddress = await teacher.getAddress();
    studentAddress = await student.getAddress();

    const ChainEval = await ethers.getContractFactory("ChainEval");
    chainEval = await ChainEval.deploy();
  });

  describe("用户管理", function () {
    it("部署者应该成为管理员", async function () {
      const user = await chainEval.users(ownerAddress);
      expect(user.role).to.equal(2); // Admin role 应该是 2 (Role.Admin)
      expect(user.isRegistered).to.be.true;
    });

    it("教师应该能够注册", async function () {
      const teacherId = "T001";
      const teacherEmail = "teacher@example.com";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes("password"));
      console.log("passwordHash", passwordHash);

      await chainEval.connect(teacher).register(teacherId, teacherEmail, passwordHash, 1); // 1 = Teacher role
      const user = await chainEval.users(teacherAddress);
      expect(user.role).to.equal(1); // Teacher role 是 1
      expect(user.isRegistered).to.be.true;
    });

    it("学生应该能够注册", async function () {
      const studentId = "S001";
      const studentEmail = "student@example.com";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes("password"));

      await chainEval.connect(student).register(studentId, studentEmail, passwordHash, 0); // 0 = Student role
      const user = await chainEval.users(studentAddress);
      expect(user.role).to.equal(0); // Student role 是 0
      expect(user.isRegistered).to.be.true;
    });

    it("用户应该能够登录", async function () {
      // 先注册一个教师用户
      const teacherId = "T001";
      const teacherEmail = "teacher@example.com";
      const password = "password";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
      
      await chainEval.connect(teacher).register(teacherId, teacherEmail, passwordHash, 1);
      
      // 测试正确的登录信息
      const loginResult = await chainEval.connect(teacher).login(teacherId, passwordHash);
      expect(loginResult).to.be.true;
      
      // 测试错误的登录信息（错误的ID）
      const wrongIdResult = await chainEval.connect(teacher).login("WrongID", passwordHash);
      expect(wrongIdResult).to.be.false;
      
      // 测试错误的登录信息（错误的密码）
      const wrongPasswordHash = ethers.keccak256(ethers.toUtf8Bytes("wrongpassword"));
      const wrongPasswordResult = await chainEval.connect(teacher).login(teacherId, wrongPasswordHash);
      expect(wrongPasswordResult).to.be.false;
    });

    it("用户应该能够获取自己的信息", async function () {
      // 先注册一个学生用户
      const studentId = "S001";
      const studentEmail = "student@example.com";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes("password"));
      
      await chainEval.connect(student).register(studentId, studentEmail, passwordHash, 0); // 0 = Student role
      
      // 获取用户信息
      const userInfo = await chainEval.connect(student).getCurrentUserInfo();
      
      // 验证用户信息是否正确
      expect(userInfo.id).to.equal(studentId);
      expect(userInfo.email).to.equal(studentEmail);
      expect(userInfo.passwordHash).to.equal(passwordHash);
      expect(userInfo.role).to.equal(0); // Student role 是 0
      expect(userInfo.isRegistered).to.be.true;
    });
  });

  describe("课程管理", function () {
    beforeEach(async function () {
      // 注册教师
      const teacherId = "T001";
      const teacherEmail = "teacher@example.com";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes("password"));
      await chainEval.connect(teacher).register(teacherId, teacherEmail, passwordHash, 1);
    });

    it("管理员应该能够添加课程", async function () {
      await chainEval.connect(owner).addCourse("数学", 4, teacherAddress);
      const course = await chainEval.courses(0);
      expect(course.name).to.equal("数学");
      expect(course.credits).to.equal(4);
      expect(course.teacher).to.equal(teacherAddress);
    });

    it("管理员应该能够更新课程", async function () {
      await chainEval.connect(owner).addCourse("数学", 4, teacherAddress);
      await chainEval.connect(owner).updateCourse(0, "高等数学", 5, teacherAddress);
      const course = await chainEval.courses(0);
      expect(course.name).to.equal("高等数学");
      expect(course.credits).to.equal(5);
    });

    it("应该能够获取所有课程列表", async function () {
      // 添加多个课程
      await chainEval.connect(owner).addCourse("数学", 4, teacherAddress);
      await chainEval.connect(owner).addCourse("物理", 3, teacherAddress);
      await chainEval.connect(owner).addCourse("化学", 3, teacherAddress);
      
      // 获取所有课程结构体数组
      const courses = await chainEval.getAllCourses();
      
      // 验证课程列表长度
      expect(courses.length).to.equal(3);
      
      // 验证课程信息是否正确
      expect(courses[0].name).to.equal("数学");
      expect(courses[0].credits).to.equal(4);
      expect(courses[0].teacher).to.equal(teacherAddress);
      
      expect(courses[1].name).to.equal("物理");
      expect(courses[1].credits).to.equal(3);
      expect(courses[1].teacher).to.equal(teacherAddress);
      
      expect(courses[2].name).to.equal("化学");
      expect(courses[2].credits).to.equal(3);
      expect(courses[2].teacher).to.equal(teacherAddress);
    });
  });

  describe("评价管理", function () {
    beforeEach(async function () {
      // 注册教师和学生
      const teacherId = "T001";
      const teacherEmail = "teacher@example.com";
      const studentId = "S001";
      const studentEmail = "student@example.com";
      const passwordHash = ethers.keccak256(ethers.toUtf8Bytes("password"));

      await chainEval.connect(teacher).register(teacherId, teacherEmail, passwordHash, 1);
      await chainEval.connect(student).register(studentId, studentEmail, passwordHash, 0);

      // 添加课程
      await chainEval.connect(owner).addCourse("数学", 4, teacherAddress);
      
      // 标记学生修过这门课
      await chainEval.connect(owner).markStudentCourse(0, studentAddress);
    });

    it("学生应该能够提交课程评价", async function () {
      await chainEval.connect(student).submitEvaluation(0, 5, "很好的课程", false);
      const evaluations = await chainEval.getCourseEvaluations(0);
      expect(evaluations.length).to.equal(1);
      expect(evaluations[0].score).to.equal(5);
      expect(evaluations[0].comment).to.equal("很好的课程");
    });

    it("教师应该能够查看自己课程的评价", async function () {
      await chainEval.connect(student).submitEvaluation(0, 5, "很好的课程", false);
      const evaluations = await chainEval.connect(teacher).getCourseEvaluations(0);
      expect(evaluations.length).to.equal(1);
    });

    it("学生应该能够查看自己的评价历史", async function () {
      await chainEval.connect(student).submitEvaluation(0, 5, "很好的课程", false);
      const evaluationIds = await chainEval.connect(student).getStudentEvaluations();
      expect(evaluationIds.length).to.equal(1);
      expect(evaluationIds[0]).to.equal(0);
    });
  });
}); 