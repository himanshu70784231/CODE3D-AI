import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Home, Play, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isBright } = useTheme();

  return (
    <div className={`flex-1 flex items-center justify-center p-6 select-none transition-colors duration-200 ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10 mx-auto">
            <Box size={40} className="stroke-[2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-mono font-bold text-xs shadow-md">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight font-sans">
            Memory Address Not Found
          </h1>
          <p className={`text-xs leading-relaxed ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
            The memory address or route you requested does not exist in Code3D AI space. It may have been deallocated or moved to a new namespace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 active:translate-y-px"
          >
            <Home size={14} />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate('/visualizer')}
            className={`w-full sm:w-auto border font-semibold px-5 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer active:translate-y-px ${
              isBright
                ? 'bg-white border-[#e2dfd8] hover:bg-[#edebe5] text-stone-800'
                : 'bg-[#181c23] border-[#252932] hover:bg-[#222731] text-stone-200'
            }`}
          >
            <Play size={13} className="text-amber-500" />
            <span>Launch Visualizer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
