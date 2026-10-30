import React, { createContext, useContext, useState, useEffect } from 'react';

export const ACCENT_PALETTES = {
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    icon: '⚡',
    dark: '#f59e0b',
    bright: '#d97706',
    glow: 'rgba(245, 158, 11, 0.25)',
    subtleDark: 'rgba(245, 158, 11, 0.12)',
    subtleBright: 'rgba(217, 119, 6, 0.10)',
    gradient: 'from-amber-500 via-amber-600 to-stone-700',
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    icon: '💎',
    dark: '#06b6d4',
    bright: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.25)',
    subtleDark: 'rgba(6, 182, 212, 0.12)',
    subtleBright: 'rgba(8, 145, 178, 0.10)',
    gradient: 'from-cyan-500 via-blue-600 to-slate-800',
  },
  emerald: {
    id: 'emerald',
    name: 'Sage Emerald',
    icon: '🌿',
    dark: '#10b981',
    bright: '#059669',
    glow: 'rgba(16, 185, 129, 0.25)',
    subtleDark: 'rgba(16, 185, 129, 0.12)',
    subtleBright: 'rgba(5, 150, 105, 0.10)',
    gradient: 'from-emerald-500 via-teal-600 to-stone-700',
  },
  violet: {
    id: 'violet',
    name: 'Neon Violet',
    icon: '🔮',
    dark: '#8b5cf6',
    bright: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.25)',
    subtleDark: 'rgba(139, 92, 246, 0.12)',
    subtleBright: 'rgba(124, 58, 237, 0.10)',
    gradient: 'from-violet-500 via-purple-600 to-slate-800',
  },
  copper: {
    id: 'copper',
    name: 'Warm Copper',
    icon: '🔥',
    dark: '#f97316',
    bright: '#ea580c',
    glow: 'rgba(249, 115, 22, 0.25)',
    subtleDark: 'rgba(249, 115, 22, 0.12)',
    subtleBright: 'rgba(234, 88, 12, 0.10)',
    gradient: 'from-orange-500 via-amber-600 to-stone-700',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Technical Slate',
    icon: '⚙️',
    dark: '#e4e4e7',
    bright: '#27272a',
    glow: 'rgba(228, 228, 231, 0.15)',
    subtleDark: 'rgba(228, 228, 231, 0.08)',
    subtleBright: 'rgba(39, 39, 42, 0.08)',
    gradient: 'from-stone-400 via-zinc-500 to-stone-700',
  },
};

export const TEMPLATE_STYLES = {
  bento: {
    id: 'bento',
    name: 'Bento Studio 3D',
    icon: '🍱',
    badge: 'Pro 2026',
    description: 'Modern asymmetric bento grid with floating glass widgets and quantum 3D core.',
  },
  glass: {
    id: 'glass',
    name: 'Neo Glassmorphism',
    icon: '✨',
    badge: 'Ultra Vibrant',
    description: 'Multi-layer frosted glass cards with ambient specular lighting and sleek blur.',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk HUD',
    icon: '⚡',
    badge: 'Terminal HUD',
    description: 'High-contrast spatial telemetry with monospace coordinates and neon scanner grids.',
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Minimalist',
    icon: '❄️',
    badge: 'Clean Ceramic',
    description: 'Crisp Swiss typography with calm generous spacing and subtle laser highlights.',
  },
};

const DEFAULT_ACCENT = ACCENT_PALETTES.cyan;
const DEFAULT_TEMPLATE = TEMPLATE_STYLES.bento;

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_theme');
      if (saved === 'bright' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentColor, setAccentColor] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_accent');
      if (saved && ACCENT_PALETTES[saved]) return saved;
      return 'cyan';
    } catch {
      return 'cyan';
    }
  });

  const [templateStyle, setTemplateStyle] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_template');
      if (saved && TEMPLATE_STYLES[saved]) return saved;
      return 'bento';
    } catch {
      return 'bento';
    }
  });

  const isBright = theme === 'bright';
  const currentAccent = ACCENT_PALETTES[accentColor] || DEFAULT_ACCENT;
  const currentTemplate = TEMPLATE_STYLES[templateStyle] || DEFAULT_TEMPLATE;

  useEffect(() => {
    try {
      localStorage.setItem('code3d_theme', theme);
      localStorage.setItem('code3d_accent', accentColor);
      localStorage.setItem('code3d_template', templateStyle);
    } catch (e) {
      console.warn('Unable to persist theme settings to localStorage', e);
    }

    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accentColor);
    root.setAttribute('data-template', templateStyle);

    // Dynamic CSS Accent Tokens
    const activeColor = isBright ? currentAccent.bright : currentAccent.dark;
    const subtleColor = isBright ? currentAccent.subtleBright : currentAccent.subtleDark;

    root.style.setProperty('--color-primary', activeColor);
    root.style.setProperty('--color-accent', activeColor);
    root.style.setProperty('--color-accent-glow', currentAccent.glow || 'rgba(6, 182, 212, 0.25)');
    root.style.setProperty('--color-accent-subtle', subtleColor || 'rgba(6, 182, 212, 0.12)');

    if (theme === 'bright') {
      root.classList.remove('dark');
      root.classList.add('bright');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('bright');
        body.style.backgroundColor = '#f8fafc';
        body.style.color = '#0f172a';
      }
    } else {
      root.classList.remove('bright');
      root.classList.add('dark');
      if (body) {
        body.classList.remove('bright');
        body.classList.add('dark');
        body.style.backgroundColor = '#070b14';
        body.style.color = '#f8fafc';
      }
    }

    // Broadcast style changes to 3D Canvas, Monaco, and other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('code3d-theme-change', {
          detail: { theme, accentColor, templateStyle, activeColor },
        })
      );
    }
  }, [theme, accentColor, templateStyle, isBright, currentAccent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const changeAccent = (colorKey) => {
    if (ACCENT_PALETTES[colorKey]) {
      setAccentColor(colorKey);
    }
  };

  const changeTemplate = (templateKey) => {
    if (TEMPLATE_STYLES[templateKey]) {
      setTemplateStyle(templateKey);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isBright,
        toggleTheme,
        accentColor,
        setAccentColor: changeAccent,
        currentAccent,
        templateStyle,
        setTemplateStyle: changeTemplate,
        currentTemplate,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      setTheme: () => {},
      isBright: false,
      toggleTheme: () => {},
      accentColor: 'cyan',
      setAccentColor: () => {},
      currentAccent: DEFAULT_ACCENT,
      templateStyle: 'bento',
      setTemplateStyle: () => {},
      currentTemplate: DEFAULT_TEMPLATE,
    };
  }
  return context;
}
