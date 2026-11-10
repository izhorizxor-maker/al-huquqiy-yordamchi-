import React from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../translations';
import { Shield, Sun, Moon, Calculator, MessageSquare, MapPin } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onOpenCalculator,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                O'zbekiston
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Controls: Calculator, Language, Day/Night */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Calculator Button */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">{t.tabCalculator}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            {(['uz', 'ru', 'en'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => onLanguageChange(l)}
                className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                  language === l
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{t.lightMode}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">{t.darkMode}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
