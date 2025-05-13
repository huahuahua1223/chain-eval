import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getTeacherCourses, getCourseEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faStar, 
  faExclamationCircle, 
  faBook, 
  faChartPie, 
  faCommentAlt, 
  faCalendarAlt, 
  faUserCircle,
  faShieldAlt,
  faListAlt
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
  id: number | bigint;
  name: string;
  credits: number | bigint;
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

export default function CourseEvaluations() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | bigint | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

  console.log("user", user);

  // 获取教师课程
  useEffect(() => {
    setShowAnimation(true);
    
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("用户信息:", userInfo);
        setUser(userInfo);

        // 检查用户角色是否为教师
        if (Number(userInfo.role) !== 1) {
          setError('只有教师可以访问此页面');
          setLoading(false);
          return;
        }

        // 获取教师课程列表
        const teacherCourses = await getTeacherCourses() as unknown as Course[];
        console.log("教师课程:", teacherCourses);
        setCourses(teacherCourses);

        // 如果有课程，默认选中第一个
        if (teacherCourses && teacherCourses.length > 0) {
          setSelectedCourseId(teacherCourses[0].id);
        }

        setLoading(false);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 当选中课程变化时，获取评价
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (selectedCourseId === null) return;
      
      setLoadingEvaluations(true);
      try {
        const courseEvaluations = await getCourseEvaluations(Number(selectedCourseId)) as unknown as Evaluation[];
        console.log("课程评价:", courseEvaluations);
        setEvaluations(courseEvaluations);
      } catch (err) {
        console.error('获取评价失败:', err);
      } finally {
        setLoadingEvaluations(false);
      }
    };

    fetchEvaluations();
  }, [selectedCourseId]);

  // 格式化时间戳
  const formatDate = (timestamp: number | bigint) => {
    try {
      // 将BigInt转换为数字
      const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
      const date = new Date(timestampNum * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error('格式化时间戳错误:', error, timestamp);
      return String(timestamp);
    }
  };

  // 渲染星级评分
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <FontAwesomeIcon
            key={value}
            icon={faStar}
            className={`h-5 w-5 ${
              value <= score ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 获取当前选中课程名称
  const getSelectedCourseName = () => {
    if (selectedCourseId === null || courses.length === 0) return '未选择课程';
    const selected = courses.find(course => course.id === selectedCourseId);
    return selected ? selected.name : '未知课程';
  };

  // 获取评分分布
  const getScoreDistribution = () => {
    if (!evaluations || evaluations.length === 0) return [0, 0, 0, 0, 0];
    
    const distribution = [0, 0, 0, 0, 0];
    evaluations.forEach(evaluation => {
      const score = Number(evaluation.score);
      if (score >= 1 && score <= 5) {
        distribution[score - 1]++;
      }
    });
    
    return distribution;
  };

  // 获取平均评分
  const getAverageScore = () => {
    if (!evaluations || evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, curr) => acc + Number(curr.score), 0);
    return (sum / evaluations.length).toFixed(1);
  };

  // 获取匿名评价比例
  const getAnonymousPercentage = () => {
    if (!evaluations || evaluations.length === 0) return 0;
    const anonymousCount = evaluations.filter(e => e.isAnonymous).length;
    return Math.round((anonymousCount / evaluations.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取课程评价数据</p>
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
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">访问错误</h3>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  const scoreDistribution = getScoreDistribution();
  const maxDistribution = Math.max(...scoreDistribution, 1);

  return (
    <div className={`transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg mb-8">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-100 to-blue-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-blue-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">课程评价查看</h1>
              <p className="text-gray-500">查看您教授的课程获得的学生评价</p>
            </div>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 text-sm font-medium text-indigo-700 shadow-sm">
            共 {courses.length} 门课程
          </div>
        </div>
      </div>

      {/* 主体内容：左右布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：课程选择和评价统计 */}
        <div className="lg:w-1/3 space-y-6">
          {/* 课程选择卡片 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-indigo-500 mr-2" />
              选择课程
            </h2>
            
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div 
                    key={String(course.id)} 
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedCourseId === course.id 
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow' 
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg mr-3 ${
                        selectedCourseId === course.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <FontAwesomeIcon icon={faBook} className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${selectedCourseId === course.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {course.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-100">
                            ID: {String(course.id)}
                          </span>
                          <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-100">
                            {String(course.credits)} 学分
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium">暂无课程</p>
              </div>
            )}
          </div>

          {/* 评价统计卡片 */}
          {evaluations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartPie} className="h-5 w-5 text-indigo-500 mr-2" />
                《{getSelectedCourseName()}》统计
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-blue-500 text-sm font-medium">平均评分</span>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-blue-700">{getAverageScore()}</span>
                        <span className="text-base text-blue-500 ml-1">/5.0</span>
                      </div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-purple-500 text-sm font-medium">评价数量</span>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-purple-700">{evaluations.length}</span>
                        <span className="text-base text-purple-500 ml-1">条</span>
                      </div>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faCommentAlt} className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-green-500 text-sm font-medium">匿名评价</span>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-green-700">{getAnonymousPercentage()}%</span>
                      </div>
                    </div>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-md font-semibold text-gray-800 mb-3">评分分布</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((score) => (
                    <div key={score} className="flex items-center">
                      <div className="w-5 text-gray-600 text-xs font-medium">{score}星</div>
                      <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            score >= 4 ? 'bg-green-500' : 
                            score >= 3 ? 'bg-blue-500' : 
                            score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(scoreDistribution[score-1] / maxDistribution) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-6 text-right text-gray-600 text-xs font-medium">
                        {scoreDistribution[score-1]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：评价列表 */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg min-h-[600px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FontAwesomeIcon icon={faListAlt} className="h-5 w-5 text-indigo-500 mr-2" />
              《{getSelectedCourseName()}》评价列表
            </h2>
            
            {loadingEvaluations ? (
              <div className="text-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative mb-4"></div>
                <p className="text-gray-600">加载评价数据中...</p>
              </div>
            ) : evaluations.length > 0 ? (
              <div className="space-y-5 overflow-y-auto max-h-[800px] pr-2">
                {evaluations.map((evaluation, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <div className="flex items-center mb-3 md:mb-0">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                          <FontAwesomeIcon 
                            icon={faUserCircle} 
                            className="h-5 w-5 text-indigo-600" 
                          />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          evaluation.isAnonymous 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {evaluation.isAnonymous ? '匿名学生' : evaluation.student.substr(0, 6) + '...' + evaluation.student.substr(-4)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <FontAwesomeIcon 
                            icon={faCalendarAlt} 
                            className="h-4 w-4 text-blue-600" 
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {evaluation && evaluation.timestamp ? formatDate(evaluation.timestamp) : '未知时间'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {renderStars(Number(evaluation.score))}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800">{evaluation.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 bg-gray-50 rounded-xl border border-gray-100">
                <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">该课程暂无评价记录</h3>
                <p className="text-gray-500 max-w-md text-center">学生尚未对此课程提交评价，请等待学生评价后查看</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 