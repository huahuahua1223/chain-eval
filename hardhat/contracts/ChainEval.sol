// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ChainEval is Ownable, ReentrancyGuard {
    // 角色枚举
    enum Role { Student, Teacher, Admin }
    
    // 用户结构体
    struct User {
        string id;          // 学号/工号
        string email;       // 邮箱
        bytes32 passwordHash; // 密码哈希
        Role role;          // 角色
        bool isRegistered;  // 是否已注册
    }
    
    // 课程结构体
    struct Course {
        uint256 id;         // 课程ID
        string name;        // 课程名称
        uint8 credits;      // 学分
        address teacher;    // 教师地址
        bool isActive;      // 是否激活
    }
    
    // 评价结构体
    struct Evaluation {
        uint256 courseId;   // 课程ID
        uint8 score;        // 评分(1-5)
        string comment;     // 评论
        uint256 timestamp;  // 评价时间
        bool isAnonymous;   // 是否匿名
        address student;    // 学生地址
    }
    
    // 状态变量
    mapping(address => User) public users;
    address[] public userAddresses; // 存储所有注册用户的地址数组
    Course[] public courses; // 改为数组存储课程
    mapping(uint256 => mapping(address => bool)) public studentCourses; // 学生是否修过某门课
    mapping(uint256 => Evaluation[]) public courseEvaluations; // 课程评价列表
    mapping(string => bool) public usedUserIds; // 记录已使用的学号/工号
    
    // 事件
    event UserRegistered(address indexed userAddress, string id, Role role);
    event CourseAdded(uint256 indexed courseId, string name, address teacher);
    event CourseUpdated(uint256 indexed courseId, string name, address teacher);
    event EvaluationSubmitted(uint256 indexed courseId, address student, uint8 score);
    event UserProfileUpdated(address indexed userAddress, string email);
    event UserPasswordChanged(address indexed userAddress);
    
    // 修饰器
    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyTeacher() {
        require(users[msg.sender].role == Role.Teacher, "Only teacher can perform this action");
        _;
    }
    
    modifier onlyStudent() {
        require(users[msg.sender].role == Role.Student, "Only student can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    // 构造函数
    constructor() {
        // 部署者自动成为管理员
        users[msg.sender] = User({
            id: "ADMIN",
            email: "1494133104@qq.com",
            passwordHash: bytes32(0),
            role: Role.Admin,
            isRegistered: true
        });
        // 将管理员地址添加到用户地址数组
        userAddresses.push(msg.sender);
        
        // 标记ADMIN ID已被使用
        usedUserIds["ADMIN"] = true;
        
        emit UserRegistered(msg.sender, "ADMIN", Role.Admin);
    }
    
    // 用户注册
    function register(string memory _id, string memory _email, bytes32 _passwordHash, Role _role) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(_role != Role.Admin, "Cannot register as admin");
        require(!usedUserIds[_id], "User ID already exists");
        
        users[msg.sender] = User({
            id: _id,
            email: _email,
            passwordHash: _passwordHash,
            role: _role,
            isRegistered: true
        });
        
        // 将新用户地址添加到数组
        userAddresses.push(msg.sender);
        
        // 标记该ID已被使用
        usedUserIds[_id] = true;
        
        emit UserRegistered(msg.sender, _id, _role);
    }
    
    // 用户登录
    function login(string memory _id, bytes32 _passwordHash) external view returns (bool) {
        User memory user = users[msg.sender];
        return user.isRegistered && 
               keccak256(bytes(user.id)) == keccak256(bytes(_id)) && 
               user.passwordHash == _passwordHash;
    }
    
    // 修改个人资料（更新邮箱）
    function updateUserProfile(string memory _newEmail) external onlyRegistered {
        User storage user = users[msg.sender];
        user.email = _newEmail;
        
        emit UserProfileUpdated(msg.sender, _newEmail);
    }
    
    // 修改密码
    function changePassword(bytes32 _oldPasswordHash, bytes32 _newPasswordHash) external onlyRegistered {
        User storage user = users[msg.sender];
        require(user.passwordHash == _oldPasswordHash, "Incorrect old password");
        
        user.passwordHash = _newPasswordHash;
        
        emit UserPasswordChanged(msg.sender);
    }
    
    // 添加课程（仅管理员）
    function addCourse(string memory _name, uint8 _credits, address _teacher) external onlyAdmin {
        require(_teacher != address(0), "Invalid teacher address");
        require(users[_teacher].role == Role.Teacher, "Teacher not registered");
        
        uint256 courseId = courses.length;
        courses.push(Course({
            id: courseId,
            name: _name,
            credits: _credits,
            teacher: _teacher,
            isActive: true
        }));
        
        emit CourseAdded(courseId, _name, _teacher);
    }
    
    // 更新课程（仅管理员）
    function updateCourse(uint256 _courseId, string memory _name, uint8 _credits, address _teacher) external onlyAdmin {
        require(_courseId < courses.length, "Course does not exist");
        require(_teacher != address(0), "Invalid teacher address");
        require(users[_teacher].role == Role.Teacher, "Teacher not registered");
        
        Course storage course = courses[_courseId];
        course.name = _name;
        course.credits = _credits;
        course.teacher = _teacher;
        
        emit CourseUpdated(_courseId, _name, _teacher);
    }
    
    // 标记学生修过某门课（仅管理员）
    function markStudentCourse(uint256 _courseId, address _student) external onlyAdmin {
        require(_courseId < courses.length, "Course does not exist");
        require(users[_student].role == Role.Student, "Not a student");
        
        studentCourses[_courseId][_student] = true;
    }
    
    // 提交课程评价（仅学生）
    function submitEvaluation(uint256 _courseId, uint8 _score, string memory _comment, bool _isAnonymous) external onlyStudent nonReentrant {
        require(_courseId < courses.length, "Course does not exist");
        require(studentCourses[_courseId][msg.sender], "Student has not taken this course");
        require(_score >= 1 && _score <= 5, "Score must be between 1 and 5");
        
        Evaluation memory newEvaluation = Evaluation({
            courseId: _courseId,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp,
            isAnonymous: _isAnonymous,
            student: _isAnonymous ? address(0) : msg.sender
        });
        
        courseEvaluations[_courseId].push(newEvaluation);
        
        emit EvaluationSubmitted(_courseId, msg.sender, _score);
    }
    
    // 获取课程评价（所有人可查看）
    function getCourseEvaluations(uint256 _courseId) external view returns (Evaluation[] memory) {
        require(_courseId < courses.length, "Course does not exist");
        return courseEvaluations[_courseId];
    }
    
    // 获取学生的评价历史
    function getStudentEvaluations() external view returns (Evaluation[] memory) {
        require(users[msg.sender].role == Role.Student, "Not a student");
        
        uint256 totalEvaluations = 0;
        
        // 计算学生所有课程评价的总数
        for (uint256 courseId = 0; courseId < courses.length; courseId++) {
            if (studentCourses[courseId][msg.sender]) { // 只检查学生修过的课程
                for (uint256 j = 0; j < courseEvaluations[courseId].length; j++) {
                    if (courseEvaluations[courseId][j].student == msg.sender) {
                        totalEvaluations++;
                    }
                }
            }
        }
        
        // 创建结果数组
        Evaluation[] memory result = new Evaluation[](totalEvaluations);
        uint256 resultIndex = 0;
        
        // 填充结果数组
        for (uint256 courseId = 0; courseId < courses.length; courseId++) {
            if (studentCourses[courseId][msg.sender]) { // 只检查学生修过的课程
                for (uint256 j = 0; j < courseEvaluations[courseId].length; j++) {
                    if (courseEvaluations[courseId][j].student == msg.sender) {
                        result[resultIndex] = courseEvaluations[courseId][j];
                        resultIndex++;
                    }
                }
            }
        }
        
        return result;
    }
    
    // 获取所有课程列表
    function getAllCourses() external view returns (Course[] memory) {
        return courses;
    }
    
    // 获取当前用户(msg.sender)的个人信息
    function getCurrentUserInfo() external view returns (User memory) {
        require(users[msg.sender].isRegistered, "User not registered");
        return users[msg.sender];
    }
    
    // 获取所有用户列表（仅管理员）
    function getAllUsers() external view onlyAdmin returns (User[] memory) {
        User[] memory allUsers = new User[](userAddresses.length);
        
        for (uint256 i = 0; i < userAddresses.length; i++) {
            allUsers[i] = users[userAddresses[i]];
        }
        
        return allUsers;
    }

    // 获取教师的所有课程（仅教师）
    function getTeacherCourses() external view onlyTeacher returns (Course[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < courses.length; i++) {
            if (courses[i].teacher == msg.sender) {
                count++;
            }
        }
        
        Course[] memory teacherCourses = new Course[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < courses.length; i++) {
            if (courses[i].teacher == msg.sender) {
                teacherCourses[index] = courses[i];
                index++;
            }
        }
        return teacherCourses;
    }

    // 获取学生已修的所有课程（仅学生）
    function getStudentTakenCourses() external view onlyStudent returns (Course[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < courses.length; i++) {
            if (studentCourses[i][msg.sender]) {
                count++;
            }
        }
        
        Course[] memory takenCourses = new Course[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < courses.length; i++) {
            if (studentCourses[i][msg.sender]) {
                takenCourses[index] = courses[i];
                index++;
            }
        }
        return takenCourses;
    }

    // 获取课程的学生名单（所有人可查看）
    function getCourseStudents(uint256 _courseId) external view returns (address[] memory) {
        require(_courseId < courses.length, "Course does not exist");
        
        // 计算选修该课程的学生数量
        uint256 studentCount = 0;
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (studentCourses[_courseId][userAddresses[i]]) {
                studentCount++;
            }
        }
        
        // 创建结果数组
        address[] memory courseStudents = new address[](studentCount);
        uint256 index = 0;
        
        // 填充结果数组
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (studentCourses[_courseId][userAddresses[i]]) {
                courseStudents[index] = userAddresses[i];
                index++;
            }
        }
        
        return courseStudents;
    }

    // 获取单个课程详情（任何人都可以查看）
    function getCourseDetail(uint256 _courseId) external view returns (Course memory) {
        require(_courseId < courses.length, "Course does not exist");
        return courses[_courseId];
    }
}