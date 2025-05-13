import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTimes,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseId: number, courseName: string, courseCredits: number, teacherAddress: string) => Promise<void>;
  course: Course | null;
}

export default function EditCourseModal({ isOpen, onClose, onSubmit, course }: EditCourseModalProps) {
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState<number>(0);
  const [teacherAddress, setTeacherAddress] = useState('');
  const [editingCourse, setEditingCourse] = useState(false);
  const [editCourseError, setEditCourseError] = useState('');

  useEffect(() => {
    if (course) {
      setCourseName(course.name);
      setCourseCredits(course.credits);
      setTeacherAddress(course.teacher);
    }
  }, [course]);

  const resetForm = () => {
    if (course) {
      setCourseName(course.name);
      setCourseCredits(course.credits);
      setTeacherAddress(course.teacher);
    }
    setEditCourseError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setEditingCourse(true);
    setEditCourseError('');

    try {
      if (!courseName.trim()) {
        throw new Error('课程名称不能为空');
      }
      
      if (courseCredits <= 0 || courseCredits > 10) {
        throw new Error('学分必须在1-10之间');
      }
      
      if (!teacherAddress || !teacherAddress.startsWith('0x') || teacherAddress.length !== 42) {
        throw new Error('请输入有效的教师地址');
      }
      
      await onSubmit(course.id, courseName, courseCredits, teacherAddress);
      onClose();
    } catch (err: any) {
      console.error('修改课程失败:', err);
      setEditCourseError(err.message || '修改课程失败，请重试');
    } finally {
      setEditingCourse(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"></div>
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all sm:my-8">
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-100 to-indigo-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-30"></div>
          <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-purple-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-30"></div>
          
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl shadow-md mr-3">
                  <FontAwesomeIcon icon={faEdit} className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">修改课程</h3>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
            
            {editCourseError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 mr-2 text-red-500" />
                  <p>{editCourseError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                  课程名称
                </label>
                <input
                  type="text"
                  id="courseName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="请输入课程名称"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 mb-2">
                  学分
                </label>
                <input
                  type="number"
                  id="courseCredits"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={courseCredits}
                  onChange={(e) => setCourseCredits(Number(e.target.value))}
                  min="1"
                  max="10"
                  placeholder="1-10"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label htmlFor="teacherAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  教师地址
                </label>
                <input
                  type="text"
                  id="teacherAddress"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={teacherAddress}
                  onChange={(e) => setTeacherAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  disabled={editingCourse}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70 transform hover:scale-[1.02]"
                  disabled={editingCourse}
                >
                  {editingCourse ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </span>
                  ) : "保存修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 