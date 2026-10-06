import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedList, deleteSaved } from '../services/saved.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bookmark, Play, Trash2, Calendar, Plus, Sparkles } from 'lucide-react';

export default function SavedVisualizationsPage({ onReplay }) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSaved = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSavedList();
      if (res?.success) {
        setSavedItems(res.saved || res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch saved items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved visualization?')) return;
    try {
      await deleteSaved(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete saved visualization.');
    }
  };

  const handleLaunch = (item) => {
    if (onReplay) {
      onReplay({
        id: item.id,
        title: item.title,
        language: item.language,
        code: item.code,
        category: 'Saved Visualization',
        description: `Saved user simulation for ${item.algorithm}`,
        defaultInput: item.input,
      });
    } else {
      navigate('/visualizer');
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border bg-amber-500/10 border-amber-500/30 text-amber-500">
              <Bookmark size={13} />
              <span>Workspace Library</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Saved Visualizations
            </h1>
            <p className={`text-xs ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
              Access your personal collection of custom code snippets and 3D simulation configurations.
            </p>
          </div>

          <button
            onClick={() => navigate('/visualizer')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 cursor-pointer self-start sm:self-auto active:translate-y-px"
          >
            <Plus size={14} />
            <span>New Visualization</span>
          </button>
        </div>

        {/* Not Logged In Notice */}
        {!isAuthenticated && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isBright ? 'bg-amber-50/50 border-amber-200 text-stone-900' : 'bg-[#181c23] border-[#252932] text-stone-200'
          }`}>
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-amber-500 shrink-0" />
              <span>Sign in to sync your saved programs to the cloud database.</span>
            </div>
            <button
              onClick={openLoginModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-12 text-stone-400 text-xs font-mono">
            Loading saved visualizations...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && savedItems.length === 0 && (
          <div className={`p-12 rounded-xl border text-center space-y-3 ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
          }`}>
            <Sparkles size={32} className="mx-auto text-amber-500 opacity-60" />
            <h3 className="text-base font-bold">No saved visualizations yet</h3>
            <p className={`text-xs max-w-md mx-auto ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              Click "Save" inside the Visualizer while inspecting any custom code to add it here.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {savedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition group ${
                  isBright
                    ? 'bg-white border-[#e2dfd8] hover:border-amber-400 shadow-2xs'
                    : 'bg-[#13161b] border-[#252932] hover:border-amber-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25">
                      {item.language}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold mb-1.5 group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h3>

                  <p className={`text-xs font-mono line-clamp-3 mb-4 p-2 rounded ${
                    isBright ? 'bg-stone-50 text-stone-700' : 'bg-[#0e1013] text-stone-300'
                  }`}>
                    {item.code.slice(0, 120)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-inherit">
                  <button
                    onClick={() => handleLaunch(item)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 transition cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Launch 3D</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer border border-transparent hover:border-rose-500/30"
                    title="Delete saved item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
