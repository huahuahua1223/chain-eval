import { useState, useEffect } from 'react';
import { getCurrentUserInfo } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faChalkboardTeacher, faStar, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          <p className="text-xl font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">个人信息</h2>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon 
              icon={Number(user?.role) === 0 ? faGraduationCap : Number(user?.role) === 1 ? faChalkboardTeacher : faStar}
              className="h-6 w-6 text-indigo-600" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">学号/工号</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{user?.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">邮箱</p>
                <p className="mt-1 text-lg font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                <FontAwesomeIcon 
                  icon={Number(user?.role) === 0 ? faGraduationCap : Number(user?.role) === 1 ? faChalkboardTeacher : faStar}
                  className="h-5 w-5 text-indigo-600" 
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">角色</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {Number(user?.role) === 0 ? '学生' : Number(user?.role) === 1 ? '教师' : '管理员'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">注册状态</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {user?.isRegistered ? '已注册' : '未注册'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 