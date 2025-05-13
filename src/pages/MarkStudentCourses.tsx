import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, 
  faExclamationCircle, 
  faUserGraduate, 
  faBook,
  faChevronDown,
  faGraduationCap,
  faShieldAlt,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { getAllCourses, markStudentCourse, getCurrentUserInfo } from '../utils/contract';

// 定义课程结构体类型
interface Course {
  id: string;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

export default function MarkStudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [studentAddress, setStudentAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchData = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        if (Number(userInfo.role) !== 2) {
          setError('只有管理员可以访问此页面');
          setPageLoading(false);
          return;
        }

        const allCourses = await getAllCourses() as unknown as Course[];
        console.log(allCourses)
        setCourses(allCourses);
        setPageLoading(false);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse === null || !studentAddress) {
      console.log(selectedCourse,studentAddress)
      setError('请选择课程并输入学生地址');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(selectedCourse, studentAddress)
      await markStudentCourse(selectedCourse, studentAddress);
      setSuccess('成功标记学生课程');
      setStudentAddress('');
      setSelectedCourse(null);
    } catch (err) {
      console.error('标记学生课程失败:', err);
      setError('标记学生课程失败，请确保输入正确的学生地址');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取课程数据</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('只有管理员可以访问')) {
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
        <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-100 to-indigo-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-purple-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faUserPlus} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">标记学生课程</h1>
              <p className="text-gray-500">将课程分配给学生，记录已修课程</p>
            </div>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100 text-sm font-medium text-purple-700 shadow-sm">
            管理员功能
          </div>
        </div>
      </div>

      {/* 表单卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-purple-500 mr-2" />
          课程分配表单
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {error && error !== '只有管理员可以访问此页面' && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center animate-pulse">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center animate-pulse">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-500" />
              </div>
              <p className="font-medium">{success}</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <label className="flex items-center text-md font-medium text-gray-800 mb-3">
              <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-purple-500 mr-2" />
              选择课程
            </label>
            <div className="relative">
              <select
                value={selectedCourse !== null ? selectedCourse : ''}
                onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : null)}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">请选择课程</option>
                {courses.map((course, index) => (
                  <option key={index} value={index}>
                    {course.name} - {course.credits}学分
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">选择要分配给学生的课程</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <label className="flex items-center text-md font-medium text-gray-800 mb-3">
              <FontAwesomeIcon icon={faUserGraduate} className="h-5 w-5 text-purple-500 mr-2" />
              学生钱包地址
            </label>
            <input
              type="text"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              placeholder="请输入学生的钱包地址 (0x...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
            <p className="text-sm text-gray-500 mt-2">输入要分配课程的学生以太坊地址</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70 transform hover:scale-[1.02] flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                标记中...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} className="mr-2 h-5 w-5" />
                标记课程
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 max-w-lg mx-auto">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-gray-600 text-sm">
              <strong className="text-purple-700">提示：</strong> 
              标记学生课程后，该学生将能够对该课程进行评价。请确保学生已修过此课程。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 