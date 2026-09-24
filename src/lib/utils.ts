import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/21st.dev convention — every registry component imports this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
