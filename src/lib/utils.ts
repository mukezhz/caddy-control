import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitialsForAvatar = (text: string) => {
  if (!text) return "XO";

  const words = text.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  return firstWord[0].toUpperCase() + lastWord[0].toUpperCase();
};
