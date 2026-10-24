/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NumberFormat } from '../types/calculator';
import { toKurdishDigits } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface KeypadStandardProps {
  onInput: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-') => void;
  onToggleSign: () => void;
  numberFormat: NumberFormat;
}

export const KeypadStandard: React.FC<KeypadStandardProps> = ({
  onInput,
  onClear,
  onCalculate,
  onMemoryAction,
  onToggleSign,
  numberFormat,
}) => {
  const isKurdish = numberFormat === 'kurdish';

  const formatDigit = (d: string) => (isKurdish ? toKurdishDigits(d) : d);

  const handleDigit = (d: string) => {
    soundManager.playDigit();
    onInput(d);
  };

  const handleOperator = (op: string) => {
    soundManager.playOperator();
    onInput(op);
  };

  const handleMemory = (act: 'MC' | 'MR' | 'M+' | 'M-') => {
    soundManager.playFunction();
    onMemoryAction(act);
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-1">
      {/* Memory Row */}
      <div className="col-span-4 grid grid-cols-4 gap-2 pb-1">
        {(['MC', 'MR', 'M+', 'M-'] as const).map((mKey) => (
          <button
            key={mKey}
            onClick={() => handleMemory(mKey)}
            className="h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-all active:scale-[0.96]"
          >
            {mKey}
          </button>
        ))}
      </div>

      {/* Row 1 */}
      <button
        onClick={() => {
          soundManager.playClear();
          onClear();
        }}
        className="h-14 sm:h-16 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-lg sm:text-xl transition-all active:scale-[0.96]"
      >
        AC
      </button>
      <button
        onClick={() => handleOperator('(')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 font-semibold text-lg sm:text-xl transition-all active:scale-[0.96]"
      >
        (
      </button>
      <button
        onClick={() => handleOperator(')')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 font-semibold text-lg sm:text-xl transition-all active:scale-[0.96]"
      >
        )
      </button>
      <button
        onClick={() => handleOperator('÷')}
        className="h-14 sm:h-16 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-2xl transition-all active:scale-[0.96]"
      >
        ÷
      </button>

      {/* Row 2: 7, 8, 9, × */}
      <button
        onClick={() => handleDigit('7')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('7')}
      </button>
      <button
        onClick={() => handleDigit('8')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('8')}
      </button>
      <button
        onClick={() => handleDigit('9')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('9')}
      </button>
      <button
        onClick={() => handleOperator('×')}
        className="h-14 sm:h-16 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-2xl transition-all active:scale-[0.96]"
      >
        ×
      </button>

      {/* Row 3: 4, 5, 6, − */}
      <button
        onClick={() => handleDigit('4')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('4')}
      </button>
      <button
        onClick={() => handleDigit('5')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('5')}
      </button>
      <button
        onClick={() => handleDigit('6')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('6')}
      </button>
      <button
        onClick={() => handleOperator('−')}
        className="h-14 sm:h-16 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-2xl transition-all active:scale-[0.96]"
      >
        −
      </button>

      {/* Row 4: 1, 2, 3, + */}
      <button
        onClick={() => handleDigit('1')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('1')}
      </button>
      <button
        onClick={() => handleDigit('2')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('2')}
      </button>
      <button
        onClick={() => handleDigit('3')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('3')}
      </button>
      <button
        onClick={() => handleOperator('+')}
        className="h-14 sm:h-16 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-2xl transition-all active:scale-[0.96]"
      >
        +
      </button>

      {/* Row 5: ±, 0, ., = */}
      <button
        onClick={() => {
          soundManager.playFunction();
          onToggleSign();
        }}
        className="h-14 sm:h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 font-semibold text-xl transition-all active:scale-[0.96]"
      >
        ±
      </button>
      <button
        onClick={() => handleDigit('0')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-medium text-2xl font-mono transition-all active:scale-[0.96]"
      >
        {formatDigit('0')}
      </button>
      <button
        onClick={() => handleOperator('.')}
        className="h-14 sm:h-16 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-100 font-bold text-2xl font-mono transition-all active:scale-[0.96]"
      >
        .
      </button>
      <button
        onClick={() => {
          soundManager.playEquals();
          onCalculate();
        }}
        className="h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-2xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.96]"
      >
        =
      </button>
    </div>
  );
};
