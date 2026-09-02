import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, RotateCcw, Sparkles, ZoomIn, X, Info } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { playPopSound } from '../utils/audio';

interface PhotoSelectViewProps {
  photos: CapturedPhoto[];
  selectedPhotoIds: string[];
  onSelectPhotos: (ids: string[]) => void;
  onNext: () => void;
  onRetake: () => void;
  soundEnabled: boolean;
}

export const PhotoSelectView: React.FC<PhotoSelectViewProps> = ({
  photos,
  selectedPhotoIds,
  onSelectPhotos,
  onNext,
  onRetake,
  soundEnabled,
}) => {
  const [zoomPhoto, setZoomPhoto] = useState<CapturedPhoto | null>(null);

  // Toggle selection of a photo
  const handleTogglePhoto = (photoId: string) => {
    playPopSound(soundEnabled);
    if (selectedPhotoIds.includes(photoId)) {
      // Deselect
      onSelectPhotos(selectedPhotoIds.filter((id) => id !== photoId));
    } else {
      // Select (if less than 4, add; if already 4, replace the last one or prompt)
      if (selectedPhotoIds.length < 4) {
        onSelectPhotos([...selectedPhotoIds, photoId]);
      } else {
        // Replace last chosen photo
        const updated = [...selectedPhotoIds.slice(0, 3), photoId];
        onSelectPhotos(updated);
      }
    }
  };

  // Quick auto select first 4
  const handleSelectFirst4 = () => {
    playPopSound(soundEnabled);
    const first4 = photos.slice(0, 4).map((p) => p.id);
    onSelectPhotos(first4);
  };

  // Selected photo objects in order
  const selectedPhotos = selectedPhotoIds
    .map((id) => photos.find((p) => p.id === id))
    .filter(Boolean) as CapturedPhoto[];

  const isComplete = selectedPhotoIds.length === 4;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Step Guide Header */}
      <div className="w-full text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 border border-amber-300 px-4 py-1.5 rounded-full shadow-sm text-sm font-['Jua'] mb-2">
          <span>✨ 5장의 사진 중 가장 예쁜 4장을 골라주세요!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-950">
          우리반 사진 4장 고르기 ({selectedPhotoIds.length}/4)
        </h2>
        <p className="text-sm text-amber-800/80 font-['Gowun_Dodum'] mt-1">
          사진을 누르면 선택/해제됩니다. 순서대로 1번부터 4번 프레임에 들어가요.
        </p>
      </div>

      {/* 5 Photos Gallery Row */}
      <div className="w-full bg-white/85 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-amber-200 shadow-md mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-['Jua'] text-sm text-amber-900 flex items-center gap-1.5">
            📸 촬영된 5장의 사진
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectFirst4}
              className="text-xs font-['Jua'] text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl transition-colors"
            >
              1~4번 자동 선택
            </button>
            <button
              onClick={() => onSelectPhotos([])}
              className="text-xs font-['Jua'] text-slate-500 hover:text-slate-700 px-2 py-1 transition-colors"
            >
              선택 초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          {photos.map((photo, index) => {
            const selectedOrder = selectedPhotoIds.indexOf(photo.id);
            const isSelected = selectedOrder !== -1;

            return (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all shadow-sm ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-300/60 shadow-lg scale-102'
                    : 'border-slate-200 hover:border-amber-200 opacity-90'
                }`}
                onClick={() => handleTogglePhoto(photo.id)}
              >
                <img
                  src={photo.dataUrl}
                  alt={`촬영 사진 ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                />

                {/* Original shot index tag */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-['Jua'] px-2 py-0.5 rounded-full">
                  촬영 {index + 1}
                </div>

                {/* Zoom preview button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomPhoto(photo);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                  title="크게 보기"
                >
                  <ZoomIn size={14} />
                </button>

                {/* Selected Number Badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 font-['Jua'] text-sm font-bold flex items-center justify-center shadow-md border-2 border-white"
                    >
                      {selectedOrder + 1}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected Overlay tint */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-400/10 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected 4 Slots Preview Area */}
      <div className="w-full bg-amber-50/80 p-4 sm:p-5 rounded-3xl border border-amber-200/80 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 font-['Jua'] text-amber-950">
            <Sparkles size={16} className="text-amber-500" />
            <span>선택된 4컷 순서 미리보기</span>
          </div>
          <span className="text-xs font-['Gowun_Dodum'] text-amber-800">
            {isComplete ? '4장이 모두 선택되었습니다! 🎉' : `앞으로 ${4 - selectedPhotoIds.length}장을 더 골라주세요`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photo = selectedPhotos[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`relative aspect-[4/3] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all overflow-hidden ${
                  photo
                    ? 'border-amber-400 bg-white shadow-md'
                    : 'border-amber-300/70 bg-amber-100/40 text-amber-700/60'
                }`}
              >
                {photo ? (
                  <>
                    <img
                      src={photo.dataUrl}
                      alt={`슬롯 ${slotIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-['Jua'] text-xs flex items-center justify-center font-bold shadow-sm">
                      {slotIdx + 1}
                    </div>
                    <button
                      onClick={() => handleTogglePhoto(photo.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      title="선택 해제"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center p-2">
                    <span className="w-7 h-7 rounded-full bg-amber-200/80 text-amber-800 font-['Jua'] text-sm flex items-center justify-center font-bold">
                      {slotIdx + 1}
                    </span>
                    <span className="text-xs font-['Jua'] text-amber-800/80">
                      {slotIdx + 1}번 컷 선택 대기
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={() => {
            playPopSound(soundEnabled);
            onRetake();
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-['Jua'] text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>다시 처음부터 촬영하기</span>
        </button>

        <motion.button
          whileHover={isComplete ? { scale: 1.03 } : {}}
          whileTap={isComplete ? { scale: 0.97 } : {}}
          disabled={!isComplete}
          onClick={() => {
            playPopSound(soundEnabled);
            onNext();
          }}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-['Jua'] text-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isComplete
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-amber-300/60 hover:from-amber-300 hover:to-orange-300 border-2 border-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>프레임 선택 및 꾸미기로 이동</span>
          <ArrowRight size={20} />
        </motion.button>
      </div>

      {/* Photo Zoom Modal */}
      <AnimatePresence>
        {zoomPhoto && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setZoomPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomPhoto(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              >
                <X size={20} />
              </button>
              <img
                src={zoomPhoto.dataUrl}
                alt="확대 보기"
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
              <div className="p-3 text-center">
                <button
                  onClick={() => {
                    handleTogglePhoto(zoomPhoto.id);
                    setZoomPhoto(null);
                  }}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-['Jua'] text-sm shadow-sm"
                >
                  {selectedPhotoIds.includes(zoomPhoto.id) ? '선택 취소하기' : '이 사진 선택하기 ✨'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
