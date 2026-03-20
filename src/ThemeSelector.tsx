import React from 'react';
import { VISUAL_THEMES, Theme } from './lib/utils';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

interface ThemeSelectorProps {
  selectedThemeId: number;
  onSelect: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {VISUAL_THEMES.map((theme) => (
        <motion.button
          key={theme.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(theme)}
          className={cn(
            "p-4 glass-card text-left relative overflow-hidden group min-h-[100px] flex flex-col justify-between",
            selectedThemeId === theme.id && "ring-2 ring-yellow-400/50 bg-white/10"
          )}
        >
          <div 
            className="absolute top-0 right-0 w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ 
              background: theme.primary.includes('gradient') ? theme.primary : theme.accent,
              clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
            }}
          />
          
          <div>
            <h4 className="text-sm font-bold truncate">{theme.name}</h4>
            <p className="text-[10px] text-white/40 line-clamp-2 leading-tight mt-1">
              {theme.description}
            </p>
          </div>

          <div className="flex gap-1 mt-2">
            <div className="w-3 h-3 rounded-full" style={{ background: theme.primary }} />
            <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
          </div>
        </motion.button>
      ))}
    </div>
  );
};
