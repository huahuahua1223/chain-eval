import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getStudentEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faStar, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

// 定义评价结构体类型
interface Evaluation {
  score: number;
  comment: string;
  isAnonymous: boolean;
  timestamp: number | bigint;
}

export default function Evaluations() {
  const [user, setUser] = useState<User | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("userInfo", userInfo);
        setUser(userInfo);

        // 检查用户角色是否为学生
        if (Number(userInfo.role) !== 0) {
          setError('只有学生可以访问此页面');
          setLoading(false);
          return;
        }

        // 获取学生评价历史
        const studentEvaluations = await getStudentEvaluations() as unknown as Evaluation[];
        console.log("评价历史", studentEvaluations);
        setEvaluations(studentEvaluations);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 格式化时间戳
  const formatDate = (timestamp: number | bigint) => {
    try {
      // 将BigInt转换为数字
      const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
      const date = new Date(timestampNum * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error('格式化时间戳错误:', error, timestamp);
      return String(timestamp);
    }
  };

  // 渲染星级评分
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <FontAwesomeIcon
            key={value}
            icon={faStar}
            className={`h-5 w-5 ${
              value <= score ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

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
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">我的评价</h1>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon icon={faClipboardList} className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 评价列表卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">评价历史</h2>
        </div>
        
        {evaluations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评价内容
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    匿名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评价时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluations.map((evaluation, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(evaluation.score)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{evaluation.comment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        evaluation.isAnonymous 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {evaluation.isAnonymous ? '匿名' : '实名'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation && evaluation.timestamp ? formatDate(evaluation.timestamp) : '未知时间'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">暂无评价记录</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 