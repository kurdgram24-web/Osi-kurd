/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calculator,
  FlaskConical,
  ArrowRightLeft,
  Coins,
  CalendarDays,
  Volume2,
  VolumeX,
  History,
  Keyboard,
  Globe,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { CalculatorMode, Language, NumberFormat, ThemeMode } from '../types/calculator';
import { translations } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  numberFormat: NumberFormat;
  setNumberFormat: (fmt: NumberFormat) => void;
  soundEnabled: boolean;
  setSoundEnabled: (en: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  historyCount: number;
  openHistory: () => void;
  openKeyboardGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  language,
  setLanguage,
  numberFormat,
  setNumberFormat,
  soundEnabled,
  setSoundEnabled,
  theme,
  setTheme,
  historyCount,
  openHistory,
  openKeyboardGuide,
}) => {
  const t = translations[language];

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundManager.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) soundManager.playDigit();
  };

  const cycleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'oled' : theme === 'oled' ? 'light' : 'dark';
    setTheme(nextTheme);
    soundManager.playOperator();
  };

  const navItems: { id: CalculatorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'standard', label: t.modes.standard, icon: <Calculator className="w-4 h-4" /> },
    { id: 'scientific', label: t.modes.scientific, icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'converter', label: t.modes.converter, icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'finance', label: t.modes.finance, icon: <Coins className="w-4 h-4" /> },
    { id: 'date', label: t.modes.date, icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 text-slate-950 font-bold text-lg tracking-wider">
            OSI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                OSI CALCULATE
              </span>
            </div>
            <div className="text-[11px] text-amber-400/90 font-medium">
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs (Desktop / Tablet) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
          {navItems.map((item) => {
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playOperator();
                  setMode(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utilities & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* History Button */}
          <button
            onClick={() => {
              soundManager.playOperator();
              openHistory();
            }}
            title={t.common.history}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Kurdish Digits Toggle (٠-٩ vs 0-9) */}
          <button
            onClick={() => {
              const next = numberFormat === 'standard' ? 'kurdish' : 'standard';
              setNumberFormat(next);
              soundManager.playDigit();
            }}
            title={t.common.kurdishDigits}
            className={`px-2.5 h-9 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              numberFormat === 'kurdish'
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="font-mono text-sm">{numberFormat === 'kurdish' ? '١٢٣' : '123'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={t.common.sound}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:border-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Keyboard Guide */}
          <button
            onClick={() => {
              soundManager.playOperator();
              openKeyboardGuide();
            }}
            title={t.common.shortcuts}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            title={`${t.common.theme}: ${
              theme === 'dark' ? t.common.themeDark : theme === 'oled' ? t.common.themeOled : t.common.themeLight
            }`}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {theme === 'dark' && <Moon className="w-4 h-4 text-sky-400" />}
            {theme === 'oled' && <Sparkles className="w-4 h-4 text-amber-400" />}
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Language Toggle (Kurdish / English) */}
          <button
            onClick={() => {
              const next = language === 'ku' ? 'en' : 'ku';
              setLanguage(next);
              soundManager.playOperator();
            }}
            title={t.common.language}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:border-amber-500/40 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ku' ? 'کوردی' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher Scrollbar */}
      <div className="lg:hidden px-4 pb-2.5 pt-1 overflow-x-auto no-scrollbar flex items-center gap-2 border-t border-slate-900">
        {navItems.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playOperator();
                setMode(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
