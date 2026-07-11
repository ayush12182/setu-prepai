import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeNumber(val: any, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

export function safePercent(val: any): number {
  return Math.min(100, Math.max(0, safeNumber(val, 0)));
}
