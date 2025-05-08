import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentAccount, getCurrentUserInfo, getAllCourses, getStudentEvaluations, addCourse, updateCourse, getAllUsers, getCourseEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faChalkboardTeacher, 
  faShieldAlt, 
  faExclamationCircle, 
  faTimes, 
  faBook,
  faLightbulb,
  faChartLine,
  faBookOpen,
  faAward,
  faPlus,
  faPencilAlt,
  faEye,
  faStar,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

// 定义课程结构体类型
interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

// 定义评价结构体类型
interface Evaluation {
  score: number;
  comment: string;
  isAnonymous: boolean;
  timestamp: number | bigint;
  student: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [courseEvaluations, setCourseEvaluations] = useState<Evaluation[]>([]);

  // 添加课程Modal状态
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState<number>(0);
  const [teacherAddress, setTeacherAddress] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [addCourseError, setAddCourseError] = useState('');
  
  // 修改课程Modal状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number>(-1);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseCredits, setEditCourseCredits] = useState<number>(0);
  const [editTeacherAddress, setEditTeacherAddress] = useState('');
  const [editingCourse, setEditingCourse] = useState(false);
  const [editCourseError, setEditCourseError] = useState('');

  useEffect(() => {
    // 添加进入动画
    setShowAnimation(true);

    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("userInfo",userInfo);
        setUser(userInfo);

        const currentAccount = await getCurrentAccount();
        setCurrentAccount(currentAccount);

        if(Number(userInfo?.role) === 2){
          const allUsers = await getAllUsers() as unknown as User[];
          setUsers(allUsers);
        }

        // 获取所有课程
        const allCourses = await getAllCourses() as unknown as Course[];
        console.log("allCourses",allCourses);
        setCourses(allCourses);

        // 管理员和教师获取所有课程评价
        if(Number(userInfo?.role) === 1 || Number(userInfo?.role) === 2){
          const teacherCourses = allCourses.filter(course => course.teacher.toLowerCase() === currentAccount.toLowerCase());
          const courseIds = teacherCourses.map(course => course.id);
          const allCourseEvaluations = await Promise.all(courseIds.map(id => getCourseEvaluations(Number(id)) as unknown as Evaluation[]));
          setCourseEvaluations(allCourseEvaluations.flat());
        }

        // 如果是学生，获取评价历史
        if (Number(userInfo?.role) === 0) {
          const studentEvals = await getStudentEvaluations() as unknown as number[];
          setEvaluations(studentEvals);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取角色图标
  const getRoleIcon = (role: number | null) => {
    switch(role) {
      case 0: return faGraduationCap;
      case 1: return faChalkboardTeacher;
      case 2: return faShieldAlt;
      default: return faGraduationCap;
    }
  };

  // 获取角色名称
  const getRoleName = (role: number | null) => {
    switch(role) {
      case 0: return '学生';
      case 1: return '教师';
      case 2: return '管理员';
      default: return '用户';
    }
  };

  // 获取平均评分
  const getAverageScore = () => {
    if (courseEvaluations.length === 0) return 0;
    const totalScore = courseEvaluations.reduce((sum, evaluation) => sum + Number(evaluation.score), 0);
    return (totalScore / courseEvaluations.length).toFixed(1);
  };

  // 获取统计数据
  const getStats = () => {
    if (user) {
      const role = Number(user.role);
      if (role === 0) {
        return [
          { title: '已修课程', value: courses.length, icon: faBookOpen, color: 'from-blue-400 to-blue-600' },
          // { title: '总学分', value: courses.reduce((total, course) => total + course.credits, 0), icon: faAward, color: 'from-green-400 to-green-600' },
          { title: '已评价', value: evaluations.length, icon: faChartLine, color: 'from-purple-400 to-purple-600' }
        ];
      } else if (role === 1) {
        return [
          { title: '我的课程', value: courses.filter(c => Number(c.teacher) === Number(currentAccount)).length, icon: faChalkboardTeacher, color: 'from-indigo-400 to-indigo-600' },
          { title: '学生反馈', value: courseEvaluations.length, icon: faChartLine, color: 'from-orange-400 to-orange-600' },
          { title: '平均评分', value: getAverageScore(), icon: faStar, color: 'from-yellow-400 to-yellow-600' } 
        ];
      } else {
        return [
          { title: '总课程数', value: courses.length, icon: faBook, color: 'from-indigo-400 to-indigo-600' },
          { title: '教师人数', value: new Set(courses.map(c => c.teacher)).size, icon: faChalkboardTeacher, color: 'from-green-400 to-green-600' },
          { title: '系统用户', value: users.length, icon: faUsers, color: 'from-purple-400 to-purple-600' }
        ];
      }
    }
    return [];
  };

  // 课程添加处理函数
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCourse(true);
    setAddCourseError('');

    try {
      if (!courseName.trim()) {
        throw new Error('课程名称不能为空');
      }
      
      if (courseCredits <= 0 || courseCredits > 10) {
        throw new Error('学分必须在1-10之间');
      }
      
      if (!teacherAddress || !teacherAddress.startsWith('0x') || teacherAddress.length !== 42) {
        throw new Error('请输入有效的教师地址');
      }
      
      await addCourse(courseName, courseCredits, teacherAddress);
      
      // 添加成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 重置表单并关闭模态框
      resetAddForm();
      setShowModal(false);
    } catch (err: any) {
      console.error('添加课程失败:', err);
      setAddCourseError(err.message || '添加课程失败，请重试');
    } finally {
      setAddingCourse(false);
    }
  };

  // 打开编辑课程弹窗
  const openEditModal = (course: Course) => {
    setCurrentCourseId(course.id);
    setEditCourseName(course.name);
    setEditCourseCredits(course.credits);
    setEditTeacherAddress(course.teacher);
    setEditCourseError('');
    setShowEditModal(true);
  };

  // 处理课程更新
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingCourse(true);
    setEditCourseError('');

    try {
      if (!editCourseName.trim()) {
        throw new Error('课程名称不能为空');
      }
      
      if (editCourseCredits <= 0 || editCourseCredits > 10) {
        throw new Error('学分必须在1-10之间');
      }
      
      if (!editTeacherAddress || !editTeacherAddress.startsWith('0x') || editTeacherAddress.length !== 42) {
        throw new Error('请输入有效的教师地址');
      }
      
      await updateCourse(currentCourseId, editCourseName, editCourseCredits, editTeacherAddress);
      
      // 更新成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 重置表单并关闭模态框
      resetEditForm();
      setShowEditModal(false);
    } catch (err: any) {
      console.error('更新课程失败:', err);
      setEditCourseError(err.message || '更新课程失败，请重试');
    } finally {
      setEditingCourse(false);
    }
  };

  const resetAddForm = () => {
    setCourseName('');
    setCourseCredits(0);
    setTeacherAddress('');
    setAddCourseError('');
  };

  const resetEditForm = () => {
    setCurrentCourseId(-1);
    setEditCourseName('');
    setEditCourseCredits(0);
    setEditTeacherAddress('');
    setEditCourseError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取您的数据</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-xl mb-6 shadow-sm max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">连接错误</h3>
          <p className="text-center">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow hover:shadow-md transform hover:scale-105 active:scale-100"
        >
          返回登录
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 欢迎卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-indigo-100 to-blue-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-purple-100 to-indigo-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow mr-4 transform transition-transform duration-300 hover:rotate-6">
                <FontAwesomeIcon 
                  icon={getRoleIcon(Number(user?.role))} 
                  className="h-6 w-6 text-white" 
                />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                欢迎回来，{user?.id}
              </h1>
            </div>
            <p className="text-gray-600 ml-16">
              您正在以<span className="font-medium text-indigo-700">{getRoleName(Number(user?.role))}</span>身份访问系统
            </p>
          </div>
          
          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center shadow-sm">
            <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-amber-500 mr-2" />
            <p className="text-sm text-gray-700">
              {Number(user?.role) === 0 ? '您可以对已修课程进行评价' : 
               Number(user?.role) === 1 ? '查看您教授课程的评价结果' : 
               '管理所有课程和用户'}
            </p>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {getStats().map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center transition-all duration-300 hover:shadow-md hover:border-indigo-200 transform hover:-translate-y-1 group"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg mr-4 shadow-sm group-hover:shadow transition-all`}>
                <FontAwesomeIcon icon={stat.icon} className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 课程列表卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
              <FontAwesomeIcon icon={faBookOpen} className="h-5 w-5 text-indigo-500 mr-2" />
              课程列表
            </h2>
            <p className="text-sm text-gray-500">{courses.length > 0 ? `共 ${courses.length} 门课程` : '暂无课程数据'}</p>
          </div>
          {Number(user?.role) === 2 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow hover:shadow-md transform hover:scale-105 active:scale-100 flex items-center text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
              添加课程
            </button>
          )}
        </div>
        
        {courses.length > 0 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    课程名称
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    授课教师
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-2 rounded-lg border border-indigo-200 shadow-sm">
                            <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          <div className="text-xs text-gray-500">ID: {course.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-amber-50 w-8 h-8 rounded-full flex items-center justify-center border border-amber-100">
                        {course.credits}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                        {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        course.isActive 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {course.isActive ? '激活' : '未激活'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {Number(user?.role) === 0 && (
                        <button
                          onClick={() => navigate(`/evaluate/${course.id}`)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg transition-colors border border-indigo-200 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-3 w-3 mr-1" />
                          查看
                        </button>
                      )}
                      {Number(user?.role) === 2 && (
                        <button
                          onClick={() => openEditModal(course)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg transition-colors border border-blue-200 flex items-center"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} className="h-3 w-3 mr-1" />
                          修改
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
              <FontAwesomeIcon icon={faBook} className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg">暂无课程数据</p>
            <p className="text-gray-400 text-sm mt-2">课程将在这里显示</p>
          </div>
        )}
      </div>

      {/* 添加课程Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-fadeIn border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4 text-indigo-600" />
                  </div>
                  添加新课程
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    resetAddForm();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>
              </div>
              
              {addCourseError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg animate-pulse">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm">{addCourseError}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleAddCourse}>
                <div className="mb-4">
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                    课程名称
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="请输入课程名称"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 mb-2">
                    学分
                  </label>
                  <input
                    type="number"
                    id="courseCredits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    min="1"
                    max="10"
                    placeholder="1-10"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="teacherAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    教师地址
                  </label>
                  <input
                    type="text"
                    id="teacherAddress"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={teacherAddress}
                    onChange={(e) => setTeacherAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    onClick={() => {
                      setShowModal(false);
                      resetAddForm();
                    }}
                    disabled={addingCourse}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 transition-all transform hover:scale-105 active:scale-100"
                    disabled={addingCourse}
                  >
                    {addingCourse ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </span>
                    ) : "添加课程"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 修改课程Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-fadeIn border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FontAwesomeIcon icon={faPencilAlt} className="h-4 w-4 text-blue-600" />
                  </div>
                  修改课程
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>
              </div>
              
              {editCourseError && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg animate-pulse">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm">{editCourseError}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleUpdateCourse}>
                <div className="mb-4">
                  <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 mb-2">
                    课程名称
                  </label>
                  <input
                    type="text"
                    id="editCourseName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                    placeholder="请输入课程名称"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="editCourseCredits" className="block text-sm font-medium text-gray-700 mb-2">
                    学分
                  </label>
                  <input
                    type="number"
                    id="editCourseCredits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={editCourseCredits}
                    onChange={(e) => setEditCourseCredits(Number(e.target.value))}
                    min="1"
                    max="10"
                    placeholder="1-10"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="editTeacherAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    教师地址
                  </label>
                  <input
                    type="text"
                    id="editTeacherAddress"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={editTeacherAddress}
                    onChange={(e) => setEditTeacherAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    onClick={() => {
                      setShowEditModal(false);
                      resetEditForm();
                    }}
                    disabled={editingCourse}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 transition-all transform hover:scale-105 active:scale-100"
                    disabled={editingCourse}
                  >
                    {editingCourse ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </span>
                    ) : "保存修改"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}