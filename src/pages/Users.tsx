import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faGraduationCap, 
  faChalkboardTeacher, 
  faShieldAlt, 
  faCheck, 
  faTimes, 
  faUsers, 
  faSearch,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number; // 0: 学生, 1: 教师, 2: 管理员
  isRegistered: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchUsers = async () => {
      try {
        const userList = await getAllUsers();
        console.log(userList)
        setUsers(userList as User[]);
        setLoading(false);
      } catch (err) {
        setError('获取用户列表失败');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleIcon = (role: number) => {
    switch (role) {
      case 0:
        return <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-blue-500" />;
      case 1:
        return <FontAwesomeIcon icon={faChalkboardTeacher} className="h-5 w-5 text-green-500" />;
      case 2:
        return <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0:
        return '学生';
      case 1:
        return '教师';
      case 2:
        return '管理员';
      default:
        return '未知';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1:
        return 'bg-green-100 text-green-800 border-green-200';
      case 2:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 筛选用户
  const filteredUsers = users.filter(user => 
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取用户数据</p>
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
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">获取数据失败</h3>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-100 to-blue-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-blue-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">用户管理</h1>
              <p className="text-gray-500">管理系统中的所有用户账户</p>
            </div>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 text-sm font-medium text-indigo-700 shadow-sm">
            共 {users.length} 位用户
          </div>
        </div>
      </div>

      {/* 搜索卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-3"
            placeholder="搜索用户ID或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 用户列表卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  用户信息
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  邮箱
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  密码哈希
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  角色
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg shadow-sm ${Number(user.role) === 0 ? 'bg-blue-50' : Number(user.role) === 1 ? 'bg-green-50' : 'bg-red-50'}`}>
                            {getRoleIcon(Number(user.role))}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={user.passwordHash}>
                        {user.passwordHash.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex items-center rounded-full text-xs font-medium border ${getRoleColor(Number(user.role))}`}>
                        {getRoleIcon(Number(user.role))}
                        <span className="ml-1.5">{getRoleName(Number(user.role))}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isRegistered ? (
                        <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 text-xs font-medium inline-flex items-center">
                          <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
                          已注册
                        </span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 text-xs font-medium inline-flex items-center">
                          <FontAwesomeIcon icon={faTimes} className="mr-1.5" />
                          未注册
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block bg-gray-50 p-4 rounded-full mb-3">
                      <FontAwesomeIcon icon={faSearch} className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">未找到匹配的用户</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 mt-4">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">暂无用户数据</h3>
            <p className="text-gray-500 max-w-md mx-auto">系统中还没有注册的用户</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users; 