import type { BaselineOption } from '../types/app';

export const baselineOptions: { value: BaselineOption; label: string }[] = [
  { value: '0', label: '0' },
  { value: '1-2', label: '1-2' },
  { value: '3-5', label: '3-5' },
  { value: '6-10', label: '6-10' },
  { value: '11+', label: '11+' }
];

export const goalPresets = [5, 8, 10, 12, 15, 20];

export const storageKey = 'pullup-pal-state-v1';
