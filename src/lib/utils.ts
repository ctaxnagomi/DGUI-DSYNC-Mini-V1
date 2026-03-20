import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Theme {
  id: number;
  name: string;
  primary: string;
  accent: string;
  font: string;
  description: string;
}

export interface Slide {
  title: string;
  content: string[];
  imagePrompt?: string;
  imageUrl?: string;
  speakerNotes?: string;
}

export interface PresentationData {
  title: string;
  slides: Slide[];
  summary: string;
}

export const VISUAL_THEMES: Theme[] = [
  { id: 1, name: "Modern Sans", primary: "#FFFFFF", accent: "#000000", font: "Inter", description: "Clean, high-contrast minimalist design." },
  { id: 2, name: "Executive Dark", primary: "#0A0A0A", accent: "#FFD700", font: "Outfit", description: "Sophisticated dark mode with gold accents." },
  { id: 3, name: "Editorial Serif", primary: "#F9F9F7", accent: "#2D2D2D", font: "Playfair Display", description: "Classic magazine-style typography." },
  { id: 4, name: "Tech Grotesk", primary: "#000000", accent: "#38BDF8", font: "Space Grotesk", description: "Modern technical aesthetic with blue highlights." },
  { id: 5, name: "Geometric Light", primary: "#FFFFFF", accent: "#6366F1", font: "Montserrat", description: "Vibrant geometric style for creative pitches." },
  { id: 6, name: "Elegant Ivory", primary: "#F5F2ED", accent: "#5A5A40", font: "Cormorant Garamond", description: "Refined, human-centric organic design." },
  { id: 7, name: "Data Mono", primary: "#111111", accent: "#00FF41", font: "JetBrains Mono", description: "Precise, developer-focused technical layout." },
  { id: 8, name: "Minimal Slate", primary: "#0F172A", accent: "#94A3B8", font: "Inter", description: "Professional utility with muted tones." },
];
