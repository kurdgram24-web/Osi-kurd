/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AngleMode } from '../utils/mathEngine';
import { NumberFormat } from '../types/calculator';
import { toKurdishDigits } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface KeypadScientificProps {
  onInput: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  angleMode: AngleMode;
  setAngleMode: (mode: AngleMode) => void;
  numberFormat: NumberFormat;
}

export const KeypadScientific: React.FC<KeypadScientificProps> = ({
  onInput,
  onClear,
  onCalculate,
  onToggleSign,
  angleMode,
  setAngleMode,
  numberFormat,
}) => {
  const [isSecond, setIsSecond] = useState(false);
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

  const handleFunction = (fn: string) => {
    soundManager.playFunction();
    onInput(fn);
  };

  const toggleAngle = () => {
    soundManager.playOperator();
    setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
  };

  const toggleSecond = () => {
    soundManager.playOperator();
    setIsSecond(!isSecond);
  };

  return (
    <div className="flex flex-col gap-2 p-1">
      {/* Top Scientific Control Row */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={toggleAngle}
          className="h-9 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:border-slate-700 transition-all active:scale-[0.96]"
        >
          {angleMode}
        </button>
        <button
          onClick={toggleSecond}
          className={`h-9 rounded-xl border text-xs font-semibold transition-all active:scale-[0.96] ${
            isSecond
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          2nd
        </button>
        <button
          onClick={() => handleFunction('π')}
          className="h-9 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-all active:scale-[0.96]"
        >
          π
        </button>
        <button
          onClick={() => handleFunction('e')}
          className="h-9 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-all active:scale-[0.96]"
        >
          e
        </button>
      </div>

      {/* Main Scientific Grid: 5 columns */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <button
          onClick={() => handleFunction(isSecond ? 'asin(' : 'sin(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => handleFunction(isSecond ? 'acos(' : 'cos(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => handleFunction(isSecond ? 'atan(' : 'tan(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() => {
            soundManager.playClear();
            onClear();
          }}
          className="h-12 sm:h-13 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-sm sm:text-base transition-all active:scale-[0.96]"
        >
          AC
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-12 sm:h-13 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xl transition-all active:scale-[0.96]"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleFunction(isSecond ? 'e^(' : 'ln(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => handleFunction(isSecond ? '10^(' : 'log(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? '10ˣ' : 'log'}
        </button>
        <button
          onClick={() => handleDigit('7')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('7')}
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('8')}
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('9')}
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleFunction('^')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          xʸ
        </button>
        <button
          onClick={() => handleFunction(isSecond ? 'cbrt(' : 'sqrt(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          {isSecond ? '∛x' : '√x'}
        </button>
        <button
          onClick={() => handleDigit('4')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('4')}
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('5')}
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('6')}
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleOperator('×')}
          className="h-12 sm:h-13 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xl transition-all active:scale-[0.96]"
        >
          ×
        </button>
        <button
          onClick={() => handleFunction('!')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          x!
        </button>
        <button
          onClick={() => handleDigit('1')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('1')}
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('2')}
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('3')}
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleOperator('−')}
          className="h-12 sm:h-13 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xl transition-all active:scale-[0.96]"
        >
          −
        </button>
        <button
          onClick={() => handleFunction('(')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.96]"
        >
          (
        </button>
        <button
          onClick={() => handleFunction(')')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.96]"
        >
          )
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-medium text-xl font-mono transition-all active:scale-[0.96]"
        >
          {formatDigit('0')}
        </button>
        <button
          onClick={() => handleOperator('.')}
          className="h-12 sm:h-13 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-bold text-xl font-mono transition-all active:scale-[0.96]"
        >
          .
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleOperator('+')}
          className="h-12 sm:h-13 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xl transition-all active:scale-[0.96]"
        >
          +
        </button>
        <button
          onClick={() => handleFunction('%')}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          %
        </button>
        <button
          onClick={() => {
            soundManager.playFunction();
            onToggleSign();
          }}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.96]"
        >
          ±
        </button>
        <button
          onClick={() => {
            const randVal = Math.random().toFixed(4);
            handleFunction(randVal);
          }}
          className="h-12 sm:h-13 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-[11px] font-medium text-slate-400 hover:text-amber-300 transition-all active:scale-[0.96]"
        >
          Rand
        </button>
        <button
          onClick={() => {
            soundManager.playEquals();
            onCalculate();
          }}
          className="h-12 sm:h-13 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-2xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.96]"
        >
          =
        </button>
      </div>
    </div>
  );
};
