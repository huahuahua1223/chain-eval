import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faExclamationCircle, 
  faInfoCircle, 
  faGraduationCap,
  faChalkboardTeacher,
  faBook,
  faComment,
  faAward,
  faUniversity,
  faCheckCircle,
  faChartLine,
  faShieldAlt,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await loginUser(id, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('登录失败，请检查账号密码');
      }
    } catch (err) {
      setError('登录失败，请确保已连接钱包');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* 左侧栏 - 品牌信息和特点展示 */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 flex flex-col justify-between relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 bg-white w-96 h-96 rounded-full -mr-40 -mt-40 opacity-10"></div>
          <div className="absolute bottom-0 left-0 bg-white w-96 h-96 rounded-full -ml-40 -mb-40 opacity-10"></div>
          <div className="absolute top-1/4 left-10 w-16 h-16 bg-white rounded-full opacity-10"></div>
          <div className="absolute top-1/3 right-10 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
        
        {/* 内容区域 */}
        <div className="relative z-10">
          {/* 品牌标志 */}
          <div className="flex items-center mb-12">
            <div className="bg-white p-3 rounded-lg shadow-md mr-4">
              <FontAwesomeIcon icon={faGraduationCap} className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ChainEval</h1>
              <p className="text-blue-100">基于区块链的课程评价系统</p>
            </div>
          </div>
          
          {/* 欢迎信息 */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">欢迎回来</h2>
            <p className="text-xl text-blue-100">登录您的账户，访问更多功能</p>
          </div>
          
          {/* 系统特点展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">数据透明</h3>
                <p className="text-blue-100">所有评价数据公开可查，确保透明性</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">区块链安全</h3>
                <p className="text-blue-100">利用区块链技术确保数据不可篡改</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FontAwesomeIcon icon={faIdCard} className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">身份认证</h3>
                <p className="text-blue-100">确保评价来源可靠，提高系统公信力</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FontAwesomeIcon icon={faComment} className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">匿名评价</h3>
                <p className="text-blue-100">支持匿名评价，保护用户隐私</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 页脚 */}
        <div className="relative z-10 border-t border-white/20 pt-6 mt-auto">
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} ChainEval</span>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 h-4 w-4" />
                <span>安全可靠</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 h-4 w-4" />
                <span>公开透明</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 右侧栏 - 登录表单 */}
      <div className="w-full md:w-1/2 p-4 md:p-12 flex items-center justify-center">
        <div className={`max-w-md w-full transition-all duration-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white px-8 py-10 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">用户登录</h2>
              <p className="mt-2 text-sm text-gray-500">请输入您的账户信息</p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-xs border border-blue-100 mb-6">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="ml-2">
                  <p className="text-blue-700 font-medium">管理员登录信息</p>
                  <p className="text-blue-600 mt-1">ID: ADMIN<br />密码: 任意值</p>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                    用户ID
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      className="form-input h-10 text-sm pl-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full"
                      placeholder="请输入用户ID"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="form-input h-10 text-sm pl-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs border border-red-200">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-500" />
                    <p className="ml-2 font-medium text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 
                    bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                    text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登录中...
                    </span>
                  ) : (
                    '登录'
                  )}
                </button>
              </div>
              <div className="text-center text-xs">
                <p className="text-gray-600">
                  没有账号？
                  <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800 ml-1 transition-colors duration-200 hover:underline">
                    立即注册
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 