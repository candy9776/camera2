import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  FlipHorizontal,
  Clock,
  Sliders,
  AlertCircle,
  Image as ImageIcon,
  Check,
  Play,
  Volume2
} from 'lucide-react';
import { CapturedPhoto, FilterType } from '../types';
import { POSE_PROMPTS } from '../constants/frames';
import { playCountdownBeep, playShutterSound, playCelebrationFanfare, playPopSound } from '../utils/audio';
import { generateSampleKindergartenPhotos } from '../utils/mockPhotos';

interface CameraViewProps {
  onComplete: (photos: CapturedPhoto[]) => void;
  soundEnabled: boolean;
  mirrored: boolean;
  onToggleMirror: () => void;
  selectedFilter: FilterType;
  onChangeFilter: (f: FilterType) => void;
}

const FILTERS: { id: FilterType; label: string; icon: string; css: string }[] = [
  { id: 'normal', label: '기본', icon: '✨', css: 'none' },
  { id: 'warm', label: '화사한 햇살', icon: '☀️', css: 'sepia(0.18) saturate(1.25) brightness(1.05)' },
  { id: 'soft', label: '뽀샤시 핑크', icon: '🌸', css: 'contrast(0.95) brightness(1.1) saturate(1.15) hue-rotate(-5deg)' },
  { id: 'vivid', label: '생생 컬러', icon: '🌈', css: 'saturate(1.4) contrast(1.08)' },
  { id: 'bw', label: '감성 흑백', icon: '🎬', css: 'grayscale(1) contrast(1.15)' },
  { id: 'vintage', label: '레트로 필름', icon: '🎞️', css: 'sepia(0.35) contrast(0.95) brightness(1.02)' },
];

export const CameraView: React.FC<CameraViewProps> = ({
  onComplete,
  soundEnabled,
  mirrored,
  onToggleMirror,
  selectedFilter,
  onChangeFilter,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Shooting states
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0); // 0 to 4 (total 5)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPoseReadyPhase, setIsPoseReadyPhase] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [timerDuration, setTimerDuration] = useState<number>(3); // 3, 5, 7 seconds

  // Initialize camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasCamera(true);
      setCameraError(null);

      // List devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      setHasCamera(false);
      setCameraError('카메라를 찾을 수 없거나 권한이 필요합니다. 아래 샘플 사진으로 바로 체험해보세요!');
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Capture frame from video
  const captureCurrentFrame = useCallback((): string => {
    const video = videoRef.current;
    if (!video) return '';

    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Apply mirror if enabled
    if (mirrored) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }

    // Apply active CSS filter to canvas
    const activeFilter = FILTERS.find((f) => f.id === selectedFilter);
    if (activeFilter && activeFilter.css !== 'none') {
      ctx.filter = activeFilter.css;
    }

    ctx.drawImage(video, 0, 0, vw, vh);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [mirrored, selectedFilter]);

  // Start the 5-shot sequence
  const start5ShotSequence = () => {
    playPopSound(soundEnabled);
    setIsShooting(true);
    setCurrentShotIndex(0);
    setCapturedPhotos([]);
    runSingleShot(0, []);
  };

  const runSingleShot = (shotIdx: number, accumulatedPhotos: CapturedPhoto[]) => {
    setCurrentShotIndex(shotIdx);
    setIsPoseReadyPhase(true);
    setCountdown(null);

    // Give 1.5 seconds to see pose prompt before countdown starts
    setTimeout(() => {
      setIsPoseReadyPhase(false);
      let count = timerDuration;
      setCountdown(count);
      playCountdownBeep(count, soundEnabled);

      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          playCountdownBeep(count, soundEnabled);
        } else {
          clearInterval(interval);
          setCountdown(0);
          playCountdownBeep(0, soundEnabled);

          // Flash and capture
          setFlash(true);
          playShutterSound(soundEnabled);

          setTimeout(() => {
            const dataUrl = captureCurrentFrame();
            setFlash(false);
            setCountdown(null);

            const newPhoto: CapturedPhoto = {
              id: `photo_${shotIdx + 1}_${Date.now()}`,
              dataUrl,
              timestamp: Date.now(),
              filter: selectedFilter,
            };

            const updatedList = [...accumulatedPhotos, newPhoto];
            setCapturedPhotos(updatedList);

            if (shotIdx + 1 < 5) {
              // Next shot in 1.2s
              setTimeout(() => {
                runSingleShot(shotIdx + 1, updatedList);
              }, 1200);
            } else {
              // Completed all 5 shots!
              playCelebrationFanfare(soundEnabled);
              setTimeout(() => {
                setIsShooting(false);
                onComplete(updatedList);
              }, 1000);
            }
          }, 200);
        }
      }, 1000);
    }, 1500);
  };

  // Fallback to sample kindergarten photos
  const handleUseSamplePhotos = () => {
    playPopSound(soundEnabled);
    const samples = generateSampleKindergartenPhotos();
    playCelebrationFanfare(soundEnabled);
    onComplete(samples);
  };

  const currentPose = POSE_PROMPTS[currentShotIndex] || POSE_PROMPTS[0];
  const activeFilterConfig = FILTERS.find((f) => f.id === selectedFilter) || FILTERS[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Banner Guide */}
      <div className="w-full text-center mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300/80 px-4 py-1.5 rounded-full shadow-sm text-sm font-['Jua']"
        >
          <span>📸 3, 2, 1 카운터 후 총 5장의 사진을 연속으로 찍어요!</span>
        </motion.div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300">
        {/* Flash Overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Live Video Preview */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
          style={{
            transform: mirrored ? 'scaleX(-1)' : 'none',
            filter: activeFilterConfig.css,
          }}
        />

        {/* Camera blocked / Error Overlay */}
        {hasCamera === false && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mb-3">
              📷
            </div>
            <h3 className="text-white font-['Jua'] text-xl mb-1">카메라 연결 안내</h3>
            <p className="text-slate-300 text-sm max-w-md mb-4 font-['Gowun_Dodum']">
              {cameraError || '웹캠을 허용해주시거나, 준비된 귀여운 유치원 샘플 사진으로 바로 네컷을 만들어보세요!'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-['Jua'] transition-colors"
              >
                <RefreshCw size={16} /> 다시 시도
              </button>
              <button
                onClick={handleUseSamplePhotos}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 px-5 py-2 rounded-xl text-sm font-['Jua'] shadow-md shadow-amber-900/30 transition-all hover:scale-105"
              >
                <span>🐣 귀여운 샘플 캐릭터로 시작!</span>
              </button>
            </div>
          </div>
        )}

        {/* Shooting Overlay: Countdown & Pose Prompts */}
        {isShooting && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6 bg-gradient-to-t from-black/60 via-transparent to-black/60 z-20 pointer-events-none">
            {/* Top Shot Indicator */}
            <div className="flex items-center gap-2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full font-['Jua'] text-lg shadow-lg">
              <span>{currentPose.pose}</span>
              <span className="bg-amber-950 text-white px-2 py-0.5 rounded-full text-xs">
                {currentShotIndex + 1} / 5장
              </span>
            </div>

            {/* Center Big Countdown Number or Pose Tip */}
            <div className="flex flex-col items-center justify-center my-auto">
              <AnimatePresence mode="wait">
                {isPoseReadyPhase ? (
                  <motion.div
                    key="pose-phase"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="bg-black/70 backdrop-blur-md text-white px-6 py-4 rounded-3xl text-center border-2 border-amber-300 shadow-2xl"
                  >
                    <div className="text-amber-300 text-lg font-['Jua'] mb-1">
                      {currentPose.title}
                    </div>
                    <div className="text-3xl font-bold font-['Jua'] text-white mb-1">
                      {currentPose.pose}
                    </div>
                    <div className="text-sm text-amber-200 font-['Gowun_Dodum']">
                      {currentPose.tip}
                    </div>
                  </motion.div>
                ) : countdown !== null && countdown > 0 ? (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-36 h-36 rounded-full bg-amber-400/90 text-amber-950 border-8 border-white flex items-center justify-center shadow-2xl"
                  >
                    <span className="font-['Jua'] text-8xl">{countdown}</span>
                  </motion.div>
                ) : countdown === 0 ? (
                  <motion.div
                    key="smile"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-amber-300 font-['Jua'] text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  >
                    찰칵! 📸
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Bottom Progress Bubbles */}
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isDone = idx < capturedPhotos.length;
                const isCurrent = idx === currentShotIndex;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-['Jua'] text-sm transition-all ${
                      isDone
                        ? 'bg-emerald-400 text-emerald-950 border-2 border-white scale-110 shadow-lg'
                        : isCurrent
                        ? 'bg-amber-400 text-amber-950 border-2 border-white animate-pulse'
                        : 'bg-white/40 text-white border border-white/60'
                    }`}
                  >
                    {isDone ? <Check size={18} strokeWidth={3} /> : idx + 1}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Camera Controls Overlay (Top Right) */}
        {!isShooting && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {/* Mirror Toggle */}
            <button
              onClick={onToggleMirror}
              className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all ${
                mirrored
                  ? 'bg-amber-400/90 text-amber-950 border-amber-300'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
              title="거울 모드 (좌우 반전)"
            >
              <FlipHorizontal size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Captured Preview Tray during shooting */}
      {capturedPhotos.length > 0 && (
        <div className="w-full max-w-2xl mt-3 flex items-center gap-2 overflow-x-auto p-2 bg-amber-50/70 rounded-2xl border border-amber-200">
          <span className="text-xs font-['Jua'] text-amber-800 px-2 shrink-0">
            찍힌 사진 ({capturedPhotos.length}/5)
          </span>
          {capturedPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-amber-400 shrink-0 shadow-sm"
            >
              <img src={photo.dataUrl} alt={`컷 ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-[10px] px-1 font-['Jua']">
                {i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Camera Settings & Filter Controls (When not shooting) */}
      {!isShooting && (
        <div className="w-full max-w-2xl mt-4 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-['Jua'] text-amber-900 flex items-center gap-1">
                <Sliders size={14} /> 필터 효과 선택
              </span>
              <span className="text-xs font-['Gowun_Dodum'] text-amber-700/70">
                선택된 필터: {activeFilterConfig.label}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playPopSound(soundEnabled);
                    onChangeFilter(f.id);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-['Jua'] transition-all ${
                    selectedFilter === f.id
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-105 font-bold'
                      : 'bg-amber-50/70 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Selection & Camera Device */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-100 shadow-sm">
            {/* Timer selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-['Jua'] text-amber-900 flex items-center gap-1">
                <Clock size={14} /> 카운트다운 시간:
              </span>
              <div className="flex gap-1">
                {[3, 5, 7].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      playPopSound(soundEnabled);
                      setTimerDuration(sec);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-['Jua'] transition-all ${
                      timerDuration === sec
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    {sec}초
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Select (if multi-camera) */}
            {devices.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs font-['Jua'] text-amber-900">
                <Camera size={14} />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `카메라 ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Big Action Shooting Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={start5ShotSequence}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-['Jua'] text-xl rounded-2xl shadow-lg shadow-amber-300/50 flex items-center justify-center gap-3 border-2 border-white transition-all cursor-pointer"
            >
              <Camera size={26} className="animate-bounce" />
              <span>5장 연속 촬영 시작하기! (3, 2, 1 찰칵)</span>
            </motion.button>

            <button
              onClick={handleUseSamplePhotos}
              className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-amber-50 text-amber-800 font-['Jua'] text-sm rounded-2xl border border-amber-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>🐣 샘플 캐릭터 사진으로 체험하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
