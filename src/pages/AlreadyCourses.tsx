import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserInfo, getStudentTakenCourses, submitEvaluation } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faCheckCircle,
  faExclamationCircle,
  faStar,
  faComment,
  faAward,
  faSearch,
  faFilter,
  faEraser,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import EvaluationModal from '../components/EvaluationModal';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

// 定义课程结构体类型
interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

export default function AlreadyCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'teacher' | 'all'>('all');
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  console.log("user", user);

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

        // 获取学生已修课程
        const takenCourses = await getStudentTakenCourses() as unknown as Course[];
        console.log("已修课程", takenCourses);
        setCourses(takenCourses);
        setFilteredCourses(takenCourses);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理搜索功能
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    let filtered: Course[];

    switch(searchField) {
      case 'name':
        filtered = courses.filter(course => 
          course.name.toLowerCase().includes(query)
        );
        break;
      case 'teacher':
        filtered = courses.filter(course => 
          course.teacher.toLowerCase().includes(query)
        );
        break;
      case 'all':
      default:
        filtered = courses.filter(course => 
          course.name.toLowerCase().includes(query) || 
          course.teacher.toLowerCase().includes(query)
        );
        break;
    }

    setFilteredCourses(filtered);
  }, [searchQuery, searchField, courses]);

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchField('all');
    setFilteredCourses(courses);
    setShowSearchOptions(false);
  };

  const handleSubmitEvaluation = async (score: number, comment: string, isAnonymous: boolean) => {
    if (!selectedCourse) return;
    
    try {
      await submitEvaluation(selectedCourse.id, score, comment, isAnonymous);
      // 刷新课程列表
      const takenCourses = await getStudentTakenCourses() as unknown as Course[];
      setCourses(takenCourses);
      setFilteredCourses(takenCourses);
    } catch (err) {
      console.error('评价提交失败:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取已修课程数据</p>
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
        <div className="absolute top-0 right-0 bg-gradient-to-br from-green-100 to-blue-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-purple-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faAward} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">已修课程</h1>
              <p className="text-gray-500">查看您已修的所有课程，并进行评价</p>
            </div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 text-sm font-medium text-green-700 shadow-sm">
            共 {courses.length} 门课程
          </div>
        </div>
      </div>

      {/* 课程列表卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        {/* 搜索框 */}
        <div className="mb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="搜索课程名称或教师地址..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button 
                  className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                  onClick={() => setShowSearchOptions(!showSearchOptions)}
                >
                  <FontAwesomeIcon icon={faFilter} className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleResetSearch}
              className="flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon={faEraser} className="h-4 w-4 mr-2" />
              重置
            </button>
          </div>
          
          {/* 搜索选项下拉菜单 */}
          {showSearchOptions && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-3 animate-fadeIn">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">搜索范围:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="all"
                    name="searchField"
                    value="all"
                    checked={searchField === 'all'}
                    onChange={() => setSearchField('all')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="all" className="text-sm text-gray-700">全部</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="name"
                    name="searchField"
                    value="name"
                    checked={searchField === 'name'}
                    onChange={() => setSearchField('name')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="name" className="text-sm text-gray-700">仅课程名称</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="teacher"
                    name="searchField"
                    value="teacher"
                    checked={searchField === 'teacher'}
                    onChange={() => setSearchField('teacher')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="teacher" className="text-sm text-gray-700">仅教师地址</label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-xl font-bold text-gray-900">我的已修课程列表</h2>
          <div className="text-sm text-indigo-600">
            {searchQuery && `搜索结果: ${filteredCourses.length} 门课程`}
          </div>
        </div>
        
        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    课程名称
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    学分
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    授课教师
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {Array.from({ length: Number(course.credits) }).map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-4 w-4 mr-0.5" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 shadow-sm">
                        {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 h-4 w-4" />
                        已修
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/course/${course.id}`)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-1.5 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 active:scale-100 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1.5 h-3.5 w-3.5" />
                          查看
                        </button>
                        <button
                          onClick={() => handleOpenModal(course)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-1.5 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 active:scale-100 flex items-center"
                        >
                          <FontAwesomeIcon icon={faComment} className="mr-1.5 h-3.5 w-3.5" />
                          评价
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {searchQuery ? '没有匹配的搜索结果' : '暂无已修课程'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery 
                ? '请尝试使用不同的搜索条件或清除筛选条件' 
                : '您目前没有任何已修课程记录，请联系管理员确认您的课程信息'
              }
            </p>
            {searchQuery && (
              <button 
                onClick={handleResetSearch}
                className="mt-4 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors duration-200 inline-flex items-center"
              >
                <FontAwesomeIcon icon={faEraser} className="mr-2 h-4 w-4" />
                清除搜索
              </button>
            )}
          </div>
        )}
      </div>

      {/* 评价弹窗 */}
      {selectedCourse && (
        <EvaluationModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitEvaluation}
        />
      )}
    </div>
  );
}