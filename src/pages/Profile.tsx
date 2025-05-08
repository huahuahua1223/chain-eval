import { useState, useEffect } from 'react';
import { getCurrentUserInfo } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faChalkboardTeacher, 
  faShieldAlt, 
  faUser, 
  faEnvelope, 
  faCheckCircle, 
  faExclamationCircle,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        setUser(userInfo);
      } catch (err) {
        console.error('获取用户信息失败:', err);
        setError('获取用户信息失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 获取角色图标
  const getRoleIcon = (role: number | null) => {
    switch(role) {
      case 0: return faGraduationCap;
      case 1: return faChalkboardTeacher;
      case 2: return faShieldAlt;
      default: return faUser;
    }
  };

  // 获取角色名称
  const getRoleName = (role: number | null) => {
    switch(role) {
      case 0: return '学生';
      case 1: return '教师';
      case 2: return '管理员';
      default: return '用户';
    }
  };

  // 获取角色颜色
  const getRoleColor = (role: number | null) => {
    switch(role) {
      case 0: return 'from-blue-400 to-blue-600';
      case 1: return 'from-indigo-400 to-indigo-600';
      case 2: return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取用户信息</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-xl mb-6 shadow-sm max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">获取信息失败</h3>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-indigo-100 to-blue-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-purple-100 to-indigo-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center">
            <div className={`bg-gradient-to-r ${getRoleColor(Number(user?.role))} p-4 rounded-xl shadow-md mr-4`}>
              <FontAwesomeIcon 
                icon={getRoleIcon(Number(user?.role))} 
                className="h-7 w-7 text-white" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">我的个人信息</h2>
              <p className="text-gray-500">
                您的身份: <span className="font-medium text-indigo-700">{getRoleName(Number(user?.role))}</span>
              </p>
            </div>
          </div>
          <div className={`px-4 py-1 rounded-full text-sm ${user?.isRegistered ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'} flex items-center`}>
            <FontAwesomeIcon 
              icon={user?.isRegistered ? faCheckCircle : faExclamationCircle} 
              className="h-4 w-4 mr-1.5" 
            />
            {user?.isRegistered ? '已认证' : '未认证'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100 group">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <FontAwesomeIcon icon={faIdCard} className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">学号/工号</p>
                <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{user?.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100 group">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">电子邮箱</p>
                <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100 group">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <FontAwesomeIcon 
                  icon={getRoleIcon(Number(user?.role))}
                  className="h-6 w-6 text-indigo-600" 
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">用户角色</p>
                <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                  {getRoleName(Number(user?.role))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-indigo-100 group">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">账户状态</p>
                <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                  {user?.isRegistered ? '已激活' : '未激活'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-gray-600 text-sm">
              <strong className="text-indigo-700">提示：</strong> 
              账户信息来自区块链，确保信息安全和不可篡改。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 