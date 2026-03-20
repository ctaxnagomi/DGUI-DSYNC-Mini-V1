import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, CheckCircle2, AlertCircle, Volume2, User, UserPlus, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface VocalistAgentProps {
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
}

export interface VoiceSettings {
  model: 'male' | 'female' | 'custom';
  isCloned: boolean;
  audioBlob: Blob | null;
}

const PLACEHOLDER_SENTENCE = "Saya bersedia untuk memulakan pembentangan ini dengan suara saya sendiri.";

export const VocalistAgent: React.FC<VocalistAgentProps> = ({ onVoiceSettingsChange }) => {
  const [model, setModel] = useState<'male' | 'female' | 'custom'>('male');
  const [isRecording, setIsRecording] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isCloned, setIsCloned] = useState(false);
  const [cloningProgress, setCloningProgress] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    onVoiceSettingsChange({ model, isCloned, audioBlob });
  }, [model, isCloned, audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setIsCloned(false);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleClone = async () => {
    if (!audioBlob) return;
    setIsCloning(true);
    setCloningProgress(0);

    const duration = 3000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      setCloningProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    await new Promise(resolve => setTimeout(resolve, duration));
    
    clearInterval(interval);
    setCloningProgress(100);
    setIsCloning(false);
    setIsCloned(true);
  };

  const handleReset = () => {
    setAudioBlob(null);
    setIsCloned(false);
    setDuration(0);
  };

  const playOriginal = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const simulatePreview = () => {
    setIsPreviewing(true);
    if (model === 'custom' && audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => setIsPreviewing(false);
      audio.play();
    } else {
      // Mock AI voice preview
      setTimeout(() => setIsPreviewing(false), 2000);
    }
  };

  return (
    <div className="p-6 glass space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
          <Mic className="w-3 h-3" /> Vocalist Agent
        </h3>
        {isCloned && model === 'custom' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Clone Ready</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setModel('male')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 glass-card transition-all",
            model === 'male' && "ring-1 ring-yellow-400/50 bg-white/5"
          )}
        >
          <User className={cn("w-5 h-5", model === 'male' ? "text-yellow-400" : "text-white/20")} />
          <span className="text-[10px] font-bold uppercase">Studio Male</span>
        </button>
        <button
          onClick={() => setModel('female')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 glass-card transition-all",
            model === 'female' && "ring-1 ring-yellow-400/50 bg-white/5"
          )}
        >
          <User className={cn("w-5 h-5", model === 'female' ? "text-pink-400" : "text-white/20")} />
          <span className="text-[10px] font-bold uppercase">Studio Female</span>
        </button>
        <button
          onClick={() => setModel('custom')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 glass-card transition-all",
            model === 'custom' && "ring-1 ring-yellow-400/50 bg-white/5"
          )}
        >
          <UserPlus className={cn("w-5 h-5", model === 'custom' ? "text-emerald-400" : "text-white/20")} />
          <span className="text-[10px] font-bold uppercase">Custom Clone</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {model === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Training Sentence:</p>
              <p className="text-sm italic text-yellow-400/90 leading-relaxed">"{PLACEHOLDER_SENTENCE}"</p>
            </div>

            {isCloning ? (
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-yellow-400">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Voice Patterns...
                  </span>
                  <span>{Math.round(cloningProgress)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-yellow-400"
                    initial={{ width: "0%" }}
                    animate={{ width: `${cloningProgress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(duration / 10) * 100}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              {!isRecording && !isCloning && !isCloned && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-xs font-bold"
                >
                  <Mic className="w-3 h-3" />
                  {audioBlob ? 'Re-record' : 'Record Sample'}
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors text-xs font-bold"
                >
                  <Square className="w-3 h-3" />
                  Stop ({10 - duration}s)
                </button>
              )}

              {audioBlob && !isRecording && !isCloned && !isCloning && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClone}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-full transition-all text-xs font-bold hover:bg-yellow-300"
                  >
                    <Wand2 className="w-3 h-3" />
                    Clone Voice
                  </button>
                  <button
                    onClick={playOriginal}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    title="Replay Sample"
                  >
                    <Play className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              )}

              {isCloned && !isCloning && (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={simulatePreview}
                    disabled={isPreviewing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full transition-all text-xs font-bold border border-emerald-500/30"
                  >
                    <Volume2 className={cn("w-3 h-3", isPreviewing && "animate-pulse")} />
                    {isPreviewing ? 'Previewing...' : 'Preview Clone'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors text-white/40"
                    title="Reset & Start Over"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {(model === 'male' || model === 'female') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", model === 'male' ? "bg-yellow-400/20" : "bg-pink-400/20")}>
                <User className={cn("w-4 h-4", model === 'male' ? "text-yellow-400" : "text-pink-400")} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Studio {model === 'male' ? 'Male' : 'Female'}</p>
                <p className="text-[10px] text-white/40">High-fidelity AI narration model</p>
              </div>
            </div>
            <button
              onClick={simulatePreview}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <Volume2 className="w-4 h-4 text-white/60" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-white/30 italic leading-tight">
        * Voice settings will be applied to the MP4 export for autonomous slide narration.
      </p>
    </div>
  );
};
