/** Utils — Shared utility functions. `cn()` merges Tailwind classes safely via clsx + twMerge. */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
