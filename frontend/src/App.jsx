import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Visualizer from './pages/Visualizer';
import DsaHub from './pages/DsaHub';
import QuizArena from './pages/QuizArena';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import PlaygroundPage from './pages/PlaygroundPage';
import AiTutorPage from './pages/AiTutorPage';
import LoginModal from './components/LoginModal';
import CodeDoctorModal from './components/CodeDoctorModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainAppContent() {
  const { user } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const currentTab = location.pathname === '/' ? 'dashboard' : location.pathname.slice(1);

  const handleLaunchConcept = (concept) => {
    setSelectedConcept(concept);
    navigate('/visualizer');
  };

  const handleApplyDoctorCode = ({ code, language, trace, problemTitle, timeComplexity, spaceComplexity }) => {
    setSelectedConcept({
      id: 'personal-problem',
      title: problemTitle ? `💡 ${problemTitle}` : `💡 Personal Problem (${(language || 'java').toUpperCase()})`,
      category: 'Personal Problem',
      description: 'Custom personal problem solved and fully simulated in 3D WebGL.',
      difficulty: 'Custom',
      timeComplexity: timeComplexity || 'O(n)',
      spaceComplexity: spaceComplexity || 'O(1)',
      code,
      language: language || 'java',
      trace: trace || null,
    });
    navigate('/visualizer');
  };

  const handleRerunFromHistory = (record) => {
    setSelectedConcept({
      id: record.conceptId || 'history-run',
      title: record.programTitle,
      category: 'History Replay',
      description: `Recorded execution on ${record.executedAt}. Restored into 3D Studio.`,
      code: record.code || '',
      language: record.language || 'java',
    });
    navigate('/visualizer');
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Top Application Navbar */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={(id) => navigate(id === 'dashboard' ? '/' : `/${id}`)}
        onOpenCodeDoctor={() => setIsDoctorOpen(true)}
        onOpenPersonalProblem={() => setIsDoctorOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />} />
          <Route path="/visualizer" element={<Visualizer initialConcept={selectedConcept} />} />
          <Route path="/playground" element={<PlaygroundPage onSendToVisualizer={handleLaunchConcept} />} />
          <Route path="/ai" element={<AiTutorPage onSendToVisualizer={handleLaunchConcept} />} />
          <Route path="/dsa" element={<DsaHub initialTab="curriculum" onSelectConcept={handleLaunchConcept} />} />
          <Route path="/striver" element={<DsaHub initialTab="striver" onSelectConcept={handleLaunchConcept} />} />
          <Route path="/quiz" element={<QuizArena />} />
          <Route path="/history" element={<HistoryPage onRerunProgram={handleRerunFromHistory} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-14 backdrop-blur-xl border-t px-2 flex items-center justify-around z-40 select-none transition-colors ${
        isBright
          ? 'bg-white/95 border-slate-200 shadow-lg text-slate-700'
          : 'bg-slate-950/95 border-slate-800/80 text-slate-400'
      }`}>
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[9px] font-medium">Home</span>
        </button>

        <button
          onClick={() => navigate('/visualizer')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/visualizer'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🧊</span>
          <span className="text-[9px] font-medium">3D Code</span>
        </button>

        <button
          onClick={() => navigate('/playground')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/playground'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span className="text-[9px] font-medium">Playground</span>
        </button>

        <button
          onClick={() => navigate('/ai')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/ai'
              ? 'text-purple-600 font-bold dark:text-purple-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🤖</span>
          <span className="text-[9px] font-medium">AI Tutor</span>
        </button>

        <button
          onClick={() => navigate('/dsa')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/dsa' || location.pathname === '/striver'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">📚</span>
          <span className="text-[9px] font-medium">DSA Hub</span>
        </button>

        <button
          onClick={() => setIsDoctorOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            isBright ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span className="text-lg">💡</span>
          <span className="text-[9px] font-medium">Personal</span>
        </button>
      </nav>

      {/* Global Modals */}
      <LoginModal />
      <CodeDoctorModal
        isOpen={isDoctorOpen}
        onClose={() => setIsDoctorOpen(false)}
        onApplyCorrectedCode={handleApplyDoctorCode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <MainAppContent />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
