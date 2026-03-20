import { PresentationData, Theme } from './utils';
import { VoiceSettings } from '../VoiceRecorder';
import { generateNarration } from './gemini';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportToPptx(data: PresentationData, theme: Theme) {
  const pres = new pptxgen();
  pres.title = data.title;

  data.slides.forEach((slideData) => {
    const slide = pres.addSlide();
    
    // Background
    if (theme.primary.includes('gradient')) {
      slide.background = { color: theme.accent }; // Simplified for PPTX
    } else {
      slide.background = { color: theme.primary.replace('#', '') };
    }

    slide.addText(slideData.title, {
      x: 0.5, y: 0.5, w: '90%', h: 1,
      fontSize: 32,
      bold: true,
      color: theme.accent.replace('#', ''),
      fontFace: theme.font
    });

    slideData.content.forEach((text, i) => {
      slide.addText(text, {
        x: 0.7, y: 1.5 + (i * 0.6), w: '85%', h: 0.5,
        fontSize: 18,
        bullet: true,
        color: (theme.primary === '#FFFFFF' || theme.primary === '#F5F5F0') ? '1A1A1A' : 'FFFFFF',
        fontFace: theme.font
      });
    });
  });

  return pres.writeFile({ fileName: `${data.title.replace(/\s+/g, '_')}.pptx` });
}

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0D0D0D'
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
}

export async function exportToDocx(data: PresentationData) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: data.title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: data.summary,
          spacing: { after: 400 },
        }),
        ...data.slides.flatMap(slide => [
          new Paragraph({
            text: slide.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          ...slide.content.map(point => new Paragraph({
            text: point,
            bullet: { level: 0 },
          }))
        ])
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title.replace(/\s+/g, '_')}.docx`;
  link.click();
}

function pcmToAudioBuffer(pcmData: Uint8Array, audioContext: AudioContext, sampleRate = 24000): AudioBuffer {
  const float32Data = new Float32Array(pcmData.length / 2);
  for (let i = 0; i < float32Data.length; i++) {
    const low = pcmData[i * 2];
    const high = pcmData[i * 2 + 1];
    let int16 = (high << 8) | low;
    if (int16 >= 0x8000) int16 -= 0x10000;
    float32Data[i] = int16 / 0x8000;
  }
  const buffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
  buffer.copyToChannel(float32Data, 0);
  return buffer;
}

export async function exportToMp4(
  data: PresentationData, 
  theme: Theme, 
  voiceSettings: VoiceSettings,
  onProgress?: (progress: number) => void
) {
  const totalSlides = data.slides.length;
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;
  
  const videoStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...destination.stream.getAudioTracks()
  ]);
  
  const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
  const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
  
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  
  mediaRecorder.start();
  
  try {
    for (let i = 0; i < totalSlides; i++) {
      if (onProgress) onProgress((i / totalSlides) * 100);
      
      const slide = data.slides[i];
      const narrationText = `${slide.title}. ${slide.content.join('. ')}`;
      
      // Generate audio
      const base64Audio = await generateNarration(narrationText, voiceSettings);
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      } catch (e) {
        // Fallback to raw PCM if decoding fails
        audioBuffer = pcmToAudioBuffer(bytes, audioContext);
      }
      
      // Capture slide
      const tempDiv = document.createElement('div');
      tempDiv.className = 'export-temp-slide'; // Add class for potential CSS isolation
      tempDiv.style.width = '1920px';
      tempDiv.style.height = '1080px';
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.background = theme.primary;
      tempDiv.style.color = (theme.primary === '#FFFFFF' || theme.primary === '#F5F5F0') ? '#1A1A1A' : '#FFFFFF';
      tempDiv.style.fontFamily = theme.font;
      tempDiv.style.padding = '80px';
      tempDiv.style.display = 'flex';
      tempDiv.style.flexDirection = 'column';
      tempDiv.style.justifyContent = 'center';
      
      // Force HEX colors to avoid oklab/oklch issues with html2canvas
      const accentColor = theme.accent.startsWith('#') ? theme.accent : '#FFD700';
      const textColor = (theme.primary === '#FFFFFF' || theme.primary === '#F5F5F0') ? '#1A1A1A' : '#FFFFFF';

      tempDiv.innerHTML = `
        <style>
          .export-temp-slide * { color: inherit !important; }
          .export-temp-slide h1 { color: ${accentColor} !important; }
        </style>
        <h1 style="font-size: 80px; margin-bottom: 40px; font-weight: bold;">${slide.title}</h1>
        <ul style="font-size: 40px; line-height: 1.6; list-style-type: disc; padding-left: 40px;">
          ${slide.content.map(item => `<li style="margin-bottom: 20px;">${item}</li>`).join('')}
        </ul>
      `;
      document.body.appendChild(tempDiv);
      
      const slideCanvas = await html2canvas(tempDiv, { 
        scale: 1,
        logging: false,
        useCORS: true,
        backgroundColor: theme.primary.includes('gradient') ? null : theme.primary
      });
      document.body.removeChild(tempDiv);
      
      // Draw to main canvas
      ctx.drawImage(slideCanvas, 0, 0, 1920, 1080);
      
      // Play audio to the destination stream
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(destination);
      source.start();
      
      // Wait for audio to finish
      await new Promise(resolve => setTimeout(resolve, audioBuffer.duration * 1000));
    }
    
    if (onProgress) onProgress(100);
    mediaRecorder.stop();
    
    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.title.replace(/\s+/g, '_')}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        link.click();
        audioContext.close();
        resolve();
      };
    });
  } catch (error) {
    mediaRecorder.stop();
    audioContext.close();
    throw error;
  }
}
