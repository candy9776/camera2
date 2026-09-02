import React from 'react';
import { Camera, Sparkles, Volume2, VolumeX, RotateCcw, Image, Heart } from 'lucide-react';
import { AppStep } from '../types';

interface HeaderProps {
  currentStep: AppStep;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  classNameTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  soundEnabled,
  onToggleSound,
  onReset,
  classNameTitle,
}) => {
  const steps: { key: AppStep; label: string; icon: string }[] = [
    { key: 'ready', label: '1. 촬영 준비', icon: '📸' },
    { key: 'shooting', label: '2. 5장 촬영', icon: '⏱️' },
    { key: 'select', label: '3. 4장 선택', icon: '✨' },
    { key: 'customize', label: '4. 프레임 꾸미기', icon: '🎨' },
    { key: 'result', label: '5. 완성 및 출력', icon: '🎉' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="처음으로 돌아가기"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
            🐣
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-['Jua'] text-xl text-amber-900 leading-tight">
                우리반 네컷
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium border border-amber-200">
                유치원 포토부스
              </span>
            </div>
            <p className="text-xs text-amber-700/80 font-['Gowun_Dodum'] hidden sm:block">
              {classNameTitle || '햇살가득 행복한 우리반 찰칵!'}
            </p>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="hidden md:flex items-center gap-1.5 bg-amber-50/80 px-3 py-1.5 rounded-full border border-amber-200/70">
          {steps.map((s, idx) => {
            const isActive = s.key === currentStep;
            const isCompleted = idx < currentIdx;
            return (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-['Jua'] transition-all ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 shadow-sm scale-105'
                      : isCompleted
                      ? 'text-amber-800 bg-amber-200/60'
                      : 'text-amber-600/50'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <span className="text-amber-300 mx-0.5 text-xs">›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            aria-label="효과음 켜기/끄기"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Reset / New Session Button */}
          {currentStep !== 'ready' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-['Jua'] border border-slate-200 transition-colors"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">처음으로</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
