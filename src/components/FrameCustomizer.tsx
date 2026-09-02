import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Palette,
  Layout,
  Type,
  Smile,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Calendar,
  Trash2,
  RotateCw,
  Plus,
  Heart
} from 'lucide-react';
import { CapturedPhoto, FrameTheme, LayoutMode, PhotoBoothSettings, PlacedSticker, Sticker } from '../types';
import { FRAME_THEMES, STICKERS, CLASS_NAME_PRESETS, SLOGAN_PRESETS } from '../constants/frames';
import { playPopSound } from '../utils/audio';

interface FrameCustomizerProps {
  photos: CapturedPhoto[];
  settings: PhotoBoothSettings;
  onUpdateSettings: (newSettings: Partial<PhotoBoothSettings>) => void;
  onBack: () => void;
  onFinish: () => void;
  soundEnabled: boolean;
}

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  photos,
  settings,
  onUpdateSettings,
  onBack,
  onFinish,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'frame' | 'layout' | 'text' | 'stickers'>('frame');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = FRAME_THEMES.find((f) => f.id === settings.selectedFrameId) || FRAME_THEMES[0];

  // Add a sticker to center of the frame
  const handleAddSticker = (sticker: Sticker) => {
    playPopSound(soundEnabled);
    const newSticker: PlacedSticker = {
      id: `placed_${Date.now()}_${Math.random()}`,
      stickerId: sticker.id,
      emoji: sticker.emoji,
      xPercent: 50 + (Math.random() * 20 - 10),
      yPercent: 40 + (Math.random() * 20 - 10),
      size: 42,
      rotation: Math.floor(Math.random() * 30 - 15),
    };
    onUpdateSettings({
      placedStickers: [...settings.placedStickers, newSticker],
    });
    setSelectedStickerId(newSticker.id);
  };

  const handleRemoveSticker = (id: string) => {
    playPopSound(soundEnabled);
    onUpdateSettings({
      placedStickers: settings.placedStickers.filter((s) => s.id !== id),
    });
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const handleRotateSticker = (id: string) => {
    playPopSound(soundEnabled);
    onUpdateSettings({
      placedStickers: settings.placedStickers.map((s) =>
        s.id === id ? { ...s, rotation: (s.rotation + 25) % 360 } : s
      ),
    });
  };

  const handleClearAllStickers = () => {
    playPopSound(soundEnabled);
    onUpdateSettings({ placedStickers: [] });
    setSelectedStickerId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 border border-amber-300 px-4 py-1.5 rounded-full shadow-sm text-sm font-['Jua'] mb-1">
          <span>🎨 우리반만의 특별한 네컷 프레임으로 꾸며보세요!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-950">
          프레임 & 스티커 꾸미기
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Live Frame Preview Container */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-amber-200 shadow-xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-['Jua'] text-amber-900 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" /> 실시간 완성 미리보기
              </span>
              <span className="text-xs font-['Gowun_Dodum'] text-amber-800/80">
                {settings.layout === 'strip' ? '세로 1x4 인생네컷 스트립' : '정사각형 2x2 격자'}
              </span>
            </div>

            {/* The Framed Photo Canvas Mock */}
            <div
              ref={previewRef}
              className="relative w-full rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 select-none border-2"
              style={{
                backgroundColor: currentTheme.bgColor,
                borderColor: currentTheme.borderColor,
                maxWidth: settings.layout === 'strip' ? '280px' : '360px',
              }}
            >
              {/* Pattern Background overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    currentTheme.pattern === 'dots'
                      ? `radial-gradient(${currentTheme.accentColor} 2px, transparent 2px)`
                      : 'none',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Header Title */}
              <div className="p-3 text-center">
                {settings.showClassName && (
                  <h3
                    className="font-['Jua'] text-lg sm:text-xl font-bold tracking-tight leading-tight"
                    style={{ color: currentTheme.textColor }}
                  >
                    {settings.className || '우리반 네컷'}
                  </h3>
                )}
                {settings.showSlogan && settings.sloganText && (
                  <p
                    className="font-['Gowun_Dodum'] text-[11px] opacity-85 mt-0.5"
                    style={{ color: currentTheme.textColor }}
                  >
                    {settings.sloganText}
                  </p>
                )}
              </div>

              {/* Photos Layout */}
              <div className="px-3 pb-2">
                {settings.layout === 'strip' ? (
                  /* 1x4 Vertical Strip */
                  <div className="flex flex-col gap-2">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border-2 border-white/90 bg-slate-100"
                      >
                        <img
                          src={photo.dataUrl}
                          alt={`컷 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-white text-[10px] font-['Jua'] flex items-center justify-center font-bold shadow-sm"
                          style={{ backgroundColor: currentTheme.accentColor }}
                        >
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 2x2 Grid */
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border-2 border-white/90 bg-slate-100"
                      >
                        <img
                          src={photo.dataUrl}
                          alt={`컷 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-white text-[10px] font-['Jua'] flex items-center justify-center font-bold shadow-sm"
                          style={{ backgroundColor: currentTheme.accentColor }}
                        >
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Date & Slogan */}
              <div className="p-3 text-center">
                {settings.showDate && (
                  <p
                    className="font-['Jua'] text-xs font-bold"
                    style={{ color: currentTheme.textColor }}
                  >
                    {settings.dateText || new Date().toLocaleDateString('ko-KR')}
                  </p>
                )}
                {settings.showLogoBadge && (
                  <p
                    className="font-['Gowun_Dodum'] text-[10px] opacity-75 mt-0.5"
                    style={{ color: currentTheme.textColor }}
                  >
                    ✨ 우리들의 소중한 추억 📸 ✨
                  </p>
                )}
              </div>

              {/* Placed Stickers on Preview */}
              {settings.placedStickers.map((s) => {
                const isSelected = selectedStickerId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStickerId(s.id)}
                    className={`absolute cursor-pointer transition-transform select-none ${
                      isSelected ? 'ring-2 ring-amber-500 rounded-lg scale-110' : ''
                    }`}
                    style={{
                      left: `${s.xPercent}%`,
                      top: `${s.yPercent}%`,
                      transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                      fontSize: `${s.size}px`,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                    }}
                  >
                    <span>{s.emoji}</span>
                  </div>
                );
              })}
            </div>

            {/* Sticker Toolbar when a sticker is active on preview */}
            {selectedStickerId && (
              <div className="mt-3 flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <span className="text-xs font-['Jua'] text-amber-900">선택된 스티커:</span>
                <button
                  onClick={() => handleRotateSticker(selectedStickerId)}
                  className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-amber-100 rounded-lg text-xs font-['Jua'] text-amber-900 border border-amber-200"
                >
                  <RotateCw size={12} /> 회전
                </button>
                <button
                  onClick={() => handleRemoveSticker(selectedStickerId)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-['Jua'] text-red-700 border border-red-200"
                >
                  <Trash2 size={12} /> 삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Customization Tabs & Controls */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Customization Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-amber-100/70 p-1.5 rounded-2xl border border-amber-200">
            {[
              { key: 'frame', label: '프레임 테마', icon: Palette },
              { key: 'layout', label: '레이아웃', icon: Layout },
              { key: 'text', label: '문구/날짜', icon: Type },
              { key: 'stickers', label: '스티커 도장', icon: Smile },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    playPopSound(soundEnabled);
                    setActiveTab(tab.key as typeof activeTab);
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-['Jua'] transition-all ${
                    isActive
                      ? 'bg-white text-amber-950 shadow-md scale-102 font-bold'
                      : 'text-amber-800 hover:bg-white/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Frame Theme Selection */}
          {activeTab === 'frame' && (
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-amber-200 shadow-sm">
              <h3 className="text-sm font-['Jua'] text-amber-950 mb-3 flex items-center gap-1.5">
                <Palette size={16} className="text-amber-500" /> 귀여운 우리반 프레임 테마 (9종)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FRAME_THEMES.map((theme) => {
                  const isSelected = settings.selectedFrameId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        playPopSound(soundEnabled);
                        onUpdateSettings({ selectedFrameId: theme.id });
                      }}
                      className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 ring-4 ring-amber-300/60 shadow-md scale-102 font-bold'
                          : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                      style={{ backgroundColor: theme.cardBg }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm mb-1.5 border border-white"
                        style={{ backgroundColor: theme.bgColor }}
                      >
                        {theme.icon}
                      </div>
                      <span
                        className="text-xs font-['Jua'] leading-tight"
                        style={{ color: theme.textColor }}
                      >
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Layout Selection */}
          {activeTab === 'layout' && (
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <h3 className="text-sm font-['Jua'] text-amber-950 mb-1 flex items-center gap-1.5">
                <Layout size={16} className="text-amber-500" /> 사진 레이아웃 형태 선택
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Strip Layout */}
                <button
                  onClick={() => {
                    playPopSound(soundEnabled);
                    onUpdateSettings({ layout: 'strip' });
                  }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 text-center transition-all ${
                    settings.layout === 'strip'
                      ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-300/50 shadow-md'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-20 border-2 border-amber-400 bg-amber-100 rounded-lg flex flex-col gap-1 p-1 mb-2 items-center justify-center">
                    <div className="w-full h-3 bg-white rounded-sm" />
                    <div className="w-full h-3 bg-white rounded-sm" />
                    <div className="w-full h-3 bg-white rounded-sm" />
                    <div className="w-full h-3 bg-white rounded-sm" />
                  </div>
                  <span className="font-['Jua'] text-sm text-amber-950">세로 1x4 스트립</span>
                  <span className="text-[11px] text-amber-700 font-['Gowun_Dodum'] mt-0.5">
                    인생네컷 시그니처 세로형
                  </span>
                </button>

                {/* Grid Layout */}
                <button
                  onClick={() => {
                    playPopSound(soundEnabled);
                    onUpdateSettings({ layout: 'grid' });
                  }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 text-center transition-all ${
                    settings.layout === 'grid'
                      ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-300/50 shadow-md'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 border-2 border-amber-400 bg-amber-100 rounded-lg grid grid-cols-2 gap-1 p-1 mb-2">
                    <div className="w-full h-full bg-white rounded-sm" />
                    <div className="w-full h-full bg-white rounded-sm" />
                    <div className="w-full h-full bg-white rounded-sm" />
                    <div className="w-full h-full bg-white rounded-sm" />
                  </div>
                  <span className="font-['Jua'] text-sm text-amber-950">정사각형 2x2 격자</span>
                  <span className="text-[11px] text-amber-700 font-['Gowun_Dodum'] mt-0.5">
                    액자 & 앨범 보관용
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Text & Class Name */}
          {activeTab === 'text' && (
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-xs font-['Jua'] text-amber-900 mb-1.5">
                  🏫 우리반 이름 (상단 타이틀)
                </label>
                <input
                  type="text"
                  value={settings.className}
                  onChange={(e) => onUpdateSettings({ className: e.target.value })}
                  placeholder="예: 햇살가득 햇님반 ☀️"
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 font-['Jua'] text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {CLASS_NAME_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        playPopSound(soundEnabled);
                        onUpdateSettings({ className: preset });
                      }}
                      className="text-[11px] font-['Jua'] bg-amber-100/70 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan Text */}
              <div>
                <label className="block text-xs font-['Jua'] text-amber-900 mb-1.5">
                  💬 우리들의 슬로건 / 한 줄 문구
                </label>
                <input
                  type="text"
                  value={settings.sloganText}
                  onChange={(e) => onUpdateSettings({ sloganText: e.target.value })}
                  placeholder="예: 우리는 언제나 단짝친구! 💕"
                  className="w-full px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 font-['Gowun_Dodum'] text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SLOGAN_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        playPopSound(soundEnabled);
                        onUpdateSettings({ sloganText: preset });
                      }}
                      className="text-[11px] font-['Gowun_Dodum'] bg-amber-100/70 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date setting */}
              <div>
                <label className="block text-xs font-['Jua'] text-amber-900 mb-1.5">
                  📅 날짜 표시
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.dateText}
                    onChange={(e) => onUpdateSettings({ dateText: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 font-['Jua'] text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => {
                      playPopSound(soundEnabled);
                      onUpdateSettings({
                        dateText: new Date().toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }),
                      });
                    }}
                    className="px-3 py-2 bg-amber-100 text-amber-800 text-xs font-['Jua'] rounded-xl border border-amber-300 hover:bg-amber-200"
                  >
                    오늘 날짜
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Stickers Palette */}
          {activeTab === 'stickers' && (
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-['Jua'] text-amber-950 flex items-center gap-1.5">
                  <Smile size={16} className="text-amber-500" /> 스티커를 누르면 사진에 쏙 들어가요!
                </h3>
                {settings.placedStickers.length > 0 && (
                  <button
                    onClick={handleClearAllStickers}
                    className="text-xs font-['Jua'] text-red-600 hover:text-red-700"
                  >
                    전체 지우기
                  </button>
                )}
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleAddSticker(sticker)}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-amber-100 text-2xl flex items-center justify-center shadow-sm border border-amber-200/70 hover:scale-110 transition-transform cursor-pointer"
                    title={sticker.name}
                  >
                    {sticker.emoji}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-amber-800/80 font-['Gowun_Dodum']">
                💡 팁: 사진 위에 올려진 스티커를 누르면 회전하거나 삭제할 수 있어요.
              </p>
            </div>
          )}

          {/* Action Navigation Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                playPopSound(soundEnabled);
                onBack();
              }}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-['Jua'] text-sm border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>사진 다시 고르기</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playPopSound(soundEnabled);
                onFinish();
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-['Jua'] text-lg shadow-lg shadow-amber-300/60 border-2 border-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>네컷 사진 완성 및 저장하기 🎉</span>
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
