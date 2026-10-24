/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, Download, Copy, Check, CornerDownLeft } from 'lucide-react';
import { CalculationRecord, Language, NumberFormat } from '../types/calculator';
import { translations, toKurdishDigits } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationRecord[];
  onClearHistory: () => void;
  onSelectRecord: (record: CalculationRecord) => void;
  language: Language;
  numberFormat: NumberFormat;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectRecord,
  language,
  numberFormat,
}) => {
  const t = translations[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isKurdish = numberFormat === 'kurdish';

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    soundManager.playOperator();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    soundManager.playOperator();
    const content = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleString()}] ${h.expression} = ${h.result} (${h.mode})`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSI-CALCULATE-history-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Drawer content */}
      <div
        className="w-full max-w-md h-full bg-slate-900 border-s border-slate-800 flex flex-col shadow-2xl p-4 sm:p-6 overflow-hidden"
        dir={language === 'ku' ? 'rtl' : 'ltr'}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-100">{t.common.history}</span>
            <span className="text-xs text-amber-400 font-mono">({history.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  title={t.common.export}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundManager.playClear();
                    onClearHistory();
                  }}
                  title={t.common.clearHistory}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <span className="text-sm">{t.common.noHistory}</span>
            </div>
          ) : (
            history.map((item) => {
              const expr = isKurdish ? toKurdishDigits(item.expression) : item.expression;
              const res = isKurdish ? toKurdishDigits(item.result) : item.result;
              const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="group relative rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 hover:border-amber-500/40 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">{isKurdish ? toKurdishDigits(timeStr) : timeStr}</span>
                    <span className="text-amber-500/80 font-medium">{item.mode}</span>
                  </div>

                  {/* Expression */}
                  <div
                    className="font-mono text-sm text-slate-300 text-left overflow-x-auto no-scrollbar"
                    dir="ltr"
                  >
                    {expr}
                  </div>

                  {/* Result & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div
                      className="font-mono text-lg font-bold text-amber-400 text-left truncate cursor-pointer hover:underline"
                      dir="ltr"
                      onClick={() => {
                        soundManager.playOperator();
                        onSelectRecord(item);
                        onClose();
                      }}
                      title={t.common.restore}
                    >
                      = {res}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.id, item.result)}
                        className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                        title={t.common.copy}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playOperator();
                          onSelectRecord(item);
                          onClose();
                        }}
                        className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors"
                        title={t.common.restore}
                      >
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
