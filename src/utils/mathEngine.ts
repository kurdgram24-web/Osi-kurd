/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toKurdishDigits } from './translations';

export type AngleMode = 'DEG' | 'RAD';

// Factorial calculation with safety cap
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS Number max representation
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Format numbers with thousand separators and clean floating points
export function formatResultNumber(val: number, isKurdishDigits = false): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  // Fix tiny precision issues like 0.1 + 0.2 = 0.30000000000000004
  const rounded = Number(val.toPrecision(12));

  let str: string;
  if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    str = rounded.toExponential(6).replace(/\.?0+e/, 'e');
  } else {
    // Format integer and fractional parts
    const parts = rounded.toString().split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    str = parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
  }

  return isKurdishDigits ? toKurdishDigits(str) : str;
}

// Convert expression string into evaluatable JavaScript math expression
export function prepareMathExpression(expr: string, angleMode: AngleMode): string {
  let clean = expr;

  // Replace visual operators
  clean = clean.replace(/×/g, '*');
  clean = clean.replace(/÷/g, '/');
  clean = clean.replace(/−/g, '-');
  clean = clean.replace(/mod/g, '%');

  // Replace Constants
  clean = clean.replace(/π/g, `(${Math.PI})`);
  clean = clean.replace(/(^|[^a-zA-Z0-9])e(?=[^a-zA-Z0-9]|$)/g, `$1(${Math.E})`);

  // Handle factorials (e.g. 5! or (3+2)!)
  clean = clean.replace(/(\d+(\.\d+)?|\([^\(\)]+\))!/g, 'fact($1)');

  // Trig degree conversion helper
  const toRad = angleMode === 'DEG' ? `* (Math.PI / 180)` : '';
  const fromRad = angleMode === 'DEG' ? `* (180 / Math.PI)` : '';

  // Scientific functions
  clean = clean.replace(/sin\(/g, `Math_sin(`);
  clean = clean.replace(/cos\(/g, `Math_cos(`);
  clean = clean.replace(/tan\(/g, `Math_tan(`);
  clean = clean.replace(/asin\(/g, `Math_asin(`);
  clean = clean.replace(/acos\(/g, `Math_acos(`);
  clean = clean.replace(/atan\(/g, `Math_atan(`);
  clean = clean.replace(/sinh\(/g, `Math.sinh(`);
  clean = clean.replace(/cosh\(/g, `Math.cosh(`);
  clean = clean.replace(/tanh\(/g, `Math.tanh(`);

  clean = clean.replace(/ln\(/g, `Math.log(`);
  clean = clean.replace(/log\(/g, `Math.log10(`);
  clean = clean.replace(/sqrt\(/g, `Math.sqrt(`);
  clean = clean.replace(/cbrt\(/g, `Math.cbrt(`);
  clean = clean.replace(/abs\(/g, `Math.abs(`);

  // Power symbol ^ to Math.pow
  // Handles simple forms like a^b or (a+b)^c
  let prev = '';
  while (prev !== clean && clean.includes('^')) {
    prev = clean;
    clean = clean.replace(/([0-9.]+|\([^()]*\))\s*\^\s*([0-9.]+|\([^()]*\))/g, 'Math.pow($1, $2)');
  }

  // Percentage handling: e.g. 200 * 15% -> 200 * 0.15 or 50% -> (50/100)
  clean = clean.replace(/([0-9.]+)%/g, '($1 * 0.01)');

  return clean;
}

// Safe evaluation function
export function evaluateExpression(expr: string, angleMode: AngleMode = 'DEG'): { result: number | null; error: string | null } {
  const trimmed = expr.trim();
  if (!trimmed) return { result: null, error: null };

  try {
    const prepared = prepareMathExpression(trimmed, angleMode);

    // Context functions for math execution
    const Math_sin = (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      // Precision fix for values like sin(180 deg) = 0
      const val = Math.sin(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    };
    const Math_cos = (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      // Precision fix for values like cos(90 deg) = 0
      const val = Math.cos(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    };
    const Math_tan = (x: number) => {
      const rad = angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
      const cosVal = Math.cos(rad);
      if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined');
      const val = Math.tan(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    };
    const Math_asin = (x: number) => {
      const rad = Math.asin(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    };
    const Math_acos = (x: number) => {
      const rad = Math.acos(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    };
    const Math_atan = (x: number) => {
      const rad = Math.atan(x);
      return angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
    };
    const fact = (x: number) => factorial(x);

    // Whitelist check
    if (!/^[0-9+\-*/%^()., \t\r\n]|Math|fact|sinh|cosh|tanh|log|sqrt|cbrt|abs|pow|PI|E|Math_sin|Math_cos|Math_tan|Math_asin|Math_acos|Math_atan/.test(prepared)) {
      return { result: null, error: 'Invalid Expression' };
    }

    // Evaluate in closed functional context
    const fn = new Function(
      'Math',
      'fact',
      'Math_sin',
      'Math_cos',
      'Math_tan',
      'Math_asin',
      'Math_acos',
      'Math_atan',
      `"use strict"; return (${prepared});`
    );

    const val = fn(
      Math,
      fact,
      Math_sin,
      Math_cos,
      Math_tan,
      Math_asin,
      Math_acos,
      Math_atan
    );

    if (typeof val !== 'number' || isNaN(val)) {
      return { result: null, error: 'Error' };
    }

    return { result: val, error: null };
  } catch (err) {
    return { result: null, error: (err as Error)?.message || 'Error' };
  }
}
