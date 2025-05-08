import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllCourses, submitEvaluation } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faExclamationCircle, 
  faCheckCircle, 
  faBook, 
  faArrowLeft, 
  faCommentDots, 
  faUserSecret 
} from '@fortawesome/free-solid-svg-icons';

// 定义课程结构体类型
interface Course {
  id: string;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    setShowAnimation(true);
    
    // 获取课程信息
    const fetchCourse = async () => {
      try {
        const courses = await getAllCourses() as unknown as Course[];
        if (!courseId || isNaN(parseInt(courseId))) {
          setError('无效的课程ID');
          return;
        }

        const id = parseInt(courseId);
        if (courses.length <= id) {
          setError('未找到课程');
          return;
        }

        setCourse(courses[id]);
      } catch (err) {
        console.error('获取课程信息失败:', err);
        setError('获取课程信息失败，请确保已连接钱包');
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!courseId || isNaN(parseInt(courseId))) {
        setError('无效的课程ID');
        return;
      }

      await submitEvaluation(parseInt(courseId), score, comment, isAnonymous);
      setSuccess(true);
      
      // 成功提交后，2秒后跳转到仪表盘
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('评价提交失败:', err);
      setError('评价提交失败，请确保您已修过该课程');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 课程评价卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg max-w-2xl mx-auto">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-100 to-orange-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-blue-100 to-indigo-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-50"></div>
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md mr-4">
                <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                课程评价
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 border border-gray-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
              返回
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm border border-red-200 mb-6 animate-pulse">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500" />
                </div>
                <p className="ml-3 font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-xl bg-green-50 p-4 text-sm border border-green-200 mb-6 animate-pulse">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-green-800">评价提交成功！</p>
                  <p className="text-green-700 mt-1">正在返回仪表盘...</p>
                </div>
              </div>
            </div>
          )}
          
          {course ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                <div className="flex items-center">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
                    {course.credits} 学分
                  </span>
                  <span className="ml-3 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                    教师: {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="flex items-center text-lg font-medium text-gray-800 mb-4">
                    <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-yellow-500 mr-2" />
                    您的评分
                  </label>
                  <div className="flex items-center justify-center space-x-3 py-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setScore(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(null)}
                        className="focus:outline-none transform transition-transform duration-200 hover:scale-110"
                      >
                        <FontAwesomeIcon
                          icon={faStar}
                          className={`h-10 w-10 transition-colors duration-200 ${
                            value <= (hoveredStar || score) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-2 text-sm font-medium text-indigo-600">
                    {score === 1 && "很差"}
                    {score === 2 && "较差"}
                    {score === 3 && "一般"}
                    {score === 4 && "良好"}
                    {score === 5 && "非常好"}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="flex items-center text-lg font-medium text-gray-800 mb-4">
                    <FontAwesomeIcon icon={faCommentDots} className="h-5 w-5 text-indigo-500 mr-2" />
                    评价内容
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="请输入您对该课程的评价，例如课程内容、教学质量、作业难度等..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="relative inline-block w-12 h-6 mr-3">
                      <input
                        id="anonymous"
                        name="anonymous"
                        type="checkbox"
                        className="opacity-0 w-0 h-0"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span 
                        className={`absolute cursor-pointer inset-0 rounded-full transition-colors duration-300 ${isAnonymous ? 'bg-indigo-500' : 'bg-gray-300'}`}
                      >
                        <span 
                          className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-300 ${isAnonymous ? 'transform translate-x-6' : ''}`}
                        ></span>
                      </span>
                    </div>
                    <label className="flex items-center text-base font-medium text-gray-800">
                      <FontAwesomeIcon icon={faUserSecret} className={`h-4 w-4 mr-2 ${isAnonymous ? 'text-indigo-500' : 'text-gray-400'}`} />
                      匿名评价
                    </label>
                  </div>
                  <div className="ml-auto text-xs text-gray-500 max-w-xs">
                    匿名评价不会显示您的身份信息
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow hover:shadow-md flex items-center justify-center"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </>
                  ) : success ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 mr-2" />
                      已提交
                    </>
                  ) : '提交评价'}
                </button>
              </div>
            </form>
          ) : !error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center animate-pulse">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">加载课程信息中...</p>
              <p className="text-sm text-gray-500">请稍候，正在从区块链获取数据</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm; 