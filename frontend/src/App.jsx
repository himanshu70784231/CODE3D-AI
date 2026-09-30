import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Visualizer from './pages/Visualizer';
import DsaHub from './pages/DsaHub';
import QuizArena from './pages/QuizArena';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AiTutorPage from './pages/AiTutorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SheetsPage from './pages/SheetsPage';
import DsaProblemPage from './pages/DsaProblemPage';
import SavedVisualizationsPage from './pages/SavedVisualizationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/LoginModal';
import CodeDoctorModal from './components/CodeDoctorModal';
import { AppErrorBoundary } from './components/ErrorBoundaries';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

function MainAppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  // Loading Session Guard
  if (loading) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
        isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}>
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30">
            3D
          </div>
        </div>
        <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wider animate-pulse">
          VERIFYING SESSION ENCRYPTION...
        </p>
      </div>
    );
  }

  // Public Standalone Auth Routes: Render dedicated, distraction-free screens
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/signup';

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

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
      {/* Top Application Navbar — visible to authenticated users in workspace */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={(id) => navigate(id === 'dashboard' ? '/' : `/${id}`)}
        onOpenCodeDoctor={() => setIsDoctorOpen(true)}
        onOpenPersonalProblem={() => setIsDoctorOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        <Routes>
          {/* Root Route: If authenticated go to dashboard, else redirect to login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <Visualizer initialConcept={selectedConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Dashboard onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualizer"
            element={
              <ProtectedRoute>
                <Visualizer initialConcept={selectedConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualize"
            element={
              <ProtectedRoute>
                <Visualizer initialConcept={selectedConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/algorithms"
            element={
              <ProtectedRoute>
                <DsaHub initialTab="algorithms" onSelectConcept={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AiTutorPage onSendToVisualizer={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa"
            element={
              <ProtectedRoute>
                <DsaHub initialTab="curriculum" onSelectConcept={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa/:problemSlug"
            element={
              <ProtectedRoute>
                <DsaProblemPage onVisualizeProblem={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheets"
            element={
              <ProtectedRoute>
                <SheetsPage onSelectProblem={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheets/:sheetSlug"
            element={
              <ProtectedRoute>
                <SheetsPage onSelectProblem={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/striver"
            element={
              <ProtectedRoute>
                <DsaHub initialTab="striver" onSelectConcept={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedVisualizationsPage onReplay={handleLaunchConcept} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizArena />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage onRerunProgram={handleRerunFromHistory} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Unknown routes show 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar for authenticated workspace */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-14 backdrop-blur-xl border-t px-2 flex items-center justify-around z-40 select-none transition-colors ${
        isBright
          ? 'bg-white/95 border-slate-200 shadow-lg text-slate-700'
          : 'bg-slate-950/95 border-slate-800/80 text-slate-400'
      }`}>
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/' || location.pathname === '/dashboard'
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
            location.pathname === '/visualizer' || location.pathname === '/workspace'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🧊</span>
          <span className="text-[9px] font-medium">3D Code</span>
        </button>

        <button
          onClick={() => navigate('/quiz')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/quiz'
              ? 'text-cyan-600 font-bold dark:text-cyan-400'
              : isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🎯</span>
          <span className="text-[9px] font-medium">Quiz</span>
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
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <HashRouter>
            <MainAppContent />
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
