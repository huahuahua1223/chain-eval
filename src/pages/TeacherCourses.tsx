import React, { useEffect, useState } from 'react';
import { getTeacherCourses } from '../utils/contract';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faStar, 
  faChalkboardTeacher, 
  faCheck, 
  faTimes, 
  faExclamationCircle,
  faCalendarAlt,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';


interface Course {
  id: number | bigint;
  name: string;
  credits: number | bigint;
  teacher: string;
  isActive: boolean;
}

const TeacherCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchCourses = async () => {
      try {
        const courseList = await getTeacherCourses();
        console.log('获取到的课程:', courseList);
        setCourses(courseList as Course[]);
        setLoading(false);
      } catch (err) {
        console.error('获取课程列表失败:', err);
        setError('获取课程列表失败，请确保您已连接钱包并且是教师角色');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId: number | bigint) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取您的课程数据</p>
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
        <div className="absolute top-0 right-0 bg-gradient-to-br from-green-100 to-teal-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-teal-100 to-green-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">我的教授课程</h1>
              <p className="text-gray-500">查看您负责教授的课程信息</p>
            </div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 text-sm font-medium text-green-700 shadow-sm">
            共 {courses.length} 门课程
          </div>
        </div>
      </div>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">暂无课程数据</h3>
          <p className="text-gray-500 max-w-md mx-auto">您目前没有任何课程，请联系管理员分配课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={String(course.id)}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 group relative cursor-pointer"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* 卡片装饰元素 */}
              <div className="absolute top-0 right-0 bg-gradient-to-br from-green-50 to-teal-50 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
              
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-400 to-teal-500 p-3 rounded-xl shadow-sm mr-3 group-hover:shadow-md transition-all duration-300">
                      <FontAwesomeIcon icon={faBook} className="text-white h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-green-700 transition-colors duration-300" title={course.name}>
                      {course.name}
                    </h3>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    course.isActive 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {course.isActive ? (
                      <span className="flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                        已激活
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="h-2 w-2 bg-gray-400 rounded-full mr-1.5"></span>
                        未激活
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 mb-4 group-hover:border-green-100 transition-colors duration-300">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-green-600 h-4 w-4" />
                    </div>
                    <span className="ml-2 text-gray-600">课程详情</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">课程ID:</span>
                      <span className="font-medium text-gray-700 text-sm">{String(course.id)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">学分:</span>
                      <div className="flex items-center">
                        {Array.from({ length: Number(course.credits) }).map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-3.5 w-3.5 ml-0.5" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">状态:</span>
                      <span className="flex items-center">
                        {course.isActive ? (
                          <span className="text-green-600 text-sm font-medium">
                            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-1.5 h-3.5 w-3.5" />
                            激活
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">
                            <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-1.5 h-3.5 w-3.5" />
                            未激活
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                    <span>最近更新</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors duration-200 border border-green-100 text-xs font-medium">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses; 