import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Home, Play, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isBright } = useTheme();

  return (
    <div className={`flex-1 flex items-center justify-center p-6 select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-cyan-500/30 mx-auto">
            <Box size={48} className="stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-xs shadow-md">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">
            Page Not Found
          </h1>
          <p className={`text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            The memory address you requested does not exist in CODE3D-AI space. It may have been moved or garbage-collected.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Home size={15} />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate('/visualizer')}
            className={`w-full sm:w-auto border font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              isBright
                ? 'border-slate-300 hover:bg-slate-100 text-slate-800'
                : 'border-slate-700 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Play size={14} className="text-cyan-400" />
            <span>Launch Visualizer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
