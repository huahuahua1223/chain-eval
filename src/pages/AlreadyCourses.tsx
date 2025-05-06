import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getStudentTakenCourses, submitEvaluation } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faCheckCircle, faExclamationCircle, faStar, faComment } from '@fortawesome/free-solid-svg-icons';

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

// 定义评价弹窗组件
interface EvaluationModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string, isAnonymous: boolean) => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ course, isOpen, onClose, onSubmit }) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await onSubmit(score, comment, isAnonymous);
      setSuccess(true);
      
      // 成功提交后，2秒后关闭弹窗
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('评价提交失败:', err);
      setError('评价提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">课程评价</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-2 text-xs mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-400" />
              <p className="ml-2 font-medium text-red-800">{error}</p>
            </div>
          </div>
        ) : null}
        
        {success ? (
          <div className="rounded-md bg-green-50 p-2 text-xs mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-400" />
              <p className="ml-2 font-medium text-green-800">评价提交成功！</p>
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500">{course.credits} 学分 | 教师: {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">
              评分
            </label>
            <div className="mt-1 flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className="focus:outline-none"
                >
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`h-6 w-6 ${
                      value <= score ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              评论
            </label>
            <div className="mt-1">
              <textarea
                id="comment"
                name="comment"
                rows={4}
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="请输入您对该课程的评价..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="anonymous"
              name="anonymous"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              匿名评价
            </label>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                  提交中...
                </>
              ) : '提交评价'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AlreadyCourses() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
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

        // 获取学生已修课程
        const takenCourses = await getStudentTakenCourses() as unknown as Course[];
        console.log("已修课程", takenCourses);
        setCourses(takenCourses);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmitEvaluation = async (score: number, comment: string, isAnonymous: boolean) => {
    if (!selectedCourse) return;
    
    try {
      await submitEvaluation(selectedCourse.id, score, comment, isAnonymous);
      // 刷新课程列表
      const takenCourses = await getStudentTakenCourses() as unknown as Course[];
      setCourses(takenCourses);
    } catch (err) {
      console.error('评价提交失败:', err);
      throw err;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">已修课程</h1>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 课程列表卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">我的已修课程</h2>
        </div>
        
        {courses.length > 0 ? (
          <div className="overflow-x-auto">
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
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.credits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        已修
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(course)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FontAwesomeIcon icon={faComment} className="mr-1" />
                        评价
                      </button>
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
              <p className="text-gray-500 text-lg">暂无已修课程</p>
            </div>
          </div>
        )}
      </div>

      {/* 评价弹窗 */}
      {selectedCourse && (
        <EvaluationModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitEvaluation}
        />
      )}
    </div>
  );
} 