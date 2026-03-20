import { PresentationData, Theme } from './lib/utils';
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
