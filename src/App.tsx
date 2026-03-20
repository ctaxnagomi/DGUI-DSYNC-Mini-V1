import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Layout, 
  Mic2, 
  Download, 
  Globe, 
  Settings2, 
  ChevronRight, 
  Loader2,
  Presentation,
  FileText,
  Video,
  FileDown,
  Languages,
  Image as ImageIcon,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, VISUAL_THEMES, Theme, PresentationData } from './lib/utils';
import { analyzeContent, analyzeImageConfig } from './lib/gemini';
import { ThemeSelector } from './ThemeSelector';
import { VoiceRecorder } from './VoiceRecorder';
import { SlidePreview } from './SlidePreview';
import { exportToPptx, exportToPdf, exportToDocx } from './lib/export';

export default function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVisualArchitecting, setIsVisualArchitecting] = useState(false);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(VISUAL_THEMES[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    length: 'Medium (11-30 slides)',
    density: 'Auto',
    tone: 'Professional',
    language: 'English'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeContent(url, settings);
      setPresentation(data);
      setCurrentSlide(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVisualArchitecting(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const config = await analyzeImageConfig(base64);
        if (config) {
          if (config.suggestedTheme) {
            const matchedTheme = VISUAL_THEMES.find(t => t.name.toLowerCase().includes(config.suggestedTheme.name.toLowerCase()));
            if (matchedTheme) setSelectedTheme(matchedTheme);
          }
          if (config.suggestedSettings) {
            setSettings(prev => ({
              ...prev,
              tone: config.suggestedSettings.tone || prev.tone,
              density: config.suggestedSettings.density || prev.density
            }));
          }
        }
      } catch (err) {
        console.error('Visual Architecting failed', err);
      } finally {
        setIsVisualArchitecting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass flex items-center justify-center text-yellow-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DGUI DSYNC-Mini <span className="text-yellow-400">V1</span></h1>
            <p className="text-sm text-white/40">Agentic Presentation Architect</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 glass-card text-xs font-mono text-white/60">
            STATUS: <span className="text-emerald-400">READY</span>
          </div>
          <div className="px-4 py-2 glass-card text-xs font-mono text-white/60">
            ENGINE: <span className="text-yellow-400">GEMINI-3.1</span>
          </div>
        </div>
      </header>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="glass p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Input Source</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <ImageIcon className="w-3 h-3" /> Visual Architect
                </button>
              </label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div className="relative">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube or Web URL..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-yellow-400 text-black rounded-lg text-xs font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  GENERATE
                </button>
              </div>
              {isVisualArchitecting && (
                <p className="text-[10px] text-yellow-400 animate-pulse flex items-center gap-1">
                  <Loader2 className="w-2 h-2 animate-spin" /> Analyzing image for style...
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="w-3 h-3" /> Architect Settings
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/30 ml-1 flex items-center gap-1">
                    <Languages className="w-2 h-2" /> Language
                  </span>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option>English</option>
                    <option>Bahasa Malaysia</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-white/30 ml-1">Length (15-35 slides)</span>
                  <select 
                    value={settings.length}
                    onChange={(e) => setSettings(s => ({ ...s, length: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option>Medium (15-25 slides)</option>
                    <option>Long (25-35 slides)</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-white/30 ml-1">Density</span>
                  <select 
                    value={settings.density}
                    onChange={(e) => setSettings(s => ({ ...s, density: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option>Auto</option>
                    <option>Concise</option>
                    <option>Detailed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-white/30 ml-1">Tone</span>
                  <select 
                    value={settings.tone}
                    onChange={(e) => setSettings(s => ({ ...s, tone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option>Professional</option>
                    <option>Academic</option>
                    <option>Casual</option>
                    <option>Storytelling</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <VoiceRecorder onRecordingComplete={setVoiceBlob} />

          {presentation && (
            <section className="glass p-6 space-y-4">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Download className="w-3 h-3" /> Export Engine
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => exportToPptx(presentation, selectedTheme)}
                  className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-white/10 text-[10px] font-bold"
                >
                  <Presentation className="w-3 h-3 text-orange-400" /> PPTX
                </button>
                <button 
                  onClick={() => exportToPdf('slide-container', presentation.title)}
                  className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-white/10 text-[10px] font-bold"
                >
                  <FileText className="w-3 h-3 text-red-400" /> PDF
                </button>
                <button 
                  onClick={() => exportToDocx(presentation)}
                  className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-white/10 text-[10px] font-bold"
                >
                  <FileDown className="w-3 h-3 text-blue-400" /> DOCX
                </button>
                <button className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-white/10 text-[10px] font-bold opacity-50 cursor-not-allowed">
                  <Video className="w-3 h-3 text-purple-400" /> MP4 (BETA)
                </button>
              </div>
            </section>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!presentation ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-[600px] glass flex flex-col items-center justify-center text-center p-12 space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                  <Layout className="w-10 h-10 text-white/20" />
                </div>
                <div className="max-w-md">
                  <h2 className="text-xl font-bold mb-2">Ready to Architect</h2>
                  <p className="text-sm text-white/40">
                    Paste a URL on the left to begin the autonomous analysis. The Design Agent will then compose your slides based on your selected theme.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div id="slide-container">
                  <SlidePreview 
                    data={presentation} 
                    theme={selectedTheme} 
                    currentSlideIndex={currentSlide}
                    onNext={() => setCurrentSlide(s => Math.min(presentation.slides.length - 1, s + 1))}
                    onPrev={() => setCurrentSlide(s => Math.max(0, s - 1))}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Visual Themes
                  </label>
                  <ThemeSelector 
                    selectedThemeId={selectedTheme.id} 
                    onSelect={setSelectedTheme} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
