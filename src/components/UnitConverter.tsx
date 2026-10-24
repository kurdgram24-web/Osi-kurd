/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  DollarSign,
  Ruler,
  Scale,
  Thermometer,
  Square,
  Box,
  HardDrive,
  Gauge,
  Clock,
} from 'lucide-react';
import { unitCategories } from '../utils/unitsData';
import { UnitCategoryId, Language, NumberFormat } from '../types/calculator';
import { translations, toKurdishDigits } from '../utils/translations';
import { formatResultNumber } from '../utils/mathEngine';
import { soundManager } from '../utils/audio';

interface UnitConverterProps {
  language: Language;
  numberFormat: NumberFormat;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ language, numberFormat }) => {
  const t = translations[language];
  const [selectedCatId, setSelectedCatId] = useState<UnitCategoryId>('currency');
  const [fromValue, setFromValue] = useState<string>('100');
  const [copied, setCopied] = useState(false);

  // Active category
  const activeCategory = useMemo(() => {
    return unitCategories.find((c) => c.id === selectedCatId) || unitCategories[0];
  }, [selectedCatId]);

  const [fromUnitId, setFromUnitId] = useState<string>(activeCategory.defaultFrom);
  const [toUnitId, setToUnitId] = useState<string>(activeCategory.defaultTo);

  // When category changes, reset units
  const handleSelectCategory = (catId: UnitCategoryId) => {
    soundManager.playOperator();
    setSelectedCatId(catId);
    const cat = unitCategories.find((c) => c.id === catId);
    if (cat) {
      setFromUnitId(cat.defaultFrom);
      setToUnitId(cat.defaultTo);
    }
  };

  const fromUnit = useMemo(() => {
    return activeCategory.units.find((u) => u.id === fromUnitId) || activeCategory.units[0];
  }, [activeCategory, fromUnitId]);

  const toUnit = useMemo(() => {
    return activeCategory.units.find((u) => u.id === toUnitId) || activeCategory.units[1] || activeCategory.units[0];
  }, [activeCategory, toUnitId]);

  // Conversion calculation
  const calculatedResult = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return 0;
    const baseVal = fromUnit.toBase(num);
    const targetVal = toUnit.fromBase(baseVal);
    return targetVal;
  }, [fromValue, fromUnit, toUnit]);

  const handleSwap = () => {
    soundManager.playFunction();
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = () => {
    soundManager.playOperator();
    navigator.clipboard.writeText(String(calculatedResult));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const getCategoryIcon = (id: UnitCategoryId) => {
    switch (id) {
      case 'currency': return <DollarSign className="w-4 h-4" />;
      case 'length': return <Ruler className="w-4 h-4" />;
      case 'weight': return <Scale className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'area': return <Square className="w-4 h-4" />;
      case 'volume': return <Box className="w-4 h-4" />;
      case 'data': return <HardDrive className="w-4 h-4" />;
      case 'speed': return <Gauge className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
    }
  };

  const isKurdishDigits = numberFormat === 'kurdish';

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Category Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 p-1 bg-slate-900/60 rounded-2xl border border-slate-800/80">
        {unitCategories.map((cat) => {
          const isSelected = cat.id === selectedCatId;
          const label = language === 'ku' ? cat.nameKu : cat.nameEn;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* FROM Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.converter.from}</span>
            <span className="text-amber-400 font-mono text-xs">{fromUnit.symbol}</span>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full text-3xl sm:text-4xl font-mono font-semibold bg-transparent text-slate-100 outline-none border-b border-slate-700/80 pb-2 focus:border-amber-500 transition-colors"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">{language === 'ku' ? 'یەکە' : 'Unit'}</label>
            <select
              value={fromUnitId}
              onChange={(e) => {
                soundManager.playDigit();
                setFromUnitId(e.target.value);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-medium outline-none focus:border-amber-500"
            >
              {activeCategory.units.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                  {language === 'ku' ? u.nameKu : u.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Quick preset increments */}
          <div className="flex items-center gap-1.5 pt-1">
            {['1', '10', '100', '1000'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  soundManager.playDigit();
                  setFromValue(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
              >
                +{isKurdishDigits ? toKurdishDigits(preset) : preset}
              </button>
            ))}
            <button
              onClick={() => {
                soundManager.playClear();
                setFromValue('0');
              }}
              className="ml-auto p-1 text-slate-500 hover:text-rose-400"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Swap button between cards (Centered on md screens) */}
        <div className="flex items-center justify-center -my-2 md:my-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10">
          <button
            onClick={handleSwap}
            title={t.converter.swap}
            className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* TO Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.converter.to}</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-mono text-xs">{toUnit.symbol}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                title={t.common.copy}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-full text-3xl sm:text-4xl font-mono font-semibold text-amber-400 border-b border-slate-700/80 pb-2 overflow-x-auto no-scrollbar">
              {formatResultNumber(calculatedResult, isKurdishDigits)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">{language === 'ku' ? 'یەکە' : 'Unit'}</label>
            <select
              value={toUnitId}
              onChange={(e) => {
                soundManager.playDigit();
                setToUnitId(e.target.value);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-medium outline-none focus:border-amber-500"
            >
              {activeCategory.units.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                  {language === 'ku' ? u.nameKu : u.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Active Formula Indicator */}
          <div className="mt-auto pt-3 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>
              1 {fromUnit.symbol} = {formatResultNumber(toUnit.fromBase(fromUnit.toBase(1)), isKurdishDigits)} {toUnit.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Kurdish Currency notice */}
      {selectedCatId === 'currency' && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-center justify-between">
          <span>{t.converter.rateNotice}</span>
          <span className="font-mono text-[11px] text-amber-400">100 $ = 150,000 د.ع</span>
        </div>
      )}
    </div>
  );
};
