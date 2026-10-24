/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Cake, Clock, Sparkles } from 'lucide-react';
import { Language, NumberFormat } from '../types/calculator';
import { translations, toKurdishDigits } from '../utils/translations';

interface AgeDateCalculatorProps {
  language: Language;
  numberFormat: NumberFormat;
}

export const AgeDateCalculator: React.FC<AgeDateCalculatorProps> = ({ language, numberFormat }) => {
  const t = translations[language];
  const isKurdish = numberFormat === 'kurdish';

  // Default birthdate
  const [birthDate, setBirthDate] = useState<string>('2000-01-15');

  // Date diff states
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  const formatNum = (n: number) => {
    const s = n.toLocaleString();
    return isKurdish ? toKurdishDigits(s) : s;
  };

  // Age calculation
  const ageDetails = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();

    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total milliseconds
    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Next birthday countdown
    let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) {
      nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysToNextBday,
    };
  }, [birthDate]);

  // Date difference calculation
  const dateDiffResult = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    return {
      totalDays,
      weeks,
      remainingDays,
    };
  }, [startDate, endDate]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Age Calculator Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
          <Cake className="w-5 h-5 text-amber-400" />
          <span>{t.dateCalc.title}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="text-xs text-slate-400 shrink-0 font-medium">{t.dateCalc.birthDate}:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono outline-none focus:border-amber-500"
          />
        </div>

        {ageDetails ? (
          <div className="flex flex-col gap-4">
            {/* Primary Age Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400">
                  {formatNum(ageDetails.years)}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.dateCalc.years}</div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400">
                  {formatNum(ageDetails.months)}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.dateCalc.months}</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400">
                  {formatNum(ageDetails.days)}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.dateCalc.days}</div>
              </div>
            </div>

            {/* Next Birthday Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.dateCalc.nextBirthday}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-amber-300">
                {formatNum(ageDetails.daysToNextBday)} {t.dateCalc.daysRemaining}
              </div>
            </div>

            {/* Granular Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400 block">{t.dateCalc.totalDays}</span>
                <span className="font-mono font-bold text-slate-200 text-base">
                  {formatNum(ageDetails.totalDays)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400 block">{t.dateCalc.weeksDays}</span>
                <span className="font-mono font-bold text-slate-200 text-base">
                  {formatNum(ageDetails.totalWeeks)} w
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400 block">{t.dateCalc.hours}</span>
                <span className="font-mono font-bold text-slate-200 text-base">
                  {formatNum(ageDetails.totalHours)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-slate-400 block">{t.dateCalc.minutes}</span>
                <span className="font-mono font-bold text-slate-200 text-base">
                  {formatNum(ageDetails.totalMinutes)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-400">بەروارێکی ڕاستەقینە دیاری بکە</div>
        )}
      </div>

      {/* Date Difference Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span>{t.dateCalc.dateDiffTitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">{t.dateCalc.startDate}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">{t.dateCalc.endDate}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {dateDiffResult && (
          <div className="mt-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-around text-center">
            <div>
              <div className="text-3xl font-bold font-mono text-amber-400">
                {formatNum(dateDiffResult.totalDays)}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.dateCalc.totalDays}</div>
            </div>
            <div className="border-r border-slate-800 h-10" />
            <div>
              <div className="text-3xl font-bold font-mono text-amber-400">
                {formatNum(dateDiffResult.weeks)} + {formatNum(dateDiffResult.remainingDays)}
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.dateCalc.weeksDays}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
