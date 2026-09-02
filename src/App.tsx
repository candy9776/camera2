import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStep, CapturedPhoto, FilterType, PhotoBoothSettings } from './types';
import { Header } from './components/Header';
import { DecorativeBackground } from './components/DecorativeBackground';
import { CameraView } from './components/CameraView';
import { PhotoSelectView } from './components/PhotoSelectView';
import { FrameCustomizer } from './components/FrameCustomizer';
import { ResultView } from './components/ResultView';

const getInitialDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function App() {
  const [step, setStep] = useState<AppStep>('ready');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const [settings, setSettings] = useState<PhotoBoothSettings>({
    timerSeconds: 3,
    soundEnabled: true,
    mirrored: true,
    selectedFilter: 'normal',
    layout: 'strip',
    selectedFrameId: 'yellow_chick',
    className: '햇살가득 햇님반 ☀️',
    dateText: getInitialDateString(),
    sloganText: '우리들은 언제나 단짝친구! 💕',
    showDate: true,
    showClassName: true,
    showSlogan: true,
    showLogoBadge: true,
    placedStickers: [],
  });

  const updateSettings = (newPartial: Partial<PhotoBoothSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  // Step Handlers
  const handlePhotosCaptured = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    // Auto-select first 4 photos by default
    const initial4 = photos.slice(0, 4).map((p) => p.id);
    setSelectedPhotoIds(initial4);
    setStep('select');
  };

  const handleSelectComplete = () => {
    setStep('customize');
  };

  const handleCustomizeComplete = () => {
    setStep('result');
  };

  const handleResetSession = () => {
    setCapturedPhotos([]);
    setSelectedPhotoIds([]);
    setStep('ready');
  };

  // Filter 4 selected photos
  const selected4Photos = selectedPhotoIds
    .map((id) => capturedPhotos.find((p) => p.id === id))
    .filter(Boolean) as CapturedPhoto[];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-slate-800 font-sans selection:bg-amber-200">
      <DecorativeBackground />

      {/* Main Header */}
      <Header
        currentStep={step}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        onReset={handleResetSession}
        classNameTitle={settings.className}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {step === 'ready' || step === 'shooting' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <CameraView
                onComplete={handlePhotosCaptured}
                soundEnabled={settings.soundEnabled}
                mirrored={settings.mirrored}
                onToggleMirror={() => updateSettings({ mirrored: !settings.mirrored })}
                selectedFilter={settings.selectedFilter}
                onChangeFilter={(f: FilterType) => updateSettings({ selectedFilter: f })}
              />
            </motion.div>
          ) : step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <PhotoSelectView
                photos={capturedPhotos}
                selectedPhotoIds={selectedPhotoIds}
                onSelectPhotos={setSelectedPhotoIds}
                onNext={handleSelectComplete}
                onRetake={handleResetSession}
                soundEnabled={settings.soundEnabled}
              />
            </motion.div>
          ) : step === 'customize' ? (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <FrameCustomizer
                photos={selected4Photos}
                settings={settings}
                onUpdateSettings={updateSettings}
                onBack={() => setStep('select')}
                onFinish={handleCustomizeComplete}
                soundEnabled={settings.soundEnabled}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <ResultView
                photos={selected4Photos}
                settings={settings}
                onEditFrame={() => setStep('customize')}
                onRestart={handleResetSession}
                soundEnabled={settings.soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Kindergarten Footer Note */}
      <footer className="w-full py-2.5 text-center text-xs text-amber-800/60 font-['Gowun_Dodum'] border-t border-amber-100/60 bg-white/40 backdrop-blur-sm">
        🐥 우리반 네컷 • 유치원 추억 만들기 포토부스
      </footer>
    </div>
  );
}
