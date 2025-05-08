import { useState, useEffect } from 'react';
import { getCurrentUserInfo, updateUserProfile, changePassword } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faChalkboardTeacher, 
  faShieldAlt, 
  faUser, 
  faEnvelope, 
  faCheckCircle, 
  faExclamationCircle,
  faIdCard,
  faEdit,
  faKey,
  faSave,
  faTimes,
  faLock
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
  
  // 编辑相关的状态
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        setUser(userInfo);
        setNewEmail(userInfo.email);
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

  // 处理邮箱更新
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage({ type: '', text: '' });

    try {
      await updateUserProfile(newEmail);
      
      // 更新本地用户数据
      if (user) {
        setUser({
          ...user,
          email: newEmail
        });
      }
      
      setUpdateMessage({ type: 'success', text: '邮箱更新成功！' });
      setIsEditingEmail(false);
    } catch (err) {
      console.error('更新邮箱失败:', err);
      setUpdateMessage({ type: 'error', text: '更新邮箱失败，请重试' });
    } finally {
      setUpdateLoading(false);
    }
  };

  // 处理密码更新
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setUpdateMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }
    
    setUpdateLoading(true);
    setUpdateMessage({ type: '', text: '' });

    try {
      await changePassword(oldPassword, newPassword);
      
      setUpdateMessage({ type: 'success', text: '密码更新成功！' });
      setIsChangingPassword(false);
      
      // 清空密码字段
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('更新密码失败:', err);
      if (err.message && err.message.includes("Incorrect old password")) {
        setUpdateMessage({ type: 'error', text: '原密码不正确' });
      } else {
        setUpdateMessage({ type: 'error', text: '更新密码失败，请重试' });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    if (user) {
      setNewEmail(user.email);
    }
    setIsEditingEmail(false);
  };

  // 取消修改密码
  const handleCancelPasswordChange = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
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
      {/* 消息提示框 */}
      {updateMessage.text && (
        <div className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-lg border transition-all duration-300 transform ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={updateMessage.type === 'success' ? faCheckCircle : faExclamationCircle}
              className={`h-5 w-5 mr-3 ${
                updateMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}
            />
            <p className="text-sm font-medium">{updateMessage.text}</p>
            <button 
              onClick={() => setUpdateMessage({ type: '', text: '' })}
              className="ml-auto text-gray-400 hover:text-gray-500"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">电子邮箱</p>
                  {isEditingEmail ? (
                    <div className="relative">
                      <form onSubmit={handleUpdateEmail} className="flex space-x-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="text-md font-semibold text-gray-900 border border-indigo-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 w-full"
                          placeholder="输入新邮箱"
                          required
                        />
                        <div className="flex space-x-1">
                          <button
                            type="submit"
                            disabled={updateLoading}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white p-1 rounded-lg transition-colors duration-300 flex items-center justify-center"
                          >
                            {updateLoading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-lg transition-colors duration-300"
                          >
                            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{user?.email}</p>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors duration-300"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg mr-5 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <FontAwesomeIcon icon={faKey} className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 group-hover:text-indigo-500 transition-colors duration-300">密码设置</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                      ••••••••
                    </p>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors duration-300"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 修改密码表单 */}
        {isChangingPassword && (
          <div className="mt-6 p-6 bg-indigo-50 rounded-xl border border-indigo-100 shadow-inner">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              修改密码
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">当前密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
                  placeholder="输入当前密码"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
                  placeholder="输入新密码"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
                  placeholder="再次输入新密码"
                  required
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">两次输入的密码不一致</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={updateLoading || (newPassword !== confirmPassword && confirmPassword !== '')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      处理中...
                    </>
                  ) : (
                    <>确认修改</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-gray-600 text-sm">
              <strong className="text-indigo-700">提示：</strong> 
              账户信息来自区块链，确保信息安全和不可篡改。您可以随时更新邮箱和密码。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 