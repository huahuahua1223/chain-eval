import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="bg-yellow-50 p-6 rounded-full mb-6 inline-block">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">抱歉，您访问的页面不存在</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          <FontAwesomeIcon icon={faHome} className="h-5 w-5 mr-2" />
          返回首页
        </button>
      </div>
    </div>
  );
} 