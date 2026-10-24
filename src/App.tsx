/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalculatorMode,
  Language,
  NumberFormat,
  ThemeMode,
  CalculationRecord,
} from './types/calculator';
import { translations } from './utils/translations';
import { AngleMode, evaluateExpression, formatResultNumber } from './utils/mathEngine';
import { soundManager } from './utils/audio';

import { Header } from './components/Header';
import { Display } from './components/Display';
import { KeypadStandard } from './components/KeypadStandard';
import { KeypadScientific } from './components/KeypadScientific';
import { UnitConverter } from './components/UnitConverter';
import { FinanceCalculator } from './components/FinanceCalculator';
import { AgeDateCalculator } from './components/AgeDateCalculator';
import { HistoryDrawer } from './components/HistoryDrawer';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';

const HISTORY_STORAGE_KEY = 'osi_calc_history';

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [language, setLanguage] = useState<Language>('ku');
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('standard');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');

  // Math calculator state
  const [expression, setExpression] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);

  // History state
  const [history, setHistory] = useState<CalculationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore JSON parse error
      }
    }
    return [];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage unavailable
    }
  }, [history]);

  // Sync document direction and language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ku' ? 'rtl' : 'ltr';
  }, [language]);

  // Live expression preview
  useEffect(() => {
    if (!expression.trim()) {
      setPreviewResult(null);
      setError(null);
      return;
    }

    // Only compute preview if expression has operators
    if (/[\+\-×÷%^]|sin|cos|tan|ln|log|sqrt|cbrt|!/.test(expression)) {
      const { result, error: err } = evaluateExpression(expression, angleMode);
      if (err) {
        // Don't show hard error during active typing unless unbalanced or fatal
        setPreviewResult(null);
      } else if (result !== null) {
        setPreviewResult(formatResultNumber(result, false));
        setError(null);
      }
    } else {
      setPreviewResult(null);
      setError(null);
    }
  }, [expression, angleMode]);

  // Input append handler
  const handleInput = useCallback((char: string) => {
    setError(null);
    setExpression((prev) => {
      // Prevent consecutive operators
      const isOperator = ['+', '−', '×', '÷', '^', '%'].includes(char);
      const lastChar = prev.slice(-1);
      const isLastOperator = ['+', '−', '×', '÷', '^', '%'].includes(lastChar);

      if (isOperator && isLastOperator) {
        return prev.slice(0, -1) + char;
      }

      // If typing digits after zero
      if (prev === '0' && !['.', '+', '−', '×', '÷', '%', '^'].includes(char)) {
        return char;
      }

      return prev + char;
    });
  }, []);

  const handleClear = useCallback(() => {
    setExpression('');
    setPreviewResult(null);
    setError(null);
  }, []);

  const handleDelete = useCallback(() => {
    soundManager.playDelete();
    setError(null);
    setExpression((prev) => {
      if (!prev) return '';

      // Check if ends with multi-letter function name like sin(, cos(, sqrt(, etc.
      const funcMatch = prev.match(/(asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|ln|log|sqrt|cbrt|abs)\($/);
      if (funcMatch) {
        return prev.slice(0, -funcMatch[0].length);
      }

      return prev.slice(0, -1);
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setExpression((prev) => {
      if (!prev) return '−';
      if (prev.startsWith('−')) return prev.slice(1);
      if (prev.startsWith('-')) return prev.slice(1);
      return '−' + prev;
    });
  }, []);

  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const { result, error: err } = evaluateExpression(expression, angleMode);

    if (err || result === null) {
      soundManager.playError();
      setError(err || 'Error');
    } else {
      const formatted = formatResultNumber(result, false);

      // Record to history
      const newRecord: CalculationRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        expression,
        result: formatted,
        mode,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 49)]); // keep last 50
      setExpression(formatted);
      setPreviewResult(null);
      setError(null);
    }
  }, [expression, angleMode, mode]);

  const handleMemoryAction = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const currentNum = parseFloat(previewResult || expression || '0') || 0;

    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        if (memory !== 0) {
          setExpression((prev) => prev + memory.toString());
        }
        break;
      case 'M+':
        setMemory((prev) => prev + currentNum);
        break;
      case 'M-':
        setMemory((prev) => prev - currentNum);
        break;
    }
  }, [previewResult, expression, memory]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleSelectRecord = useCallback((record: CalculationRecord) => {
    setExpression(record.expression);
    setPreviewResult(record.result);
    setError(null);
  }, []);

  // Physical Keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input fields inside Converter/Finance
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        soundManager.playDigit();
        handleInput(e.key);
      } else if (e.key === '.') {
        soundManager.playDigit();
        handleInput('.');
      } else if (e.key === '+' || e.key === '-') {
        soundManager.playOperator();
        handleInput(e.key === '-' ? '−' : '+');
      } else if (e.key === '*') {
        soundManager.playOperator();
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        soundManager.playOperator();
        handleInput('÷');
      } else if (e.key === '%') {
        soundManager.playOperator();
        handleInput('%');
      } else if (e.key === '^') {
        soundManager.playOperator();
        handleInput('^');
      } else if (e.key === '(' || e.key === ')') {
        soundManager.playOperator();
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        soundManager.playEquals();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        soundManager.playClear();
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput, handleCalculate, handleDelete, handleClear]);

  // Dynamic Theme Background & Surface
  const themeClasses = useMemo(() => {
    switch (theme) {
      case 'oled':
        return 'bg-black text-slate-100 selection:bg-amber-500/40 selection:text-amber-200';
      case 'light':
        return 'bg-slate-100 text-slate-900 selection:bg-amber-500/30 selection:text-slate-900';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200';
    }
  }, [theme]);

  const isMathMode = mode === 'standard' || mode === 'scientific';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeClasses}`}>
      {/* Top Bar Header */}
      <Header
        mode={mode}
        setMode={setMode}
        language={language}
        setLanguage={setLanguage}
        numberFormat={numberFormat}
        setNumberFormat={setNumberFormat}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        setTheme={setTheme}
        historyCount={history.length}
        openHistory={() => setIsHistoryOpen(true)}
        openKeyboardGuide={() => setIsKeyboardGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col items-center justify-center">
        {/* Math Modes: Standard & Scientific */}
        {isMathMode && (
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Display Screen */}
            <Display
              expression={expression}
              previewResult={previewResult}
              error={error}
              hasMemory={memory !== 0}
              angleMode={mode === 'scientific' ? angleMode : undefined}
              numberFormat={numberFormat}
              language={language}
              onClear={handleClear}
              onDelete={handleDelete}
            />

            {/* Keypads */}
            {mode === 'standard' ? (
              <KeypadStandard
                onInput={handleInput}
                onClear={handleClear}
                onDelete={handleDelete}
                onCalculate={handleCalculate}
                onMemoryAction={handleMemoryAction}
                onToggleSign={handleToggleSign}
                numberFormat={numberFormat}
              />
            ) : (
              <KeypadScientific
                onInput={handleInput}
                onClear={handleClear}
                onDelete={handleDelete}
                onCalculate={handleCalculate}
                onToggleSign={handleToggleSign}
                angleMode={angleMode}
                setAngleMode={setAngleMode}
                numberFormat={numberFormat}
              />
            )}
          </div>
        )}

        {/* Unit Converter Mode */}
        {mode === 'converter' && (
          <div className="w-full max-w-3xl flex flex-col animate-in fade-in duration-200">
            <UnitConverter language={language} numberFormat={numberFormat} />
          </div>
        )}

        {/* Finance & Loan Calculator Mode */}
        {mode === 'finance' && (
          <div className="w-full max-w-3xl flex flex-col animate-in fade-in duration-200">
            <FinanceCalculator language={language} numberFormat={numberFormat} />
          </div>
        )}

        {/* Age & Date Calculator Mode */}
        {mode === 'date' && (
          <div className="w-full max-w-3xl flex flex-col animate-in fade-in duration-200">
            <AgeDateCalculator language={language} numberFormat={numberFormat} />
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OSI CALCULATE · {translations[language].appName}</span>
          <span className="text-[11px] text-slate-600">
            {translations[language].subtitle}
          </span>
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectRecord={handleSelectRecord}
        language={language}
        numberFormat={numberFormat}
      />

      {/* Keyboard Shortcuts Guide */}
      <KeyboardGuideModal
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
        language={language}
      />
    </div>
  );
}
