import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const PLACEHOLDER_SENTENCE = "Saya bersedia untuk memulakan pembentangan ini dengan suara saya sendiri.";

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        onRecordingComplete(blob);
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

  const simulatePreview = () => {
    setIsPreviewing(true);
    // In a real app, this would call an RVC/TTS API
    // Here we just play the recorded audio back with a "cloned" label
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => setIsPreviewing(false);
      audio.play();
    } else {
      setTimeout(() => setIsPreviewing(false), 2000);
    }
  };

  return (
    <div className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Voice Cloning (10s Sample)</h3>
        {audioBlob && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      </div>

      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Read this sentence:</p>
        <p className="text-sm italic text-yellow-400/90">"{PLACEHOLDER_SENTENCE}"</p>
      </div>

      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${(duration / 10) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm"
          >
            <Mic className="w-4 h-4" />
            {audioBlob ? 'Re-record' : 'Start Recording'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors text-sm"
          >
            <Square className="w-4 h-4" />
            Stop ({10 - duration}s)
          </button>
        )}
        
        {audioBlob && !isRecording && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = URL.createObjectURL(audioBlob);
                new Audio(url).play();
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              title="Play Original"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={simulatePreview}
              disabled={isPreviewing}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold",
                isPreviewing ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
            >
              <Volume2 className={cn("w-4 h-4", isPreviewing && "animate-pulse")} />
              {isPreviewing ? 'Cloning...' : 'Preview Clone'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-white/40 italic">
        * A 10-second sample is required for the Vocalist Agent to clone your voice.
      </p>
    </div>
  );
};
