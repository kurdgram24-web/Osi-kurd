/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Language } from '../types/calculator';
import { translations } from '../utils/translations';

interface KeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const KeyboardGuideModal: React.FC<KeyboardGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 9', desc: language === 'ku' ? 'نووسینی ژمارەکان' : 'Type numbers' },
    { key: '+  -  *  /', desc: t.keyboard.operators },
    { key: 'Enter  or  =', desc: t.keyboard.enter },
    { key: 'Backspace', desc: t.keyboard.backspace },
    { key: 'Escape  or  c', desc: t.keyboard.escape },
    { key: '(   )', desc: t.keyboard.brackets },
    { key: '^', desc: t.keyboard.powers },
    { key: '%', desc: language === 'ku' ? 'ڕێژەی سەدی' : 'Percentage' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
        dir={language === 'ku' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">{t.keyboard.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">{t.keyboard.description}</p>

        <div className="space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono text-[11px] font-semibold">
                {sc.key}
              </kbd>
              <span className="text-slate-300 font-medium">{sc.desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          {t.common.close}
        </button>
      </div>
    </div>
  );
};
