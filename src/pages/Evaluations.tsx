import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getStudentEvaluations } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faStar, 
  faExclamationCircle, 
  faHistory, 
  faCalendarAlt,
  faComment,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

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
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    
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
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faHistory} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取评价历史数据</p>
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
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">访问错误</h3>
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
        <div className="absolute top-0 right-0 bg-gradient-to-br from-orange-100 to-yellow-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-yellow-100 to-orange-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faHistory} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">我的评价历史</h1>
              <p className="text-gray-500">查看您对课程提交的所有评价</p>
            </div>
          </div>
          <div className="bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100 text-sm font-medium text-yellow-700 shadow-sm">
            共 {evaluations.length} 条评价
          </div>
        </div>
      </div>

      {/* 评价列表卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FontAwesomeIcon icon={faClipboardList} className="h-5 w-5 text-orange-500 mr-2" />
          评价历史记录
        </h2>
        
        {evaluations.length > 0 ? (
          <div className="space-y-6">
            {evaluations.map((evaluation, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow hover:border-orange-100 group"
              >
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    {renderStars(evaluation.score)}
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 h-3.5 w-3.5" />
                      {evaluation && evaluation.timestamp ? formatDate(evaluation.timestamp) : '未知时间'}
                    </div>
                  </div>
                  
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                    evaluation.isAnonymous 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <FontAwesomeIcon 
                      icon={evaluation.isAnonymous ? faEyeSlash : faEye} 
                      className="mr-1.5 h-3.5 w-3.5" 
                    />
                    {evaluation.isAnonymous ? '匿名评价' : '实名评价'}
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 relative group-hover:border-orange-200 transition-colors duration-200">
                  <FontAwesomeIcon icon={faComment} className="absolute top-4 left-4 text-orange-200 h-16 w-16 opacity-20" />
                  <p className="text-gray-800 relative">{evaluation.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">暂无评价记录</h3>
            <p className="text-gray-500 max-w-md mx-auto">您尚未对任何课程提交评价，完成课程后可以提交评价</p>
          </div>
        )}
      </div>
    </div>
  );
} 