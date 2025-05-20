import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faExclamationCircle, 
  faGraduationCap, 
  faChalkboardTeacher, 
  faCheck, 
  faTimes,
  // faBook,
  // faComment,
  // faAward,
  // faUniversity,
  // faShield,
  faUserGraduate,
  faChevronRight,
  faCertificate,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import SimpleLanguageSwitcher from '../components/SimpleLanguageSwitcher';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* 左侧栏 - 角色选择和系统介绍 */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 flex flex-col justify-between relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 bg-white w-96 h-96 rounded-full -mr-40 -mt-40 opacity-10"></div>
          <div className="absolute bottom-0 left-0 bg-white w-96 h-96 rounded-full -ml-40 -mb-40 opacity-10"></div>
          <div className="absolute top-1/3 left-20 w-20 h-20 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-1/3 right-20 w-24 h-24 bg-white rounded-full opacity-10"></div>
        </div>
        
        {/* 语言切换器 */}
        <div className="absolute top-4 right-4 z-20">
          <SimpleLanguageSwitcher />
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
              <p className="text-indigo-100">基于区块链的课程评价系统</p>
            </div>
          </div>
          
          {/* 注册信息 */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-4">创建账户</h2>
            <p className="text-xl text-indigo-100">选择您的角色，加入我们的系统</p>
          </div>
          
          {/* 用户角色选择 */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4">我是...</h3>
            <div className="grid grid-cols-1 gap-4">
              <div 
                className={`p-4 rounded-xl cursor-pointer transition-all flex items-center ${
                  role === 0 
                    ? 'bg-white/20 border-2 border-white' 
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => setRole(0)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  role === 0 ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  <FontAwesomeIcon icon={faUserGraduate} className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-medium">学生</h3>
                  <p className="text-indigo-100 text-sm">注册为学生，进行课程评价</p>
                </div>
                {role === 0 && (
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-white" />
                )}
              </div>
              
              <div 
                className={`p-4 rounded-xl cursor-pointer transition-all flex items-center ${
                  role === 1 
                    ? 'bg-white/20 border-2 border-white' 
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => setRole(1)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  role === 1 ? 'bg-purple-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-medium">教师</h3>
                  <p className="text-indigo-100 text-sm">注册为教师，管理课程和查看评价</p>
                </div>
                {role === 1 && (
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </div>
          
          {/* 注册优势 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">注册优势</h3>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
              </div>
              <p>公正透明的课程评价体系</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
              </div>
              <p>基于区块链的数据安全保障</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
              </div>
              <p>支持匿名评价，保护隐私</p>
            </div>
          </div>
        </div>
        
        {/* 页脚 */}
        <div className="relative z-10 border-t border-white/20 pt-6 mt-auto">
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} ChainEval</span>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCertificate} className="mr-2 h-4 w-4" />
                <span>安全保障</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faHandshake} className="mr-2 h-4 w-4" />
                <span>用户协议</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 右侧栏 - 注册表单 */}
      <div className="w-full md:w-1/2 p-4 md:p-12 flex items-center justify-center">
        <div className={`max-w-md w-full transition-all duration-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white px-8 py-10 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">用户注册</h2>
              <p className="mt-2 text-sm text-gray-500">请填写以下信息完成注册</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                    {role === 0 ? '学号' : '工号'}
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="id"
                      name="id"
                      type="text"
                      required
                      className="form-input h-10 text-sm pl-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full"
                      placeholder={`请输入您的${role === 0 ? '学号' : '工号'}`}
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="form-input h-10 text-sm pl-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full"
                      placeholder="请输入您的邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      placeholder="请设置密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                  </div>
                  
                  {/* 密码强度指示器 */}
                  {(passwordFocused || password.length > 0) && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">密码强度:</span>
                          <span className={`text-xs font-medium ${level >= 3 ? 'text-green-600' : 'text-red-600'}`}>{text}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                            className={`h-3 w-3 ${passwordStrength.hasLength ? 'text-green-500' : 'text-red-500'} mr-2`} 
                          />
                          <span className="text-xs text-gray-600">至少8个字符</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={passwordStrength.hasNumber ? faCheck : faTimes} 
                            className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-red-500'} mr-2`} 
                          />
                          <span className="text-xs text-gray-600">包含数字</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={passwordStrength.hasLowerCase ? faCheck : faTimes} 
                            className={`h-3 w-3 ${passwordStrength.hasLowerCase ? 'text-green-500' : 'text-red-500'} mr-2`} 
                          />
                          <span className="text-xs text-gray-600">包含小写字母</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={passwordStrength.hasUpperCase ? faCheck : faTimes} 
                            className={`h-3 w-3 ${passwordStrength.hasUpperCase ? 'text-green-500' : 'text-red-500'} mr-2`} 
                          />
                          <span className="text-xs text-gray-600">包含大写字母</span>
                        </div>
                        <div className="flex items-center">
                          <FontAwesomeIcon 
                            icon={passwordStrength.hasSpecial ? faCheck : faTimes} 
                            className={`h-3 w-3 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-red-500'} mr-2`} 
                          />
                          <span className="text-xs text-gray-600">包含特殊字符(!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    确认密码
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="form-input h-10 text-sm pl-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full"
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
                        className={`h-3 w-3 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'} mr-2`} 
                      />
                      <span className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {password === confirmPassword ? '密码匹配' : '密码不匹配'}
                      </span>
                    </div>
                  )}
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
                    bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                    text-white shadow-md hover:shadow-lg
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
                <p className="text-gray-600">
                  已有账号？
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 ml-1 transition-colors duration-200 hover:underline">
                    返回登录
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