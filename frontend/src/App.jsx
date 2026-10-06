import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Website3D from './pages/Website3D';
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
      <div
        className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
          isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
        }`}
      >
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-xl border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
          <div className="absolute w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
            3D
          </div>
        </div>
        <p className="text-xs font-mono text-orange-500 font-medium tracking-wider animate-pulse">
          SYNCHRONIZING ENVIRONMENT...
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

  const currentTab =
    location.pathname === '/' || location.pathname === '/app' || location.pathname === '/dashboard'
      ? 'home'
      : location.pathname.slice(1);

  const handleLaunchConcept = (concept) => {
    setSelectedConcept(concept);
    navigate('/visualizer');
  };

  const handleApplyDoctorCode = ({
    code,
    language,
    trace,
    problemTitle,
    timeComplexity,
    spaceComplexity,
  }) => {
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
    <div
      className={`flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-200 ${
        isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}
    >
      {/* Top Application Navbar */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={(id) => navigate(id === 'home' || id === 'dashboard' ? '/app' : `/${id}`)}
        onOpenCodeDoctor={() => setIsDoctorOpen(true)}
        onOpenPersonalProblem={() => setIsDoctorOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        <Routes>
          {/* Core App Routes — /app is canonical workspace dashboard */}
          <Route
            path="/"
            element={
              <Dashboard
                onNavigate={(tab) => navigate(tab === 'dashboard' || tab === 'home' ? '/app' : `/${tab}`)}
                onLaunchConcept={handleLaunchConcept}
              />
            }
          />
          <Route
            path="/app"
            element={
              <Dashboard
                onNavigate={(tab) => navigate(tab === 'dashboard' || tab === 'home' ? '/app' : `/${tab}`)}
                onLaunchConcept={handleLaunchConcept}
              />
            }
          />
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/home" element={<Navigate to="/app" replace />} />

          {/* 3D Code Editor & Visualizer Studio */}
          <Route
            path="/editor"
            element={<Visualizer initialConcept={selectedConcept} key="code-editor" />}
          />
          <Route
            path="/workspace"
            element={<Visualizer initialConcept={selectedConcept} key="workspace" />}
          />
          <Route
            path="/visualizer"
            element={<Visualizer initialConcept={selectedConcept} key="visualizer" />}
          />
          <Route
            path="/visualize"
            element={<Visualizer initialConcept={selectedConcept} key="visualize" />}
          />

          {/* 3D Landing Showcase */}
          <Route
            path="/showcase"
            element={<Website3D onLaunchConcept={handleLaunchConcept} />}
          />
          <Route
            path="/landing"
            element={<Website3D onLaunchConcept={handleLaunchConcept} />}
          />

          {/* DSA Curriculum & Problems */}
          <Route
            path="/dsa"
            element={<DsaHub initialTab="curriculum" onSelectConcept={handleLaunchConcept} />}
          />
          <Route
            path="/algorithms"
            element={<DsaHub initialTab="algorithms" onSelectConcept={handleLaunchConcept} />}
          />
          <Route
            path="/dsa/:problemSlug"
            element={<DsaProblemPage onVisualizeProblem={handleLaunchConcept} />}
          />
          <Route
            path="/sheets"
            element={<SheetsPage onSelectProblem={handleLaunchConcept} />}
          />
          <Route
            path="/sheets/:sheetSlug"
            element={<SheetsPage onSelectProblem={handleLaunchConcept} />}
          />
          <Route
            path="/striver"
            element={<DsaHub initialTab="striver" onSelectConcept={handleLaunchConcept} />}
          />

          {/* AI Algorithmic Tutor */}
          <Route
            path="/ai"
            element={<AiTutorPage onSendToVisualizer={handleLaunchConcept} />}
          />

          {/* Quiz Arena */}
          <Route path="/quiz" element={<QuizArena />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Protected Routes */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedVisualizationsPage onReplay={handleLaunchConcept} />
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

          {/* Any other unknown route seamlessly defaults to /app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 h-14 backdrop-blur-xl border-t px-2 flex items-center justify-around z-40 select-none transition-colors ${
          isBright
            ? 'bg-white/95 border-slate-200 shadow-lg text-slate-700'
            : 'bg-slate-950/95 border-slate-800/80 text-slate-400'
        }`}
      >
        <button
          onClick={() => navigate('/app')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/' || location.pathname === '/app' || location.pathname === '/dashboard'
              ? 'text-orange-500 font-bold'
              : isBright
              ? 'text-stone-500 hover:text-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span className="text-base">🏠</span>
          <span className="text-[9px] font-medium">Home</span>
        </button>

        <button
          onClick={() => navigate('/editor')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/editor'
              ? 'text-orange-500 font-bold'
              : isBright
              ? 'text-stone-500 hover:text-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span className="text-base">⚡</span>
          <span className="text-[9px] font-medium">Editor</span>
        </button>

        <button
          onClick={() => navigate('/visualizer')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/visualizer' || location.pathname === '/workspace'
              ? 'text-orange-500 font-bold'
              : isBright
              ? 'text-stone-500 hover:text-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span className="text-base">🧊</span>
          <span className="text-[9px] font-medium">3D Code</span>
        </button>

        <button
          onClick={() => navigate('/dsa')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/dsa' || location.pathname === '/striver'
              ? 'text-orange-500 font-bold'
              : isBright
              ? 'text-stone-500 hover:text-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span className="text-base">📚</span>
          <span className="text-[9px] font-medium">DSA Hub</span>
        </button>

        <button
          onClick={() => navigate('/ai')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            location.pathname === '/ai'
              ? 'text-orange-500 font-bold'
              : isBright
              ? 'text-stone-500 hover:text-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <span className="text-base">🤖</span>
          <span className="text-[9px] font-medium">AI Tutor</span>
        </button>

        <button
          onClick={() => setIsDoctorOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
            isBright ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span className="text-base">💡</span>
          <span className="text-[9px] font-medium">Doctor</span>
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
