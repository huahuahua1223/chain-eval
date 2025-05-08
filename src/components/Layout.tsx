import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative">
      {/* 背景装饰元素 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-16rem)]">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white/80 backdrop-blur-sm shadow-md mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <span className="text-xl font-bold text-indigo-600 mr-2">课链智评</span>
                <span className="text-sm text-gray-500">基于区块链的课程评价系统</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">安全、透明、不可篡改的评价记录</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                使用指南
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                关于我们
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                隐私政策
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} 课链智评 - 版权所有
          </div>
        </div>
      </footer>
    </div>
  );
} 