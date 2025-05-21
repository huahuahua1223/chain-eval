import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faDownload, 
  faSpinner,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Evaluation {
  score: number;
  comment: string;
  isAnonymous: boolean;
  timestamp: number | bigint;
  student: string;
}

interface EvaluationWordCloudProps {
  evaluations: Evaluation[];
  courseName: string;
}

interface WordFrequency {
  text: string;
  value: number;
}

export default function EvaluationWordCloud({ evaluations, courseName }: EvaluationWordCloudProps) {
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const wordCloudRef = useRef<HTMLDivElement>(null);

  // 中文常用停用词列表
  const stopWords = [
    '的', '了', '和', '是', '就', '都', '而', '及', '与', '着',
    '或', '一个', '没有', '我们', '你们', '他们', '很', '好', '在',
    '有', '这', '那', '也', '还', '但', '如果', '因为', '所以', '由于',
    '然后', '可以', '不', '这个', '一些', '这些', '那些', '什么', '为什么'
  ];

  useEffect(() => {
    if (evaluations.length > 0) {
      generateWordFrequency();
    }
  }, [evaluations]);

  const generateWordFrequency = () => {
    try {
      const allComments = evaluations.map(e => e.comment).join(' ');
      
      // 简单的词频统计实现，实际应用中可能需要更复杂的分词处理
      const words = allComments
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // 移除标点符号
        .split(/\s+/) // 按空格分割成单词
        .filter(word => 
          word.length > 1 && 
          !stopWords.includes(word.toLowerCase())
        ); // 过滤停用词和过短的词
      
      // 统计词频
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        const normalizedWord = word.toLowerCase();
        wordCount[normalizedWord] = (wordCount[normalizedWord] || 0) + 1;
      });
      
      // 转换为词频数组并排序
      const wordFreq = Object.entries(wordCount)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25); // 取前25个高频词
      
      setWordFrequencies(wordFreq);
    } catch (err) {
      console.error('生成词频统计失败:', err);
      setError('生成词频统计失败');
    }
  };

  const exportToPdf = async () => {
    if (!wordCloudRef.current || evaluations.length === 0) return;

    setIsGenerating(true);
    setError('');

    try {
      const element = wordCloudRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // 添加标题
      pdf.setFontSize(18);
      pdf.setTextColor(50, 50, 140);
      pdf.text(`《${courseName}》课程评价词频统计`, pdfWidth / 2, 20, { align: 'center' });

      // 添加图表
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // 添加评价基本信息
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`统计信息：基于 ${evaluations.length} 条学生评价`, 14, pdfHeight - 30);
      pdf.text(`生成时间：${new Date().toLocaleString()}`, 14, pdfHeight - 25);
      
      // 添加页脚
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('课链智评 - 基于区块链的课程评价系统', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // 保存PDF
      pdf.save(`${courseName}_评价词频统计.pdf`);
    } catch (err) {
      console.error('导出PDF失败:', err);
      setError('导出PDF失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  if (evaluations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <FontAwesomeIcon icon={faExclamationCircle} className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-gray-500">暂无评价数据，无法生成词频统计</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-sm mr-3">
            <FontAwesomeIcon icon={faChartBar} className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">评价词频统计</h3>
        </div>
        <button
          onClick={exportToPdf}
          disabled={isGenerating || evaluations.length === 0}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg shadow-sm flex items-center transition-all duration-200 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-4 w-4 mr-2" />
              生成中...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
              导出PDF
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div 
        ref={wordCloudRef} 
        className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100"
      >
        <h4 className="text-center text-lg font-bold text-indigo-700 mb-4">{courseName} - 评价关键词</h4>
        
        {wordFrequencies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {wordFrequencies.map((word, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 flex flex-col items-center transition-all hover:shadow-md"
                style={{ 
                  transform: `scale(${0.85 + Math.min(word.value / 5, 0.5)})`,
                  zIndex: Math.floor(word.value)
                }}
              >
                <span className="text-center font-medium text-indigo-700" 
                      style={{ fontSize: `${Math.max(14, Math.min(24, 14 + word.value * 1.5))}px` }}>
                  {word.text}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  出现 {word.value} 次
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-indigo-500" />
            <span className="ml-3 text-indigo-500">分析中...</span>
          </div>
        )}
        
        <div className="mt-5 text-center text-sm text-gray-500">
          基于 {evaluations.length} 条学生评价 | 生成时间: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
} 