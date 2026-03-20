import React from 'react';
import { PresentationData, Theme } from './lib/utils';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

interface SlidePreviewProps {
  data: PresentationData;
  theme: Theme;
  currentSlideIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ data, theme, currentSlideIndex, onNext, onPrev }) => {
  const slide = data.slides[currentSlideIndex];

  if (!slide) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video w-full glass overflow-hidden shadow-2xl">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute inset-0 p-12 flex flex-col"
          style={{ 
            background: theme.primary.includes('linear-gradient') ? theme.primary : theme.primary,
            color: theme.primary === '#FFFFFF' || theme.primary === '#F5F5F0' ? '#1A1A1A' : '#FFFFFF',
            fontFamily: theme.font
          }}
        >
          {/* Decorative Elements based on theme */}
          <div 
            className="absolute top-0 right-0 w-1/3 h-full opacity-10"
            style={{ background: theme.accent, clipPath: 'polygon(100% 0, 20% 0, 100% 100%)' }}
          />

          <h2 className="text-4xl font-bold mb-8 relative z-10" style={{ color: theme.accent }}>
            {slide.title}
          </h2>

          <ul className="space-y-4 relative z-10 flex-grow">
            {slide.content.map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-xl flex items-start gap-3"
              >
                <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: theme.accent }} />
                {item}
              </motion.li>
            ))}
          </ul>

          <div className="mt-auto flex justify-between items-end text-sm opacity-50">
            <span>{data.title}</span>
            <span>{currentSlideIndex + 1} / {data.slides.length}</span>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center px-4">
        <button 
          onClick={onPrev}
          disabled={currentSlideIndex === 0}
          className="px-6 py-2 glass-card hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {data.slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentSlideIndex ? "bg-yellow-400 w-6" : "bg-white/20"
              )} 
            />
          ))}
        </div>
        <button 
          onClick={onNext}
          disabled={currentSlideIndex === data.slides.length - 1}
          className="px-6 py-2 glass-card hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};
