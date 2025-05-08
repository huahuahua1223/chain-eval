import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faExclamationCircle, faGraduationCap, faChalkboardTeacher, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(0); // 0: 学生, 1: 教师
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // 密码强度检查条件
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasNumber: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasSpecial: false
  });

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  // 检查密码强度
  useEffect(() => {
    setPasswordStrength({
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [password]);

  // 计算密码强度评级
  const calculatePasswordStrengthLevel = () => {
    const { hasLength, hasNumber, hasLowerCase, hasUpperCase, hasSpecial } = passwordStrength;
    const criteria = [hasLength, hasNumber, hasLowerCase, hasUpperCase, hasSpecial];
    const metCriteriaCount = criteria.filter(Boolean).length;

    if (metCriteriaCount === 0) return { level: 0, color: '', text: '' };
    if (metCriteriaCount === 1) return { level: 1, color: 'bg-red-500', text: '非常弱' };
    if (metCriteriaCount === 2) return { level: 2, color: 'bg-orange-500', text: '弱' };
    if (metCriteriaCount === 3) return { level: 3, color: 'bg-yellow-500', text: '中等' };
    if (metCriteriaCount === 4) return { level: 4, color: 'bg-blue-500', text: '强' };
    return { level: 5, color: 'bg-green-500', text: '非常强' };
  };

  const { level, color, text } = calculatePasswordStrengthLevel();
  const isPasswordStrong = level >= 3; // 至少中等强度才算有效

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError('密码强度不足，请确保至少满足3项安全条件');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      await registerUser(id, email, password, role);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("User ID already exists")) {
        setError('注册失败：该学号/工号已被注册');
      } else {
        setError('注册失败，请确保已连接钱包');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 背景动画元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500 rounded-full opacity-20 blur-3xl"></div>
        
        {/* 背景网格 */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      </div>

      <div className={`max-w-md w-full space-y-8 bg-white/10 backdrop-blur-xl px-8 py-10 rounded-2xl shadow-2xl border border-white/20 z-10 transition-all duration-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-400 to-indigo-500 p-3 rounded-full shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-transform duration-300">
              <FontAwesomeIcon icon={faGraduationCap} className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">创建新账户</h2>
          <p className="mt-2 text-sm text-indigo-200">加入我们的课程评价系统</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="id" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                学号/工号
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200"
                  placeholder="请输入您的学号或工号"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                邮箱
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="请设置密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </div>
              
              {/* 密码强度指示器 */}
              {(passwordFocused || password.length > 0) && (
                <div className="mt-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-indigo-200/20">
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-indigo-200">密码强度:</span>
                      <span className={`text-xs font-medium ${level >= 3 ? 'text-green-300' : 'text-red-300'}`}>{text}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} transition-all duration-300`} 
                        style={{ width: `${(level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={passwordStrength.hasLength ? faCheck : faTimes} 
                        className={`h-3 w-3 ${passwordStrength.hasLength ? 'text-green-400' : 'text-red-400'} mr-2`} 
                      />
                      <span className="text-xs text-indigo-200">至少8个字符</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={passwordStrength.hasNumber ? faCheck : faTimes} 
                        className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-red-400'} mr-2`} 
                      />
                      <span className="text-xs text-indigo-200">包含数字</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={passwordStrength.hasLowerCase ? faCheck : faTimes} 
                        className={`h-3 w-3 ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-red-400'} mr-2`} 
                      />
                      <span className="text-xs text-indigo-200">包含小写字母</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={passwordStrength.hasUpperCase ? faCheck : faTimes} 
                        className={`h-3 w-3 ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-red-400'} mr-2`} 
                      />
                      <span className="text-xs text-indigo-200">包含大写字母</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={passwordStrength.hasSpecial ? faCheck : faTimes} 
                        className={`h-3 w-3 ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-red-400'} mr-2`} 
                      />
                      <span className="text-xs text-indigo-200">包含特殊字符(!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                确认密码
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {/* 确认密码匹配指示器 */}
              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center">
                  <FontAwesomeIcon 
                    icon={password === confirmPassword ? faCheck : faTimes} 
                    className={`h-3 w-3 ${password === confirmPassword ? 'text-green-400' : 'text-red-400'} mr-2`} 
                  />
                  <span className={`text-xs ${password === confirmPassword ? 'text-green-300' : 'text-red-300'}`}>
                    {password === confirmPassword ? '密码匹配' : '密码不匹配'}
                  </span>
                </div>
              )}
            </div>

            <div className="group">
              <label htmlFor="role" className="block text-sm font-medium text-indigo-200 mb-1 group-hover:text-white transition-colors duration-200">
                角色
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="h-5 w-5 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-200" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(Number(e.target.value))}
                  className="form-input h-10 text-sm pl-10 rounded-lg border-indigo-300/30 bg-white/10 backdrop-blur-sm text-white w-full focus:bg-white/20 transition-all duration-200 appearance-none"
                >
                  <option value="0">学生</option>
                  <option value="1">教师</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
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
                bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
                text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-600/40 
                disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  注册中...
                </span>
              ) : (
                '注册'
              )}
            </button>
          </div>
          <div className="text-center text-xs">
            <p className="text-indigo-200">
              已有账号？
              <Link to="/login" className="font-medium text-indigo-300 hover:text-white ml-1 transition-colors duration-200 hover:underline">
                返回登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}