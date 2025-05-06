import React, { useEffect, useState } from 'react';
import { getTeacherCourses } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faStar, faChalkboardTeacher, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';


interface Course {
  id: number | bigint;
  name: string;
  credits: number | bigint;
  teacher: string;
  isActive: boolean;
}

const TeacherCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (courses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <FontAwesomeIcon icon={faBook} className="text-gray-400 text-5xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无课程</h2>
        <p className="text-gray-600">您目前没有任何课程，请联系管理员添加课程。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">我的教授课程</h1>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <p className="text-gray-500 mt-2">共 {courses.length} 门课程</p>
      </div>

      {/* 课程列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={String(course.id)} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <FontAwesomeIcon icon={faBook} className="text-blue-500 h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate" title={course.name}>
                    {course.name}
                  </h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${course.isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-50 text-gray-500'}`}>
                  {course.isActive ? '已激活' : '未激活'}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">课程ID: </span>
                  <span className="font-medium text-gray-700">{String(course.id)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">学分: </span>
                  <div className="flex items-center">
                    {Array.from({ length: Number(course.credits) }).map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-4 w-4 ml-1" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">状态：</span>
                  <span className="flex items-center">
                    {course.isActive ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-1" />
                        <span className="text-green-600">激活</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-1" />
                        <span className="text-red-600">未激活</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses; 