import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Visualizer from './pages/Visualizer';
import DsaHub from './pages/DsaHub';
import QuizArena from './pages/QuizArena';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginModal from './components/LoginModal';
import CodeDoctorModal from './components/CodeDoctorModal';
import AuthGate from './components/AuthGate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
  const { user } = useAuth();
  const { isBright } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const handleLaunchConcept = (concept) => {
    setSelectedConcept(concept);
    setActiveTab('visualizer');
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
    setActiveTab('visualizer');
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
    setActiveTab('visualizer');
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>

      {/* Top Application Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCodeDoctor={() => setIsDoctorOpen(true)}
        onOpenPersonalProblem={() => setIsDoctorOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        {activeTab === 'dashboard' && (
          <Dashboard onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'visualizer' && (
          <Visualizer initialConcept={selectedConcept} />
        )}
        {activeTab === 'dsa' && (
          <DsaHub initialTab="curriculum" onSelectConcept={handleLaunchConcept} />
        )}
        {activeTab === 'striver' && (
          <DsaHub initialTab="striver" onSelectConcept={handleLaunchConcept} />
        )}
        {activeTab === 'quiz' && (
          <QuizArena />
        )}
        {activeTab === 'history' && (
          <HistoryPage onRerunProgram={handleRerunFromHistory} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-14 backdrop-blur-xl border-t px-2 flex items-center justify-around z-40 select-none transition-colors ${
        isBright
          ? 'bg-white/95 border-slate-200 shadow-lg text-slate-700'
          : 'bg-slate-950/95 border-slate-800/80 text-slate-400'
      }`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition ${
            activeTab === 'dashboard'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[9px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition ${
            activeTab === 'visualizer'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🧊</span>
          <span className="text-[9px] font-medium">3D Code</span>
        </button>

        <button
          onClick={() => setActiveTab('dsa')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition ${
            activeTab === 'dsa'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">📚</span>
          <span className="text-[9px] font-medium">DSA Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition ${
            activeTab === 'quiz'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🏆</span>
          <span className="text-[9px] font-medium">Quiz</span>
        </button>

        <button
          onClick={() => setIsDoctorOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition ${
            isBright ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span className="text-lg">💡</span>
          <span className="text-[9px] font-medium">Personal Problem</span>
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
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

