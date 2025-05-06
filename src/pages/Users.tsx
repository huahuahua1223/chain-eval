import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGraduationCap, faChalkboardTeacher, faShieldAlt, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
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
        return <FontAwesomeIcon icon={faGraduationCap} className="text-blue-500" />;
      case 1:
        return <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-500" />;
      case 2:
        return <FontAwesomeIcon icon={faShieldAlt} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faUser} className="text-gray-500" />;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">错误：</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">用户管理</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">密码哈希</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册状态</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {getRoleIcon(Number(user.role))}
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
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getRoleName(Number(user.role))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isRegistered ? (
                    <span className="text-green-600">
                      <FontAwesomeIcon icon={faCheck} className="mr-1" />
                      已注册
                    </span>
                  ) : (
                    <span className="text-red-600">
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      未注册
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users; 