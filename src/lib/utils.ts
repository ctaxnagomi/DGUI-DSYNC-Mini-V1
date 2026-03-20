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
}

export interface PresentationData {
  title: string;
  slides: Slide[];
  summary: string;
}

export const VISUAL_THEMES: Theme[] = [
  { id: 1, name: "Simple Play", primary: "#FFFFFF", accent: "#FF8C00", font: "Inter", description: "Minimalist white with geometric line art." },
  { id: 2, name: "Cyber Pitch", primary: "#000000", accent: "#FFD700", font: "JetBrains Mono", description: "High-contrast dark mode with neon yellow highlights." },
  { id: 3, name: "Executive Glass", primary: "rgba(255,255,255,0.1)", accent: "#FFFFFF", font: "Helvetica", description: "Frosted glass overlays with professional sans-serif." },
  { id: 4, name: "Academic Ivory", primary: "#F5F5F0", accent: "#2F4F4F", font: "Playfair Display", description: "Traditional serif typography for research and lectures." },
  { id: 5, name: "Midnight Coach", primary: "#0B1120", accent: "#38BDF8", font: "Oswald", description: "Tactical sports-board style with blueprint elements." },
  { id: 6, name: "Solarized Light", primary: "#FDF6E3", accent: "#B58900", font: "Roboto", description: "Optimized for readability and long-form education." },
  { id: 7, name: "Industrial Mono", primary: "#1A1A1A", accent: "#808080", font: "Impact", description: "Bold, brutalist design for impactful business decks." },
  { id: 8, name: "Botanical Soft", primary: "#E8F3E8", accent: "#2D5A27", font: "Lato", description: "Organic shapes with soft green earth tones." },
  { id: 9, name: "Neon Grid", primary: "#050505", accent: "#00FF41", font: "Courier Prime", description: "Matrix-style coding aesthetic." },
  { id: 10, name: "Royal Gold", primary: "#121212", accent: "#D4AF37", font: "Cinzel", description: "Luxurious black background with gold foil accents." },
  { id: 11, name: "Vaporwave", primary: "#FF71CE", accent: "#01CDFE", font: "VCR OSD Mono", description: "80s retro-futurism with pink and teal gradients." },
  { id: 12, name: "Blueprint Pro", primary: "#0047AB", accent: "#FFFFFF", font: "Architects Daughter", description: "Engineering drawing style with white pencil text." },
  { id: 13, name: "Deep Space", primary: "#000000", accent: "#6366F1", font: "Space Grotesk", description: "Stars and nebula textures with modern tech fonts." },
  { id: 14, name: "Swiss Modern", primary: "#FFFFFF", accent: "#E30613", font: "Akzidenz-Grotesk", description: "Grid-based clean layout with red accents." },
  { id: 15, name: "Sunset Gradient", primary: "linear-gradient(to right, #ff7e5f, #feb47b)", accent: "#FFFFFF", font: "Montserrat", description: "Vibrant warm colors for creative pitches." },
];
