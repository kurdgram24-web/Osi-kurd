/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FinanceTab, Language, NumberFormat } from '../types/calculator';
import { translations, toKurdishDigits } from '../utils/translations';
import { formatResultNumber } from '../utils/mathEngine';
import { soundManager } from '../utils/audio';
import { Coins, Tag, TrendingUp } from 'lucide-react';

interface FinanceCalculatorProps {
  language: Language;
  numberFormat: NumberFormat;
}

export const FinanceCalculator: React.FC<FinanceCalculatorProps> = ({ language, numberFormat }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<FinanceTab>('loan');

  // Loan state
  const [loanAmount, setLoanAmount] = useState<string>('10000');
  const [loanRate, setLoanRate] = useState<string>('5');
  const [loanMonths, setLoanMonths] = useState<string>('24');

  // Discount & Tax state
  const [discOriginalPrice, setDiscOriginalPrice] = useState<string>('250');
  const [discountPercent, setDiscountPercent] = useState<string>('20');
  const [taxPercent, setTaxPercent] = useState<string>('5');

  // Savings state
  const [savingsInitial, setSavingsInitial] = useState<string>('1000');
  const [savingsMonthly, setSavingsMonthly] = useState<string>('200');
  const [savingsRate, setSavingsRate] = useState<string>('7');
  const [savingsYears, setSavingsYears] = useState<string>('5');

  const isKurdish = numberFormat === 'kurdish';

  // Loan calculation
  const loanResult = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualR = parseFloat(loanRate) || 0;
    const n = parseFloat(loanMonths) || 0;

    if (P <= 0 || n <= 0) return { monthly: 0, total: 0, interest: 0 };

    if (annualR === 0) {
      return { monthly: P / n, total: P, interest: 0 };
    }

    const monthlyR = annualR / 100 / 12;
    const monthlyPayment = (P * (monthlyR * Math.pow(1 + monthlyR, n))) / (Math.pow(1 + monthlyR, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    return {
      monthly: monthlyPayment,
      total: totalPayment,
      interest: totalInterest,
    };
  }, [loanAmount, loanRate, loanMonths]);

  // Discount calculation
  const discountResult = useMemo(() => {
    const original = parseFloat(discOriginalPrice) || 0;
    const disc = parseFloat(discountPercent) || 0;
    const tax = parseFloat(taxPercent) || 0;

    const saved = original * (disc / 100);
    const afterDiscount = Math.max(0, original - saved);
    const taxAmount = afterDiscount * (tax / 100);
    const finalPrice = afterDiscount + taxAmount;

    return {
      saved,
      taxAmount,
      finalPrice,
    };
  }, [discOriginalPrice, discountPercent, taxPercent]);

  // Savings calculation
  const savingsResult = useMemo(() => {
    const P = parseFloat(savingsInitial) || 0;
    const PMT = parseFloat(savingsMonthly) || 0;
    const r = (parseFloat(savingsRate) || 0) / 100 / 12;
    const years = parseFloat(savingsYears) || 0;
    const n = years * 12;

    if (n <= 0) return { futureValue: P, deposited: P, earned: 0 };

    let fv = P * Math.pow(1 + r, n);
    if (r > 0) {
      fv += PMT * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      fv += PMT * n;
    }

    const deposited = P + PMT * n;
    const earned = Math.max(0, fv - deposited);

    return {
      futureValue: fv,
      deposited,
      earned,
    };
  }, [savingsInitial, savingsMonthly, savingsRate, savingsYears]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            soundManager.playOperator();
            setActiveTab('loan');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'loan'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{t.finance.tabs.loan}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playOperator();
            setActiveTab('discount');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'discount'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t.finance.tabs.discount}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playOperator();
            setActiveTab('savings');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'savings'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.finance.tabs.savings}</span>
        </button>
      </div>

      {/* Loan Tab */}
      {activeTab === 'loan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200">{t.finance.loan.calculate}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.loan.amount}</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.loan.rate}</label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.loan.durationMonths}</label>
              <input
                type="number"
                value={loanMonths}
                onChange={(e) => setLoanMonths(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Results */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {t.finance.loan.monthlyPayment}
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 mt-2">
                {formatResultNumber(loanResult.monthly, isKurdish)}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.loan.totalPayment}</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatResultNumber(loanResult.total, isKurdish)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.loan.totalInterest}</span>
                <span className="font-mono font-semibold text-rose-400">
                  {formatResultNumber(loanResult.interest, isKurdish)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount & Tax Tab */}
      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200">{t.finance.tabs.discount}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.discount.originalPrice}</label>
              <input
                type="number"
                value={discOriginalPrice}
                onChange={(e) => setDiscOriginalPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.discount.discountPercent}</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.discount.taxPercent}</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {t.finance.discount.finalPrice}
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 mt-2">
                {formatResultNumber(discountResult.finalPrice, isKurdish)}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.discount.savedAmount}</span>
                <span className="font-mono font-semibold text-emerald-400">
                  -{formatResultNumber(discountResult.saved, isKurdish)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.discount.taxAmount}</span>
                <span className="font-mono font-semibold text-slate-300">
                  +{formatResultNumber(discountResult.taxAmount, isKurdish)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200">{t.finance.tabs.savings}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.savings.initialAmount}</label>
              <input
                type="number"
                value={savingsInitial}
                onChange={(e) => setSavingsInitial(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">{t.finance.savings.monthlyDeposit}</label>
              <input
                type="number"
                value={savingsMonthly}
                onChange={(e) => setSavingsMonthly(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">{t.finance.savings.annualInterest}</label>
                <input
                  type="number"
                  step="0.1"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">{t.finance.savings.years}</label>
                <input
                  type="number"
                  value={savingsYears}
                  onChange={(e) => setSavingsYears(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-lg outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {t.finance.savings.futureValue}
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 mt-2">
                {formatResultNumber(savingsResult.futureValue, isKurdish)}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.savings.totalDeposited}</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatResultNumber(savingsResult.deposited, isKurdish)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t.finance.savings.totalEarned}</span>
                <span className="font-mono font-semibold text-emerald-400">
                  +{formatResultNumber(savingsResult.earned, isKurdish)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
