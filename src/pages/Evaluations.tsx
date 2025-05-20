import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getStudentEvaluations, getCourseDetail } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faStar, 
  faExclamationCircle, 
  faHistory, 
  faCalendarAlt,
  faComment,
  faEye,
  faEyeSlash,
  faChartPie,
  faFilter,
  faSort,
  faListAlt,
  faThumbsUp,
  faShieldAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

// 定义评价结构体类型
interface Evaluation {
  courseId: number | bigint;
  score: number;
  comment: string;
  isAnonymous: boolean;
  timestamp: number | bigint;
}

// 定义课程结构体类型
interface Course {
  id: number | bigint;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

export default function Evaluations() {
  const [user, setUser] = useState<User | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [coursesMap, setCoursesMap] = useState<{[key: string]: Course}>({});
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [filterOption, setFilterOption] = useState('all'); // 'all', 'anonymous', 'named'
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  console.log("user", user);

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("userInfo", userInfo);
        setUser(userInfo);

        // 检查用户角色是否为学生
        if (Number(userInfo.role) !== 0) {
          setError('只有学生可以访问此页面');
          setLoading(false);
          return;
        }

        // 获取学生评价历史
        const studentEvaluations = await getStudentEvaluations() as unknown as Evaluation[];
        console.log("评价历史", studentEvaluations);
        setEvaluations(studentEvaluations);
        
        // 加载课程信息
        await fetchCoursesInfo(studentEvaluations);
        
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // 获取课程详情信息
  const fetchCoursesInfo = async (evaluationsList: Evaluation[]) => {
    if (!evaluationsList || evaluationsList.length === 0) return;
    
    setLoadingCourses(true);
    
    try {
      // 收集所有需要获取的课程ID，避免重复获取
      const courseIdsSet = new Set<string>();
      evaluationsList.forEach(evaluation => {
        if (evaluation.courseId !== undefined) {
          courseIdsSet.add(String(evaluation.courseId));
        }
      });
      
      const courseIds = Array.from(courseIdsSet);
      const coursesData: {[key: string]: Course} = {};
      
      // 并行获取所有课程信息
      await Promise.all(courseIds.map(async (courseId) => {
        try {
          const courseDetail = await getCourseDetail(Number(courseId)) as unknown as Course;
          coursesData[courseId] = courseDetail;
        } catch (err) {
          console.error(`获取课程ID ${courseId} 的详情失败:`, err);
        }
      }));
      
      setCoursesMap(coursesData);
    } catch (err) {
      console.error('获取课程信息失败:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

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

  // 获取所有可用课程的列表，用于筛选
  const getAvailableCourses = () => {
    const courses: Array<{id: string, name: string}> = [];
    if (evaluations && evaluations.length > 0) {
      // 使用 Set 去重
      const courseIdsSet = new Set<string>();
      evaluations.forEach(evaluation => {
        if (evaluation.courseId !== undefined) {
          const courseIdStr = String(evaluation.courseId);
          if (!courseIdsSet.has(courseIdStr) && coursesMap[courseIdStr]) {
            courseIdsSet.add(courseIdStr);
            courses.push({
              id: courseIdStr,
              name: coursesMap[courseIdStr]?.name || `课程 ${courseIdStr}`
            });
          }
        }
      });
    }
    return courses;
  };
  
  // 过滤评价
  const filteredEvaluations = evaluations.filter(evaluation => {
    // 匿名/实名筛选
    const matchesAnonymityFilter = 
      filterOption === 'all' || 
      (filterOption === 'anonymous' && evaluation.isAnonymous) || 
      (filterOption === 'named' && !evaluation.isAnonymous);
    
    // 课程筛选
    const matchesCourseFilter = 
      selectedCourseId === null || 
      String(evaluation.courseId) === selectedCourseId;
    
    return matchesAnonymityFilter && matchesCourseFilter;
  });

  // 排序评价
  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    if (sortOption === 'newest') {
      return Number(b.timestamp) - Number(a.timestamp);
    }
    if (sortOption === 'oldest') {
      return Number(a.timestamp) - Number(b.timestamp);
    }
    if (sortOption === 'highest') {
      // 安全处理score可能不是数字的情况
      const scoreA = Number(a.score || 0);
      const scoreB = Number(b.score || 0);
      return scoreB - scoreA;
    }
    if (sortOption === 'lowest') {
      // 安全处理score可能不是数字的情况
      const scoreA = Number(a.score || 0);
      const scoreB = Number(b.score || 0);
      return scoreA - scoreB;
    }
    return 0;
  });

  // 计算评分统计数据
  const getScoreDistribution = (evalList = evaluations) => {
    const distribution = [0, 0, 0, 0, 0];
    if (evalList && evalList.length > 0) {
      evalList.forEach(evaluation => {
        const score = Number(evaluation.score);
        if (score >= 1 && score <= 5) {
          distribution[score - 1]++;
        }
      });
    }
    return distribution;
  };

  const getAverageScore = (evalList = evaluations) => {
    if (!evalList || evalList.length === 0) return "0.0";
    const sum = evalList.reduce((acc, curr) => acc + Number(curr.score || 0), 0);
    return (sum / evalList.length).toFixed(1);
  };

  const getAnonymousPercentage = (evalList = evaluations) => {
    if (!evalList || evalList.length === 0) return 0;
    const anonymousCount = evalList.filter(e => e.isAnonymous).length;
    return Math.round((anonymousCount / evalList.length) * 100);
  };

  const getLastEvaluationDate = (evalList = evaluations) => {
    if (!evalList || evalList.length === 0) return '无记录';
    try {
      const timestamps = evalList.map(e => Number(e.timestamp || 0));
      const lastDate = new Date(Math.max(...timestamps) * 1000);
      return `${lastDate.getFullYear()}/${String(lastDate.getMonth() + 1).padStart(2, '0')}/${String(lastDate.getDate()).padStart(2, '0')}`;
    } catch (error) {
      console.error('获取最近评价日期错误:', error);
      return '无记录';
    }
  };
  
  // 统计已评价的不同课程数量
  const getEvaluatedCoursesCount = () => {
    if (!evaluations || evaluations.length === 0) return 0;
    const courseIds = new Set<string>();
    evaluations.forEach(evaluation => {
      if (evaluation.courseId !== undefined) {
        courseIds.add(String(evaluation.courseId));
      }
    });
    return courseIds.size;
  };
  
  // 获取评分最高的课程
  const getHighestRatedCourse = () => {
    if (!evaluations || evaluations.length === 0 || Object.keys(coursesMap).length === 0) 
      return { id: null, name: "无数据", score: 0 };
      
    // 按课程ID分组计算平均分
    const courseScores: {[key: string]: {total: number, count: number}} = {};
    
    evaluations.forEach(evaluation => {
      const courseId = String(evaluation.courseId);
      if (!courseScores[courseId]) {
        courseScores[courseId] = { total: 0, count: 0 };
      }
      courseScores[courseId].total += Number(evaluation.score || 0);
      courseScores[courseId].count += 1;
    });
    
    // 计算每个课程的平均分
    let highestScore = 0;
    let highestCourseId = "";
    
    Object.entries(courseScores).forEach(([courseId, data]) => {
      const avgScore = data.total / data.count;
      if (avgScore > highestScore) {
        highestScore = avgScore;
        highestCourseId = courseId;
      }
    });
    
    // 获取最高评分课程的名称
    const courseName = coursesMap[highestCourseId]?.name || `课程 ${highestCourseId}`;
    
    return {
      id: highestCourseId,
      name: courseName,
      score: highestScore.toFixed(1)
    };
  };

  // 安全获取评分分布和最大值
  const scoreDistribution = getScoreDistribution();
  const maxDistribution = Math.max(...scoreDistribution, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faHistory} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取评价历史数据</p>
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

  return (
    <div className={`transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg mb-8">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-orange-100 to-yellow-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-yellow-100 to-orange-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faHistory} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">我的评价历史</h1>
              <p className="text-gray-500">查看您对课程提交的所有评价记录和统计数据</p>
            </div>
          </div>
          <div className="bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100 text-sm font-medium text-yellow-700 shadow-sm">
            共 {evaluations.length} 条评价
          </div>
        </div>
      </div>

      {/* 主体内容：左右布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：评价统计 */}
        <div className="lg:w-1/3 space-y-6">
          {/* 评价统计卡片 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="h-5 w-5 text-yellow-500 mr-2" />
              评价统计
            </h2>

            {evaluations.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-yellow-500 text-sm font-medium">平均评分</span>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-3xl font-bold text-yellow-600">{getAverageScore()}</span>
                          <span className="text-base text-yellow-500 ml-1">/5.0</span>
                        </div>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-green-500 text-sm font-medium">匿名比例</span>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-3xl font-bold text-green-600">{getAnonymousPercentage()}%</span>
                        </div>
                      </div>
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-blue-500 text-sm font-medium">最近评价</span>
                        <div className="mt-1 text-blue-600 text-sm font-medium">
                          {getLastEvaluationDate()}
                        </div>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-purple-500 text-sm font-medium">评价总数</span>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-3xl font-bold text-purple-600">{evaluations.length}</span>
                        </div>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faListAlt} className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <FontAwesomeIcon icon={faStar} className="h-4 w-4 text-yellow-500 mr-1.5" />
                    评分分布
                  </h3>
                  <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map((score) => (
                      <div key={score} className="flex items-center">
                        <div className="w-5 text-gray-600 text-xs font-medium">{score}星</div>
                        <div className="flex-1 mx-2 h-5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              score >= 4 ? 'bg-green-500' : 
                              score >= 3 ? 'bg-blue-500' : 
                              score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: evaluations.length > 0 ? `${(scoreDistribution[score-1] / maxDistribution) * 100}%` : '0%' }}
                          ></div>
                        </div>
                        <div className="w-8 text-right text-gray-600 text-xs font-medium">
                          {scoreDistribution[score-1]} {evaluations.length > 0 ? `(${Math.round((scoreDistribution[score-1] / evaluations.length) * 100)}%)` : '(0%)'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 课程相关统计卡片 */}
                {evaluations.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg mt-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faListAlt} className="h-5 w-5 text-blue-500 mr-2" />
                      课程统计
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-blue-500 text-sm font-medium">已评价课程数</span>
                            <div className="mt-2 flex items-baseline">
                              <span className="text-3xl font-bold text-blue-600">{getEvaluatedCoursesCount()}</span>
                            </div>
                          </div>
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faClipboardList} className="h-5 w-5 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-yellow-600 text-sm font-medium">最高评分课程</span>
                            <div className="mt-1">
                              <div className="text-sm font-medium text-yellow-700 truncate max-w-[120px]">
                                {getHighestRatedCourse().name}
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xl font-bold text-yellow-600">{getHighestRatedCourse().score}</span>
                                <FontAwesomeIcon icon={faStar} className="ml-1 h-3 w-3 text-yellow-500" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedCourseId && (
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100 shadow-sm">
                        <h3 className="text-sm font-medium text-orange-700 mb-2">当前筛选课程的统计</h3>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-2 sm:mb-0">
                            <div className="text-orange-800 font-medium">
                              {coursesMap[selectedCourseId]?.name || `课程 ${selectedCourseId}`}
                            </div>
                            <div className="text-xs text-orange-600">
                              {coursesMap[selectedCourseId]?.credits || '?'} 学分 · 
                              {coursesMap[selectedCourseId]?.isActive ? ' 进行中' : ' 已结束'}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="text-center mr-4">
                              <div className="text-xs text-orange-600">平均分</div>
                              <div className="text-lg font-bold text-orange-700">
                                {getAverageScore(filteredEvaluations)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-orange-600">评价数</div>
                              <div className="text-lg font-bold text-orange-700">
                                {filteredEvaluations.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium">暂无统计数据</p>
              </div>
            )}
          </div>

          {/* 筛选控制卡片 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faFilter} className="h-5 w-5 text-yellow-500 mr-2" />
              筛选选项
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">显示条件</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filterOption === 'all' 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterOption('all')}
                  >
                    全部评价
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filterOption === 'anonymous' 
                        ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterOption('anonymous')}
                  >
                    <FontAwesomeIcon icon={faEyeSlash} className="mr-1.5 h-3 w-3" />
                    仅匿名评价
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filterOption === 'named' 
                        ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterOption('named')}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1.5 h-3 w-3" />
                    仅实名评价
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">课程筛选</h3>
                <div className="relative">
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value === '' ? null : e.target.value)}
                  >
                    <option value="">全部课程</option>
                    {getAvailableCourses().map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {selectedCourseId && (
                  <div className="mt-2 text-center">
                    <button
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center justify-center mx-auto"
                      onClick={() => setSelectedCourseId(null)}
                    >
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      清除课程筛选
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">排序方式</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      sortOption === 'newest' 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortOption('newest')}
                  >
                    <FontAwesomeIcon icon={faSort} className="mr-1.5 h-3 w-3" />
                    最新优先
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      sortOption === 'oldest' 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortOption('oldest')}
                  >
                    <FontAwesomeIcon icon={faSort} className="mr-1.5 h-3 w-3" />
                    最早优先
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      sortOption === 'highest' 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortOption('highest')}
                  >
                    <FontAwesomeIcon icon={faSort} className="mr-1.5 h-3 w-3" />
                    高分优先
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      sortOption === 'lowest' 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSortOption('lowest')}
                  >
                    <FontAwesomeIcon icon={faSort} className="mr-1.5 h-3 w-3" />
                    低分优先
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
                
        {/* 右侧：评价列表 */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faClipboardList} className="h-5 w-5 text-orange-500 mr-2" />
                评价历史记录
                {filterOption !== 'all' && (
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    已筛选：{filterOption === 'anonymous' ? '仅匿名评价' : '仅实名评价'}
                  </span>
                )}
              </h2>
              
              {/* 课程信息加载状态 */}
              {loadingCourses && (
                <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs">
                  <svg className="animate-spin -ml-0.5 mr-2 h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在加载课程信息...
                </div>
              )}
            </div>
            
            {/* 筛选状态指示器 */}
            {(selectedCourseId || filterOption !== 'all') && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faFilter} className="h-4 w-4 text-gray-500 mr-2" />
                  <span>
                    已筛选：
                    {filterOption !== 'all' && (
                      <span className="font-medium text-gray-700 mr-1">
                        {filterOption === 'anonymous' ? '匿名评价' : '实名评价'}
                      </span>
                    )}
                    {selectedCourseId && (
                      <span className="font-medium text-gray-700">
                        {filterOption !== 'all' && '、'}课程"
                        <span className="text-blue-600">{coursesMap[selectedCourseId]?.name || `课程 ${selectedCourseId}`}</span>
                        "
                      </span>
                    )}
                  </span>
                </div>
                <button 
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={() => {
                    setFilterOption('all');
                    setSelectedCourseId(null);
                  }}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  清除全部筛选
                </button>
              </div>
            )}
            
            {sortedEvaluations.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2">
                {sortedEvaluations.map((evaluation, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-orange-100 group cursor-pointer ${selectedEvaluation === evaluation ? 'ring-2 ring-orange-300' : ''}`}
                    onClick={() => setSelectedEvaluation(evaluation === selectedEvaluation ? null : evaluation)}
                  >
                    {/* 课程信息 */}
                    {coursesMap[String(evaluation.courseId)] && (
                      <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-semibold text-indigo-800">
                            {coursesMap[String(evaluation.courseId)].name}
                          </h3>
                          <p className="text-xs text-indigo-600">
                            {coursesMap[String(evaluation.courseId)].credits} 学分 · 课程ID: {evaluation.courseId}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                          coursesMap[String(evaluation.courseId)].isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          {coursesMap[String(evaluation.courseId)].isActive ? '进行中' : '已结束'}
                        </div>
                      </div>
                    )}
                    
                    {/* 评价信息 */}
                    <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-3 sm:mb-0">
                        {renderStars(Number(evaluation.score))}
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 h-3.5 w-3.5" />
                          {evaluation && evaluation.timestamp ? formatDate(evaluation.timestamp) : '未知时间'}
                        </div>
                      </div>
                      
                      <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                        evaluation.isAnonymous 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <FontAwesomeIcon 
                          icon={evaluation.isAnonymous ? faEyeSlash : faEye} 
                          className="mr-1.5 h-3.5 w-3.5" 
                        />
                        {evaluation.isAnonymous ? '匿名评价' : '实名评价'}
                      </div>
                    </div>
                    
                    {/* 评价内容 */}
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 relative group-hover:border-orange-200 transition-colors duration-200">
                      <FontAwesomeIcon icon={faComment} className="absolute top-4 left-4 text-orange-200 h-16 w-16 opacity-20" />
                      <p className="text-gray-800 relative">{evaluation.comment}</p>
                    </div>

                    {selectedEvaluation === evaluation && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                        <div className="bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full border border-orange-100 flex items-center">
                          <FontAwesomeIcon icon={faThumbsUp} className="mr-1.5 h-3 w-3" />
                          已选择此评价
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 bg-gray-50 rounded-xl border border-gray-100">
                <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">暂无评价记录</h3>
                <p className="text-gray-500 max-w-md text-center">
                  {evaluations.length === 0 
                    ? '您尚未对任何课程提交评价，完成课程后可以提交评价'
                    : selectedCourseId && filterOption !== 'all'
                      ? `未找到在"${coursesMap[selectedCourseId]?.name || `课程 ${selectedCourseId}`}"中的${filterOption === 'anonymous' ? '匿名' : '实名'}评价`
                      : selectedCourseId 
                        ? `未找到课程"${coursesMap[selectedCourseId]?.name || `课程 ${selectedCourseId}`}"的评价记录`
                        : `未找到${filterOption === 'anonymous' ? '匿名' : '实名'}评价记录`
                  }
                </p>
                {(selectedCourseId || filterOption !== 'all') && (
                  <button 
                    className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors duration-200"
                    onClick={() => {
                      setFilterOption('all');
                      setSelectedCourseId(null);
                    }}
                  >
                    清除筛选条件
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 