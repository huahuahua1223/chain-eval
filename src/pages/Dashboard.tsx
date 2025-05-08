import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentAccount, getCurrentUserInfo, getAllCourses, getStudentEvaluations, getAllUsers, getCourseEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faChalkboardTeacher, 
  faShieldAlt, 
  faExclamationCircle, 
  faBook,
  faLightbulb,
  faChartLine,
  faBookOpen,
  faStar,
  faUsers,
  faPieChart,
  faChartBar,
  faChartArea,
  faPercentage,
  faClipboardList,
  faCalendarAlt,
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
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [courseEvaluations, setCourseEvaluations] = useState<Evaluation[]>([]);

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
          const studentEvals = await getStudentEvaluations() as unknown as any[];
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
    if (!courseEvaluations || courseEvaluations.length === 0) return 0;
    const totalScore = courseEvaluations.reduce((sum, evaluation) => {
      const score = Number(evaluation.score || 0);
      return sum + score;
    }, 0);
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
          { title: '我的课程', value: courses.filter(c => c.teacher.toLowerCase() === currentAccount.toLowerCase()).length, icon: faChalkboardTeacher, color: 'from-indigo-400 to-indigo-600' },
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

      {/* 数据分析卡片 - 根据角色显示不同的统计图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 学生角色的统计图表 */}
        {Number(user?.role) === 0 && (
          <>
            {/* 已选课程分布图 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faPieChart} className="h-5 w-5 text-blue-500 mr-2" />
                已选课程学分分布
              </h2>
              
              <div className="relative h-64 w-full">
                {courses.length > 0 ? (
                  <div className="flex items-center justify-center h-full">
                    {/* 这里是课程学分分布的图表 */}
                    <div className="w-48 h-48 relative rounded-full border-8 border-blue-100 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 origin-bottom-right transform rotate-0"></div>
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500 origin-bottom-left transform rotate-0"></div>
                        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 origin-top-left transform rotate-0"></div>
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-500 origin-top-right transform rotate-0"></div>
                      </div>
                      <div className="z-10 bg-white rounded-full w-2/3 h-2/3 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xl font-bold text-gray-800">{courses.length}</span>
                        <span className="text-xs text-gray-500">总课程数</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">2学分课程</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">3学分课程</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">4学分课程</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">5学分课程</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无课程数据</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 评价历史统计 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-purple-500 mr-2" />
                评价历史统计
              </h2>
              
              <div className="relative h-64 w-full">
                {evaluations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">您的平均评分</span>
                        <span className="flex items-center bg-purple-100 px-2 py-1 rounded-full text-xs font-bold text-purple-700">
                          <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-yellow-500 mr-1" />
                          4.5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-indigo-700">{evaluations.length}</div>
                        <div className="text-xs text-indigo-500">已提交评价</div>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4 border border-pink-100 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-pink-700">50%</div>
                        <div className="text-xs text-pink-500">匿名评价比例</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">最近评价分布</h3>
                      <div className="flex items-center">
                        <div className="w-6 text-xs text-gray-600">5星</div>
                        <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 text-xs text-gray-600">4星</div>
                        <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-lime-500 h-full rounded-full" style={{width: '25%'}}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 text-xs text-gray-600">3星</div>
                        <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full rounded-full" style={{width: '10%'}}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 text-xs text-gray-600">2星</div>
                        <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{width: '5%'}}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 text-xs text-gray-600">1星</div>
                        <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{width: '0%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无评价数据</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 教师角色的统计图表 */}
        {Number(user?.role) === 1 && (
          <>
            {/* 课程评价概况 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartBar} className="h-5 w-5 text-indigo-500 mr-2" />
                课程评价概况
              </h2>
              
              <div className="relative h-64 w-full">
                {courseEvaluations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex-1 flex flex-col items-center justify-center">
                        <div className="flex items-center text-2xl font-bold text-indigo-700">
                          {getAverageScore()}
                          <span className="text-sm text-indigo-400 ml-1">/5.0</span>
                        </div>
                        <div className="text-xs text-indigo-500">平均评分</div>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <FontAwesomeIcon
                              key={value}
                              icon={faStar}
                              className={`h-3 w-3 ${
                                value <= Number(getAverageScore()) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 flex-1 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-orange-700">{courseEvaluations.length}</div>
                        <div className="text-xs text-orange-500">总评价数</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex-1 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-green-700">
                          <FontAwesomeIcon icon={faPercentage} className="h-4 w-4 mr-1" />
                          75
                        </div>
                        <div className="text-xs text-green-500">好评率</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">课程评分对比</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-20 text-xs text-gray-600 truncate">数据结构</div>
                          <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{width: '90%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-indigo-700">4.5</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-20 text-xs text-gray-600 truncate">算法分析</div>
                          <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{width: '80%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-indigo-700">4.0</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-20 text-xs text-gray-600 truncate">计算机网络</div>
                          <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-indigo-700">4.3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无评价数据</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 最近评价趋势 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartArea} className="h-5 w-5 text-blue-500 mr-2" />
                最近评价趋势
              </h2>
              
              <div className="relative h-64 w-full">
                {courseEvaluations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="w-full h-40 relative">
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
                      <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gray-200"></div>
                      
                      {/* 模拟评分趋势图 */}
                      <div className="absolute inset-0 flex items-end justify-between px-1">
                        <div className="w-12 h-36 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                        <div className="w-12 h-28 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                        <div className="w-12 h-32 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                        <div className="w-12 h-24 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                        <div className="w-12 h-30 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                        <div className="w-12 h-38 mx-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-t-lg opacity-70"></div>
                      </div>
                      
                      {/* X轴标签 */}
                      <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-1 text-xs text-gray-500">
                        <div className="w-12 text-center">一月</div>
                        <div className="w-12 text-center">二月</div>
                        <div className="w-12 text-center">三月</div>
                        <div className="w-12 text-center">四月</div>
                        <div className="w-12 text-center">五月</div>
                        <div className="w-12 text-center">六月</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faClipboardList} className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">最新评价</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3 mr-1" />
                          今天
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 italic">
                        "课程内容丰富，老师讲解非常清晰，对我的学习帮助很大..."
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <FontAwesomeIcon
                              key={value}
                              icon={faStar}
                              className="h-3 w-3 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-blue-600">
                          匿名学生
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无评价趋势数据</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 管理员角色的统计图表 */}
        {Number(user?.role) === 2 && (
          <>
            {/* 系统用户分布 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-purple-500 mr-2" />
                系统用户分布
              </h2>
              
              <div className="relative h-64 w-full">
                {users.length > 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative w-48 h-48">
                      {/* 模拟饼图 */}
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#c4b5fd" strokeWidth="20" strokeDasharray="100 150" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#818cf8" strokeWidth="20" strokeDasharray="60 200" strokeDashoffset="-100" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4f46e5" strokeWidth="20" strokeDasharray="20 250" strokeDashoffset="-160" />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-bold text-purple-700">{users.length}</span>
                        <span className="text-xs text-purple-500">总用户数</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-6 w-full">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-purple-200 rounded-full mb-1"></div>
                        <div className="text-sm font-medium text-gray-800">
                          60%
                        </div>
                        <div className="text-xs text-gray-500">学生</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-indigo-400 rounded-full mb-1"></div>
                        <div className="text-sm font-medium text-gray-800">
                          30%
                        </div>
                        <div className="text-xs text-gray-500">教师</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-indigo-700 rounded-full mb-1"></div>
                        <div className="text-sm font-medium text-gray-800">
                          10%
                        </div>
                        <div className="text-xs text-gray-500">管理员</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无用户数据</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 课程活跃状态 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-green-500 mr-2" />
                课程活跃状态
              </h2>
              
              <div className="relative h-64 w-full">
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-8 border-green-100"></div>
                            <div 
                              className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500" 
                              style={{transform: 'rotate(45deg)'}}
                            ></div>
                            <div className="z-10 text-xl font-bold text-green-700">
                              75%
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-green-700">
                            活跃课程
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-8 border-red-100"></div>
                            <div 
                              className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-transparent border-t-red-500" 
                              style={{transform: 'rotate(90deg)'}}
                            ></div>
                            <div className="z-10 text-xl font-bold text-red-700">
                              25%
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-red-700">
                            未激活课程
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">按学科分布</h3>
                      <div className="space-y-1.5">
                        <div className="flex items-center">
                          <div className="w-28 text-xs text-gray-600">计算机科学</div>
                          <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-gray-700">45%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-28 text-xs text-gray-600">数学</div>
                          <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-gray-700">30%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-28 text-xs text-gray-600">物理</div>
                          <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{width: '15%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-gray-700">15%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-28 text-xs text-gray-600">其他</div>
                          <div className="flex-1 mx-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{width: '10%'}}></div>
                          </div>
                          <div className="w-8 text-xs font-medium text-gray-700">10%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">暂无课程数据</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 根据角色显示的快捷功能区 */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faLightbulb} className="h-5 w-5 text-amber-500 mr-2" />
          快捷功能
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Number(user?.role) === 0 && (
            <>
              <div 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/already-courses')}
              >
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faBookOpen} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">已修课程</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/evaluations')}
              >
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faClipboardList} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">评价历史</p>
              </div>
            </>
          )}
          
          {Number(user?.role) === 1 && (
            <>
              <div 
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/my-courses')}
              >
                <div className="bg-gradient-to-r from-indigo-400 to-blue-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">我的课程</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/course-evaluations')}
              >
                <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">评价统计</p>
              </div>
            </>
          )}
          
          {Number(user?.role) === 2 && (
            <>
              <div 
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/users')}
              >
                <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">用户管理</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center"
                onClick={() => navigate('/courses')}
              >
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-lg shadow-sm mb-2">
                  <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">课程管理</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}