import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faComment,
  faExclamationCircle,
  faCheckCircle,
  faUserSecret,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';

// 定义课程结构体类型
interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

// 定义评价弹窗组件的 props
interface EvaluationModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string, isAnonymous: boolean) => void;
}

export default function EvaluationModal({ course, isOpen, onClose, onSubmit }: EvaluationModalProps) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-auto transform transition-all duration-300 ease-out relative overflow-hidden animate-fadeIn">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-100 to-orange-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-30"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-blue-100 to-indigo-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-30"></div>
        
        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md mr-3">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">课程评价</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
                {course.credits} 学分
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                教师: {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <label className="flex items-center text-md font-medium text-gray-800 mb-3">
                <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-yellow-500 mr-2" />
                您的评分
              </label>
              <div className="flex items-center justify-center space-x-3 py-3">
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
                      className={`h-8 w-8 transition-colors duration-200 ${
                        value <= (hoveredStar || score) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center mt-1 text-sm font-medium text-indigo-600">
                {score === 1 && "很差"}
                {score === 2 && "较差"}
                {score === 3 && "一般"}
                {score === 4 && "良好"}
                {score === 5 && "非常好"}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <label className="flex items-center text-md font-medium text-gray-800 mb-3">
                <FontAwesomeIcon icon={faCommentDots} className="h-5 w-5 text-indigo-500 mr-2" />
                评价内容
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="请输入您对该课程的评价..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faUserSecret} className={`h-4 w-4 mr-2 ${isAnonymous ? 'text-indigo-500' : 'text-gray-400'}`} />
                    匿名评价
                  </span>
                </label>
              </div>
              <div className="text-xs text-gray-500">
                不显示您的身份
              </div>
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-70 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    提交中...
                  </>
                ) : '提交评价'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 