import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Sliders,
  Share2,
  Check,
  Heart,
  Copy,
  FileImage
} from 'lucide-react';
import { CapturedPhoto, PhotoBoothSettings } from '../types';
import { FRAME_THEMES } from '../constants/frames';
import { renderPhotoCanvas } from '../utils/canvasRenderer';
import { playCelebrationFanfare, playPopSound } from '../utils/audio';

interface ResultViewProps {
  photos: CapturedPhoto[];
  settings: PhotoBoothSettings;
  onEditFrame: () => void;
  onRestart: () => void;
  soundEnabled: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  photos,
  settings,
  onEditFrame,
  onRestart,
  soundEnabled,
}) => {
  const [renderedDataUrl, setRenderedDataUrl] = useState<string>('');
  const [twinStripDataUrl, setTwinStripDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [printTwinMode, setPrintTwinMode] = useState<boolean>(settings.layout === 'strip');

  const theme = FRAME_THEMES.find((f) => f.id === settings.selectedFrameId) || FRAME_THEMES[0];

  // Render canvas on mount
  useEffect(() => {
    let isMounted = true;

    async function generate() {
      try {
        setIsGenerating(true);
        // Single image render
        const canvas = await renderPhotoCanvas(photos, settings, theme, { twinStripForPrint: false });
        if (isMounted) {
          setRenderedDataUrl(canvas.toDataURL('image/png'));
        }

        // Twin strip render (for 2-in-1 print paper)
        if (settings.layout === 'strip') {
          const twinCanvas = await renderPhotoCanvas(photos, settings, theme, { twinStripForPrint: true });
          if (isMounted) {
            setTwinStripDataUrl(twinCanvas.toDataURL('image/png'));
          }
        }

        setIsGenerating(false);

        // Burst confetti!
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#F43F5E', '#10B981', '#3B82F6', '#8B5CF6'],
        });

        playCelebrationFanfare(soundEnabled);
      } catch (err) {
        console.error('Render error', err);
        setIsGenerating(false);
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [photos, settings, theme, soundEnabled]);

  // Download high-resolution PNG
  const handleDownload = (useTwin = false) => {
    playPopSound(soundEnabled);
    const targetUrl = useTwin && twinStripDataUrl ? twinStripDataUrl : renderedDataUrl;
    if (!targetUrl) return;

    const link = document.createElement('a');
    const safeClassName = (settings.className || '우리반_네컷').replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `${safeClassName}_${dateStr}${useTwin ? '_트윈' : ''}.png`;
    link.href = targetUrl;
    link.click();
  };

  // Print function
  const handlePrint = () => {
    playPopSound(soundEnabled);
    const targetUrl = printTwinMode && twinStripDataUrl ? twinStripDataUrl : renderedDataUrl;
    if (!targetUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${settings.className || '우리반 네컷'}</title>
          <style>
            @page {
              size: auto;
              margin: 8mm;
            }
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #ffffff;
            }
            img {
              max-width: 95vw;
              max-height: 95vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${targetUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    playPopSound(soundEnabled);
    if (!renderedDataUrl) return;
    try {
      const response = await fetch(renderedDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
      alert('클립보드 복사를 지원하지 않는 브라우저입니다. 다운로드 버튼을 이용해주세요.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Celebration Header */}
      <div className="text-center mb-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-['Jua'] px-5 py-2 rounded-full shadow-md text-base mb-2 border-2 border-white"
        >
          <Sparkles size={18} className="animate-spin" />
          <span>축하합니다! 우리반 네컷 사진이 완성되었어요 🎉</span>
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-950">
          {settings.className || '우리들의 소중한 네컷 추억'}
        </h2>
        <p className="text-sm text-amber-800/80 font-['Gowun_Dodum'] mt-1">
          컴퓨터나 스마트폰에 고화질로 저장하거나 바로 인쇄해서 소장하세요!
        </p>
      </div>

      {/* Rendered Artwork Display */}
      <div className="w-full flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border-4 border-amber-300 max-w-sm sm:max-w-md w-full flex justify-center items-center overflow-hidden"
        >
          {isGenerating ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-['Jua'] text-amber-900 text-base">고화질 사진을 만드는 중입니다...</p>
            </div>
          ) : (
            <img
              src={printTwinMode && twinStripDataUrl ? twinStripDataUrl : renderedDataUrl}
              alt="완성된 우리반 네컷"
              className="w-full h-auto rounded-2xl object-contain shadow-sm"
            />
          )}
        </motion.div>
      </div>

      {/* Action Buttons Grid */}
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-amber-200 shadow-md space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* High-res Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload(false)}
            disabled={isGenerating}
            className="w-full py-4 px-5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-['Jua'] text-lg rounded-2xl shadow-lg shadow-amber-300/50 flex items-center justify-center gap-2 border-2 border-white transition-all cursor-pointer"
          >
            <Download size={22} />
            <span>고화질 사진 다운로드 (PNG)</span>
          </motion.button>

          {/* Direct Print Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            disabled={isGenerating}
            className="w-full py-4 px-5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-emerald-950 font-['Jua'] text-lg rounded-2xl shadow-lg shadow-emerald-300/50 flex items-center justify-center gap-2 border-2 border-white transition-all cursor-pointer"
          >
            <Printer size={22} />
            <span>사진 인쇄하기 (프린터)</span>
          </motion.button>
        </div>

        {/* Secondary Actions: Twin Strip & Clipboard */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100">
          {settings.layout === 'strip' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playPopSound(soundEnabled);
                  setPrintTwinMode(!printTwinMode);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-['Jua'] border transition-all ${
                  printTwinMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                ✂️ 2컷 나란히 인쇄용 ({printTwinMode ? 'ON' : 'OFF'})
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-['Jua'] border border-slate-200 transition-colors"
            >
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{isCopied ? '복사 완료!' : '이미지 복사'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => {
            playPopSound(soundEnabled);
            onEditFrame();
          }}
          className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-amber-50 text-amber-900 font-['Jua'] text-sm rounded-2xl border border-amber-200 shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sliders size={16} />
          <span>프레임/문구 다시 수정하기</span>
        </button>

        <button
          onClick={() => {
            playPopSound(soundEnabled);
            onRestart();
          }}
          className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-['Jua'] text-sm rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>새로운 네컷 다시 찍기 📸</span>
        </button>
      </div>
    </div>
  );
};
