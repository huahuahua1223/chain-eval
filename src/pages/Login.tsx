import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faExclamationCircle, faInfoCircle, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 背景动画元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500 rounded-full opacity-20 blur-3xl"></div>
        
        {/* 背景网格 */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      </div>

      <div className={`max-w-md w-full space-y-8 bg-white/10 backdrop-blur-xl px-8 py-10 rounded-2xl shadow-2xl border border-white/20 z-10 transition-all duration-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-3 rounded-full shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
              <FontAwesomeIcon icon={faGraduationCap} className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">欢迎回来</h2>
          <p className="mt-2 text-sm text-indigo-200">请登录您的账户</p>
        </div>

        <div className="rounded-lg bg-white/10 p-4 text-xs border border-indigo-300/30 backdrop-blur-sm">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-indigo-300 mt-0.5" />
            <div className="ml-2">
              <p className="text-indigo-100 font-medium">管理员登录信息</p>
              <p className="text-indigo-200 mt-1">ID: ADMIN<br />密码: 任意值</p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="userId" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                用户ID
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200"
                  placeholder="请输入用户ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                密码
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-400/20 p-3 text-xs border border-red-300/30 backdrop-blur-sm animate-pulse">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-300" />
                <p className="ml-2 font-medium text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 
                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-600/40 
                disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
            <p className="text-indigo-200">
              没有账号？
              <Link to="/register" className="font-medium text-indigo-300 hover:text-white ml-1 transition-colors duration-200 hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 