import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Clock, Users, FileText, CheckCircle, XCircle, 
  AlertTriangle, LogOut, Plus, UploadCloud, ChevronRight, 
  BarChart, Search, PlayCircle, Lock, Eye, FileUp
} from 'lucide-react';

// --- DATABASE GIẢ LẬP (MOCK DATA) - CÓ SẴN KÝ HIỆU TOÁN HỌC ---
const INITIAL_EXAMS = [
  {
    id: 'exam-1',
    title: 'Đề thi thử THPT Quốc Gia - Môn Toán',
    duration: 15, // minutes
    createdAt: new Date().toISOString(),
    questions: [
      { id: 'q1', text: 'Đạo hàm của hàm số $y = x^3$ là?', options: ['$y\' = 3x$', '$y\' = x^2$', '$y\' = 3x^2$', '$y\' = 3$'], correct: 2 },
      { id: 'q2', text: 'Tập nghiệm của phương trình $\\log_2(x) = 3$ là?', options: ['$x = 8$', '$x = 9$', '$x = 6$', '$x = 2^3$'], correct: 0 },
      { id: 'q3', text: 'Tính tích phân $I = \\int_{0}^{1} 2x dx$', options: ['$I = 1$', '$I = 2$', '$I = 0$', '$I = -1$'], correct: 0 },
    ]
  }
];

// Component hỗ trợ render Toán học (KaTeX)
const MathDisplay = ({ content, className = "" }) => {
  const createMarkup = () => {
    if (!window.katex || !content) return { __html: content || '' };
    let html = content;
    try {
      // Thay thế công thức toán học bằng KaTeX HTML
      html = html.replace(/\$\$(.*?)\$\$/g, (m, math) => window.katex.renderToString(math, {displayMode: true, throwOnError: false}))
                 .replace(/\$(.*?)\$/g, (m, math) => window.katex.renderToString(math, {displayMode: false, throwOnError: false}));
    } catch (e) {
      console.error("Lỗi render Toán học:", e);
    }
    return { __html: html };
  };
  return <div className={`whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={createMarkup()} />;
};

export default function AzotaMini() {
  // --- STATE QUẢN LÝ ---
  const [currentUser, setCurrentUser] = useState(null); 
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [submissions, setSubmissions] = useState([]);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  
  // Điều hướng View
  const [currentView, setCurrentView] = useState('login'); 
  const [activeExam, setActiveExam] = useState(null);
  const [examResult, setExamResult] = useState(null);

  // Load thư viện Toán học (KaTeX) và đọc file Word (Mammoth)
  useEffect(() => {
    const loadScripts = async () => {
      if (document.getElementById('katex-css')) return; // Tránh load lại

      const link = document.createElement('link');
      link.id = 'katex-css'; link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);

      const katexScript = document.createElement('script');
      katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      document.head.appendChild(katexScript);

      const mammothScript = document.createElement('script');
      mammothScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      document.head.appendChild(mammothScript);

      await Promise.all([
        new Promise(r => katexScript.onload = r),
        new Promise(r => mammothScript.onload = r)
      ]);
      setScriptsLoaded(true);
    };
    loadScripts();
  }, []);

  // --- COMPONENT ĐĂNG NHẬP ---
  const LoginView = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');

    const handleLogin = (e) => {
      e.preventDefault();
      if (!name.trim()) return alert('Vui lòng nhập tên!');
      setCurrentUser({ name, role });
      setCurrentView(role === 'admin' ? 'admin_dashboard' : 'student_dashboard');
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Azota Mini</h1>
            <p className="text-slate-500 mt-2">Hệ thống thi trắc nghiệm trực tuyến</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên của bạn</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${role === 'student' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Users size={24} className="mb-2" />
                <span className="font-medium">Học sinh</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-3 px-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${role === 'admin' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Lock size={24} className="mb-2" />
                <span className="font-medium">Giáo viên</span>
              </button>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-200">
              Vào hệ thống
            </button>
          </form>
        </div>
      </div>
    );
  };

  // --- COMPONENT ADMIN (TẠO ĐỀ & XEM ĐIỂM) ---
  const AdminDashboard = () => {
    const [tab, setTab] = useState('list'); 
    const [rawText, setRawText] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(45);
    const [parseError, setParseError] = useState('');
    const [isParsingDoc, setIsParsingDoc] = useState(false);

    // Xử lý upload file Word
    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsParsingDoc(true);
      try {
        if (file.name.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          setRawText(result.value);
          alert('Đã đọc nội dung từ file Word thành công! Vui lòng kiểm tra lại văn bản bên dưới.');
        } else if (file.name.endsWith('.txt')) {
          const text = await file.text();
          setRawText(text);
        } else {
          alert('Hệ thống hiện tại xử lý chính xác nhất file Word (.docx) và (.txt). Với PDF, vui lòng copy văn bản và dán trực tiếp vào ô bên dưới.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file: ' + err.message);
      } finally {
        setIsParsingDoc(false);
        e.target.value = ''; // reset input
      }
    };

    // Logic "AI Parse" thủ công bằng Regex
    const handleSmartParse = () => {
      try {
        setParseError('');
        if (!title.trim()) throw new Error('Vui lòng nhập tên đề thi');
        
        const questions = [];
        const blocks = rawText.split(/Câu\s+\d+[:\.\-]/i).filter(b => b.trim().length > 0);
        
        if (blocks.length === 0) throw new Error('Không tìm thấy câu hỏi nào. Đảm bảo cấu trúc có bắt đầu bằng "Câu 1:", "Câu 2:"');

        blocks.forEach((block, index) => {
          // Bóc tách A, B, C, D (Hỗ trợ dấu * trước đáp án như *A.)
          // Đã sửa lỗi Regex Unterminated group bằng cách bỏ group dư thừa và dùng (?=\*?\s*[A-D][\.\)])
          const parts = block.split(/(?=\*?\s*[A-D][\.\)])/);
          if (parts.length < 5) throw new Error(`Câu ${index + 1} không đủ 4 đáp án A, B, C, D`);
          
          const questionText = parts[0].trim();
          const options = [];
          let correctIndex = 0;

          for (let i = 1; i <= 4; i++) {
            let optText = parts[i].trim();
            let isCorrect = false;

            // Kiểm tra dấu * ở đầu (VD: *A. Đáp án)
            if (optText.startsWith('*')) {
              isCorrect = true;
              optText = optText.substring(1).trim();
            }

            // Xóa chữ A., B., C., D. ở đầu
            optText = optText.replace(/^[A-D][\.\)]\s*/, '');
            
            // Kiểm tra dấu * nếu nằm sau A. (VD: A. *Đáp án)
            if (optText.startsWith('*')) {
              isCorrect = true;
              optText = optText.substring(1).trim();
            }
            
            // Xóa phần "Đáp án" nếu nó dính vào đáp án D (hỗ trợ code cũ)
            if (i === 4 && optText.toLowerCase().includes('đáp án')) {
              const answerSplit = optText.split(/đáp\s*án\s*[:\.\-]?\s*/i);
              optText = answerSplit[0].trim();
              const ansChar = answerSplit[1]?.trim().charAt(0).toUpperCase();
              if (ansChar === 'A') correctIndex = 0;
              else if (ansChar === 'B') correctIndex = 1;
              else if (ansChar === 'C') correctIndex = 2;
              else if (ansChar === 'D') correctIndex = 3;
            }
            options.push(optText);

            if (isCorrect) correctIndex = i - 1;
          }

          // Rút trích đáp án nếu nó nằm riêng lẻ cuối block
          const matchAnswer = block.match(/đáp\s*án\s*[:\.\-]?\s*([A-D])/i);
          if (matchAnswer) {
             const ansChar = matchAnswer[1].toUpperCase();
             if (ansChar === 'A') correctIndex = 0;
             if (ansChar === 'B') correctIndex = 1;
             if (ansChar === 'C') correctIndex = 2;
             if (ansChar === 'D') correctIndex = 3;
          }

          questions.push({ id: `q_${Date.now()}_${index}`, text: questionText, options, correct: correctIndex });
        });

        const newExam = {
          id: `exam-${Date.now()}`,
          title,
          duration: parseInt(duration),
          createdAt: new Date().toISOString(),
          questions
        };

        setExams([newExam, ...exams]);
        setTab('list');
        alert(`Đã tạo thành công đề thi với ${questions.length} câu hỏi!`);
        setRawText('');
        setTitle('');
        
      } catch (err) {
        setParseError(err.message);
      }
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            <span className="font-bold text-xl text-slate-800">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Giáo viên: {currentUser.name}</span>
            <button onClick={() => setCurrentView('login')} className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium">
              <LogOut size={16} /> Thoát
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-4 mb-8">
            <button onClick={() => setTab('list')} className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${tab === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
              <FileText size={20} /> Quản lý Đề thi
            </button>
            <button onClick={() => setTab('create')} className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${tab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
              <UploadCloud size={20} /> Smart Upload (Parse text)
            </button>
          </div>

          {tab === 'list' && (
            <div className="space-y-6">
              {exams.map(exam => {
                const examSubmissions = submissions.filter(s => s.examId === exam.id);
                return (
                  <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={16}/> {exam.duration} phút</span>
                          <span className="flex items-center gap-1"><FileText size={16}/> {exam.questions.length} câu hỏi</span>
                          <span className="flex items-center gap-1"><Users size={16}/> {examSubmissions.length} lượt nộp</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><BarChart size={18}/> Kết quả thi</h4>
                      {examSubmissions.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Chưa có học sinh nào làm bài.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                              <tr>
                                <th className="px-4 py-2 rounded-tl-md">Học sinh</th>
                                <th className="px-4 py-2">Điểm số</th>
                                <th className="px-4 py-2">Thời gian làm</th>
                                <th className="px-4 py-2 rounded-tr-md">Cảnh báo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {examSubmissions.map(sub => (
                                <tr key={sub.id} className="border-b last:border-0 bg-white">
                                  <td className="px-4 py-3 font-medium text-slate-800">{sub.studentName}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${sub.score >= 8 ? 'bg-green-100 text-green-700' : sub.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {sub.score.toFixed(2)} / 10
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">{Math.floor(sub.timeTaken / 60)}p {sub.timeTaken % 60}s</td>
                                  <td className="px-4 py-3">
                                    {sub.cheatWarnings > 0 ? (
                                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><AlertTriangle size={14}/> {sub.cheatWarnings} lần rời tab</span>
                                    ) : (
                                      <span className="text-green-600 text-xs font-medium flex items-center gap-1"><CheckCircle size={14}/> An toàn</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'create' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><UploadCloud className="text-indigo-600"/> Smart Parse - Tải đề tự động</h2>
                <p className="text-slate-500 mt-1">Hỗ trợ nhận diện các file Word chứa đề thi hoặc dán nội dung trực tiếp.</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên đề thi</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Đề thi THPTQG..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian làm bài (Phút)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              {/* Nút Upload File Word */}
              <div className="mb-6">
                <label className="bg-indigo-50 border-2 border-dashed border-indigo-300 hover:bg-indigo-100 transition-colors w-full p-8 rounded-xl flex flex-col items-center justify-center cursor-pointer text-indigo-600">
                  <FileUp size={36} className="mb-2"/>
                  <span className="font-bold text-lg">Tải lên file đề thi (.docx, .txt)</span>
                  <span className="text-sm text-indigo-400 mt-1">Hệ thống sẽ tự động bóc tách chữ từ file Word</span>
                  <input type="file" accept=".docx,.txt,.pdf" className="hidden" onChange={handleFileUpload} />
                </label>
                {isParsingDoc && <div className="text-sm text-indigo-600 mt-2 text-center animate-pulse">Đang xử lý file Word, vui lòng đợi...</div>}
              </div>

              <div className="mb-6">
                <label className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-700">Nội dung đề (Xem trước & Chỉnh sửa)</span>
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">Cấu trúc: Câu 1: ... *A. ... B. ... C. ... D. ...</span>
                </label>
                <textarea 
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full h-80 px-4 py-3 rounded-lg border font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Hoặc dán thủ công:&#10;Câu 1: $y = x^2$ đạo hàm là gì?&#10;A. 2x&#10;B. x&#10;*C. 1&#10;D. 0"
                ></textarea>
                {parseError && <div className="mt-2 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded"><AlertTriangle size={16}/> {parseError}</div>}
              </div>

              <div className="flex justify-end">
                <button onClick={handleSmartParse} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2">
                  Phân tích & Tạo bài thi <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- COMPONENT HỌC SINH (CHỌN ĐỀ & THI) ---
  const StudentDashboard = () => {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            <span className="font-bold text-xl text-slate-800">Cổng Thi Trực Tuyến</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">{currentUser.name.charAt(0)}</div>
              <span className="text-sm font-bold text-indigo-900">{currentUser.name}</span>
            </div>
            <button onClick={() => setCurrentView('login')} className="text-slate-500 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><PlayCircle className="text-indigo-600"/> Đề thi đang mở</h2>
          
          <div className="grid gap-6">
            {exams.map(exam => {
              const hasDone = submissions.find(s => s.examId === exam.id && s.studentName === currentUser.name);
              
              return (
                <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={14}/> {exam.duration} phút</span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><FileText size={14}/> {exam.questions.length} câu trắc nghiệm</span>
                    </div>
                  </div>
                  
                  {hasDone ? (
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-sm text-slate-500">Điểm của bạn</div>
                      <div className="text-2xl font-bold text-indigo-600">{hasDone.score.toFixed(2)}đ</div>
                      <button 
                        onClick={() => { setActiveExam(exam); setExamResult(hasDone); setCurrentView('result'); }}
                        className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Eye size={14} /> Xem chi tiết
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setActiveExam(exam); setCurrentView('exam_room'); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      Bắt đầu làm bài
                    </button>
                  )}
                </div>
              );
            })}
            
            {exams.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                Chưa có đề thi nào được tạo.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- COMPONENT PHÒNG THI (EXAM ROOM) ---
  const ExamRoom = () => {
    const [timeLeft, setTimeLeft] = useState(activeExam.duration * 60);
    const [answers, setAnswers] = useState({}); 
    const [cheatCount, setCheatCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setCheatCount(prev => prev + 1);
          alert('CẢNH BÁO GIAN LẬN: Bạn vừa rời khỏi màn hình làm bài! Hệ thống đã ghi nhận.');
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
      if (timeLeft <= 0) {
        handleSubmit();
        return;
      }
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
    };

    const handleSelectOption = (qId, optIdx) => {
      setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    };

    const handleSubmit = () => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      let correctCount = 0;
      activeExam.questions.forEach(q => {
        if (answers[q.id] === q.correct) correctCount++;
      });
      
      const score = (correctCount / activeExam.questions.length) * 10;
      const timeTaken = (activeExam.duration * 60) - timeLeft;

      const result = {
        id: `sub_${Date.now()}`,
        studentName: currentUser.name,
        examId: activeExam.id,
        score,
        correctCount,
        totalQuestions: activeExam.questions.length,
        answers,
        timeTaken,
        cheatWarnings: cheatCount
      };

      setSubmissions(prev => [result, ...prev]);
      setExamResult(result);
      setCurrentView('result');
    };

    if (!scriptsLoaded) return <div className="min-h-screen flex items-center justify-center">Đang tải thư viện Toán học...</div>;

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div>
            <h1 className="font-bold text-lg text-slate-800">{activeExam.title}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">Thí sinh: <strong className="text-slate-700">{currentUser.name}</strong></p>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
              <Clock size={20}/>
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors"
            >
              Nộp Bài
            </button>
          </div>
        </header>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <CheckCircle size={28} />
                <h3 className="text-xl font-bold text-slate-800">Xác nhận nộp bài</h3>
              </div>
              <p className="text-slate-600 mb-6">Bạn vẫn còn thời gian. Bạn có chắc chắn muốn hoàn thành bài thi và nộp ngay bây giờ?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">Tiếp tục làm</button>
                <button onClick={() => { setShowConfirmModal(false); handleSubmit(); }} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors">Nộp ngay</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 gap-6 relative">
          <div className="flex-1 space-y-6 pb-20">
            {activeExam.questions.map((q, index) => (
              <div key={q.id} id={`question-${index}`} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 scroll-mt-24">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  {/* Dùng component MathDisplay để render LaTeX */}
                  <MathDisplay content={q.text} className="flex-1 text-lg text-slate-800 pt-1 font-medium" />
                </div>
                <div className="mt-6 ml-14 space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <label 
                        key={optIdx} 
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                      >
                        <input 
                          type="radio" 
                          name={`q-${q.id}`} 
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, optIdx)}
                          className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex items-center text-slate-800">
                          <span className="font-bold mr-2">{letters[optIdx]}.</span>
                          <MathDisplay content={opt} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
              <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Bảng câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  return (
                    <button
                      key={q.id}
                      onClick={() => document.getElementById(`question-${index}`).scrollIntoView({ behavior: 'smooth' })}
                      className={`w-10 h-10 rounded text-sm font-bold flex items-center justify-center transition-colors ${isAnswered ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- COMPONENT KẾT QUẢ & XEM CHI TIẾT BÀI LÀM ---
  const ResultView = () => {
    const [showDetail, setShowDetail] = useState(false);

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
        
        {/* Bảng điểm tổng quan */}
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center relative">
          <button 
            onClick={() => { setActiveExam(null); setExamResult(null); setCurrentView('student_dashboard'); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <XCircle size={24} />
          </button>
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Kết quả bài làm</h2>
          <p className="text-slate-500 mb-8 font-medium">{activeExam.title}</p>
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
            <div className={`text-6xl font-black mb-2 ${examResult.score >= 8 ? 'text-green-600' : examResult.score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {examResult.score.toFixed(2)}
            </div>
            <p className="text-slate-500 text-sm">Điểm số (Thang 10)</p>
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="text-slate-500 mb-1">Số câu đúng</div>
                <div className="font-bold text-lg text-slate-700">{examResult.correctCount} / {examResult.totalQuestions}</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="text-slate-500 mb-1">Thời gian làm</div>
                <div className="font-bold text-lg text-slate-700">{Math.floor(examResult.timeTaken / 60)}p {examResult.timeTaken % 60}s</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { setActiveExam(null); setExamResult(null); setCurrentView('student_dashboard'); }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-bold transition-colors"
            >
              Trở về
            </button>
            <button 
              onClick={() => setShowDetail(!showDetail)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              {showDetail ? 'Ẩn chi tiết' : <><Eye size={20}/> Xem chi tiết</>}
            </button>
          </div>
        </div>

        {/* Phần xem chi tiết câu đúng sai */}
        {showDetail && (
          <div className="max-w-4xl w-full mt-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 pb-2 border-b">Chi tiết đáp án:</h3>
            {activeExam.questions.map((q, index) => {
              const studentAnsIdx = examResult.answers[q.id];
              const isCorrect = studentAnsIdx === q.correct;
              const hasAnswered = studentAnsIdx !== undefined;

              return (
                <div key={q.id} className={`p-6 rounded-xl border-2 shadow-sm ${!hasAnswered ? 'border-yellow-300 bg-yellow-50' : isCorrect ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}`}>
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 text-white font-bold rounded-full flex items-center justify-center ${!hasAnswered ? 'bg-yellow-500' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <MathDisplay content={q.text} className="text-lg text-slate-800 pt-1 font-medium mb-4" />
                      {!hasAnswered && <span className="inline-block mb-3 px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded">Bỏ trống</span>}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const letters = ['A', 'B', 'C', 'D'];
                          const isStudentChoice = studentAnsIdx === optIdx;
                          const isTrueAnswer = q.correct === optIdx;
                          
                          let bgClass = "bg-white border-slate-200 text-slate-600";
                          if (isTrueAnswer) bgClass = "bg-green-100 border-green-500 text-green-800 font-bold shadow-sm"; // Đáp án thật sự đúng
                          else if (isStudentChoice && !isTrueAnswer) bgClass = "bg-red-100 border-red-500 text-red-800 line-through opacity-80"; // Học sinh chọn sai

                          return (
                            <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass}`}>
                              <span className="font-bold">{letters[optIdx]}.</span>
                              <MathDisplay content={opt} />
                              {isTrueAnswer && <CheckCircle size={18} className="text-green-600 ml-auto"/>}
                              {isStudentChoice && !isTrueAnswer && <XCircle size={18} className="text-red-600 ml-auto"/>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  };

  // --- MAIN RENDERER ---
  if (currentView === 'login') return <LoginView />;
  if (currentView === 'admin_dashboard') return <AdminDashboard />;
  if (currentView === 'student_dashboard') return <StudentDashboard />;
  if (currentView === 'exam_room') return <ExamRoom />;
  if (currentView === 'result') return <ResultView />;

  return null;
}