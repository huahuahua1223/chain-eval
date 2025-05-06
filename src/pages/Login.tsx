import { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm px-8 py-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faGraduationCap} className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
          <p className="mt-2 text-sm text-gray-600">请登录您的账户</p>
        </div>

        <div className="rounded-lg bg-blue-50/50 p-4 text-xs border border-blue-100">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="ml-2">
              <p className="text-blue-800 font-medium">管理员登录信息</p>
              <p className="text-blue-700 mt-1">ID: ADMIN<br />密码: 任意值</p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                用户ID
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="请输入用户ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs border border-red-100">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 text-red-400" />
                <p className="ml-2 font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 transition-colors duration-200">
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 