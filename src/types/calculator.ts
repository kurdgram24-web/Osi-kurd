/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CalculatorMode = 'standard' | 'scientific' | 'converter' | 'finance' | 'date';

export type Language = 'ku' | 'en';

export type NumberFormat = 'standard' | 'kurdish';

export type ThemeMode = 'dark' | 'oled' | 'light';

export interface CalculationRecord {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  mode: CalculatorMode;
}

export type UnitCategoryId =
  | 'currency'
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'data'
  | 'speed'
  | 'time';

export interface UnitDefinition {
  id: string;
  nameKu: string;
  nameEn: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  nameKu: string;
  nameEn: string;
  icon: string;
  units: UnitDefinition[];
  defaultFrom: string;
  defaultTo: string;
}

export type FinanceTab = 'loan' | 'discount' | 'savings';
