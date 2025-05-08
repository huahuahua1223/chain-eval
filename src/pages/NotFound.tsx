import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 relative">
      {/* 背景装饰 */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="fixed top-1/3 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <div className={`max-w-lg text-center bg-white/70 backdrop-blur-sm px-8 py-12 rounded-2xl shadow-xl border border-gray-100 transition-all duration-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-50 p-6 rounded-full border-4 border-white shadow-lg">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-9xl font-bold text-gray-900 mb-2 mt-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-red-500">404</h1>
        <p className="text-2xl font-medium text-gray-700 mb-2">页面未找到</p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">抱歉，您尝试访问的页面不存在或已被移除</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow border border-gray-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            返回上一页
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100"
          >
            <FontAwesomeIcon icon={faHome} className="h-4 w-4 mr-2" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
} 