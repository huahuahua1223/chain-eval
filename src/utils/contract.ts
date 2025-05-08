import Web3 from 'web3';
import abijson from '../../hardhat/artifacts/contracts/ChainEval.sol/ChainEval.json';
import addressjson from '../../hardhat/deployments/geth-address.json';

// 合约ABI
const contractABI = abijson.abi;

// 合约地址（部署后需要更新）
const CONTRACT_ADDRESS = addressjson.ChainEval;

// 初始化web3
const web3 = new Web3(window.ethereum);

// 获取合约实例
export const getContract = () => {
  return new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
};

// 获取当前账户
export const getCurrentAccount = async () => {
  const accounts = await web3.eth.requestAccounts();
  return accounts[0];
};

// 注册用户
export const registerUser = async (id: string, email: string, password: string, role: number) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  const passwordHash = web3.utils.keccak256(password);
  
  await contract.methods.register(id, email, passwordHash, role).send({ from: account });
};

// 用户登录
export const loginUser = async (id: string, password: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  // 如果是管理员登录，直接使用bytes32(0)作为密码哈希
  const passwordHash = id === "ADMIN" ? "0x0000000000000000000000000000000000000000000000000000000000000000" : web3.utils.keccak256(password);
  
  return await contract.methods.login(id, passwordHash).call({ from: account });
};

// 更新用户资料（邮箱）
export const updateUserProfile = async (newEmail: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  await contract.methods.updateUserProfile(newEmail).send({ from: account });
};

// 修改密码
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  const oldPasswordHash = web3.utils.keccak256(oldPassword);
  const newPasswordHash = web3.utils.keccak256(newPassword);
  
  await contract.methods.changePassword(oldPasswordHash, newPasswordHash).send({ from: account });
};

// 添加课程（仅管理员）
export const addCourse = async (name: string, credits: number, teacherAddress: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  await contract.methods.addCourse(name, credits, teacherAddress).send({ from: account });
};

// 更新课程（仅管理员）
export const updateCourse = async (courseId: number, name: string, credits: number, teacherAddress: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  await contract.methods.updateCourse(courseId, name, credits, teacherAddress).send({ from: account });
};

// 标记学生修过某门课（仅管理员）
export const markStudentCourse = async (courseId: number, studentAddress: string) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  await contract.methods.markStudentCourse(courseId, studentAddress).send({ from: account });
};

// 提交课程评价（仅学生）
export const submitEvaluation = async (courseId: number, score: number, comment: string, isAnonymous: boolean) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  await contract.methods.submitEvaluation(courseId, score, comment, isAnonymous).send({ from: account });
};

// 获取课程评价（教师可查看自己课程的评价，管理员可查看所有课程的评价）
export const getCourseEvaluations = async (courseId: number) => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getCourseEvaluations(courseId).call({ from: account });
};

// 获取学生的评价历史
export const getStudentEvaluations = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getStudentEvaluations().call({ from: account });
};

// 获取所有课程列表
export const getAllCourses = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getAllCourses().call({ from: account });
};

// 获取当前用户信息
export const getCurrentUserInfo = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getCurrentUserInfo().call({ from: account });
};

// 获取所有用户列表（仅管理员）
export const getAllUsers = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getAllUsers().call({ from: account });
};

// 获取教师的所有课程（仅教师）
export const getTeacherCourses = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getTeacherCourses().call({ from: account });
};

// 获取学生已修的所有课程（仅学生）
export const getStudentTakenCourses = async () => {
  const contract = getContract();
  const account = await getCurrentAccount();
  
  return await contract.methods.getStudentTakenCourses().call({ from: account });
}; 