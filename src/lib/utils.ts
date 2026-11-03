import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Путь с учётом base (на случай публикации не в корне домена). */
export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
