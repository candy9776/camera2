import React from 'react';

export const DecorativeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Soft warm gradient mesh */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-rose-200/25 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="absolute top-2/3 -left-32 w-80 h-80 rounded-full bg-sky-200/25 blur-3xl" />

      {/* Floating cute kindergarten icons */}
      <div className="absolute top-16 left-8 text-2xl opacity-30 animate-bounce duration-1000">
        🎈
      </div>
      <div className="absolute top-36 right-12 text-2xl opacity-30 animate-pulse">
        ⭐
      </div>
      <div className="absolute bottom-24 left-16 text-3xl opacity-25">
        🌱
      </div>
      <div className="absolute bottom-32 right-20 text-3xl opacity-25">
        🐥
      </div>
      <div className="absolute top-1/2 left-4 text-2xl opacity-20">
        🖍️
      </div>
      <div className="absolute top-2/3 right-8 text-2xl opacity-25">
        🌸
      </div>
    </div>
  );
};
