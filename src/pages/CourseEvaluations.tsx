import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getTeacherCourses, getCourseEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faStar, faExclamationCircle, faBook } from '@fortawesome/free-solid-svg-icons';

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

  // 获取教师课程
  useEffect(() => {
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

  // 获取平均评分
  const getAverageScore = () => {
    if (!evaluations || evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, curr) => acc + Number(curr.score), 0);
    return (sum / evaluations.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          <p className="text-xl font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">课程评价查看</h1>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 课程选择 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">选择课程</h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div 
                key={String(course.id)} 
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedCourseId === course.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <FontAwesomeIcon icon={faBook} className="text-blue-500 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">ID: {String(course.id)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">暂无课程</p>
          </div>
        )}
      </div>

      {/* 评价列表卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">《{getSelectedCourseName()}》评价列表</h2>
            {evaluations.length > 0 && (
              <p className="text-gray-500 mt-1">平均评分: {getAverageScore()} / 5.0</p>
            )}
          </div>
        </div>
        
        {loadingEvaluations ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">加载评价数据...</p>
          </div>
        ) : evaluations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评价内容
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学生
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评价时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluations.map((evaluation, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(Number(evaluation.score))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">{evaluation.comment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        evaluation.isAnonymous 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {evaluation.isAnonymous ? '匿名学生' : evaluation.student.substr(0, 6) + '...' + evaluation.student.substr(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation && evaluation.timestamp ? formatDate(evaluation.timestamp) : '未知时间'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">该课程暂无评价记录</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 