/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, Delete, RotateCcw } from 'lucide-react';
import { Language, NumberFormat } from '../types/calculator';
import { toKurdishDigits, translations } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface DisplayProps {
  expression: string;
  previewResult: string | null;
  error: string | null;
  hasMemory: boolean;
  angleMode?: 'DEG' | 'RAD';
  numberFormat: NumberFormat;
  language: Language;
  onClear: () => void;
  onDelete: () => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  previewResult,
  error,
  hasMemory,
  angleMode,
  numberFormat,
  language,
  onClear,
  onDelete,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const exprContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression to the end as characters are added
  useEffect(() => {
    if (exprContainerRef.current) {
      exprContainerRef.current.scrollLeft = exprContainerRef.current.scrollWidth;
    }
  }, [expression]);

  const handleCopy = () => {
    const textToCopy = previewResult || expression || '0';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    soundManager.playOperator();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const isKurdish = numberFormat === 'kurdish';
  const displayExpr = isKurdish ? toKurdishDigits(expression || '0') : expression || '0';
  const displayPreview = previewResult
    ? isKurdish
      ? toKurdishDigits(previewResult)
      : previewResult
    : null;

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Top indicators & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {hasMemory && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-[10px] tracking-wider border border-amber-500/30">
              MEMORY
            </span>
          )}
          {angleMode && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] tracking-wider border border-slate-700">
              {angleMode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors text-xs"
            title={t.common.copy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px] font-medium">{t.common.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">{t.common.copy}</span>
              </>
            )}
          </button>

          {/* Quick Backspace */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="DEL"
          >
            <Delete className="w-4 h-4" />
          </button>

          {/* Quick Clear */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="AC"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Expression Display */}
      <div
        ref={exprContainerRef}
        className="overflow-x-auto no-scrollbar whitespace-nowrap text-right py-1"
        dir="ltr"
      >
        <span
          className={`font-mono tracking-tight transition-all ${
            expression.length > 18
              ? 'text-2xl sm:text-3xl'
              : expression.length > 12
              ? 'text-3xl sm:text-4xl'
              : 'text-4xl sm:text-5xl'
          } font-medium ${error ? 'text-rose-400' : 'text-slate-100'}`}
        >
          {error ? t.common.error : displayExpr}
        </span>
      </div>

      {/* Live Preview Result or Error Message */}
      <div className="mt-2 min-h-[28px] flex items-center justify-end" dir="ltr">
        {error ? (
          <span className="text-xs text-rose-400/90 font-medium">
            {error === 'Undefined' ? t.common.divideByZero : error}
          </span>
        ) : displayPreview ? (
          <div className="flex items-center gap-1.5 text-slate-400 group cursor-pointer" onClick={handleCopy}>
            <span className="text-sm font-light text-slate-500">=</span>
            <span className="font-mono text-xl sm:text-2xl font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
              {displayPreview}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-600 font-mono">OSI CALCULATE</span>
        )}
      </div>
    </div>
  );
};
