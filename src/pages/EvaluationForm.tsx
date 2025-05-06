import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllCourses, submitEvaluation } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">课程评价</h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error ? (
            <div className="rounded-md bg-red-50 p-2 text-xs">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-400" />
                <p className="ml-2 font-medium text-red-800">{error}</p>
              </div>
            </div>
          ) : null}
          
          {success ? (
            <div className="rounded-md bg-green-50 p-2 text-xs">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-400" />
                <p className="ml-2 font-medium text-green-800">评价提交成功！</p>
              </div>
            </div>
          ) : null}
          
          {course ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                <p className="text-sm text-gray-500">{course.credits} 学分 | 教师: {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}</p>
              </div>
              
              <div className="space-y-4">
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
                      className="form-input"
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
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn w-1/2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-1/2"
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
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">加载中...</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  返回仪表盘
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm; 