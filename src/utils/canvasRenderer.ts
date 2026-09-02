import { CapturedPhoto, FrameTheme, LayoutMode, PhotoBoothSettings, PlacedSticker } from '../types';
import { FRAME_THEMES } from '../constants/frames';

// Helper to load image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw pattern on frame background
function drawFramePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: FrameTheme['pattern'],
  accentColor: string
) {
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.15;

  if (pattern === 'dots') {
    const step = 40;
    for (let x = 20; x < width; x += step) {
      for (let y = 20; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'stars') {
    const emojis = ['⭐', '✨', '🌟'];
    ctx.font = '24px sans-serif';
    ctx.globalAlpha = 0.22;
    for (let x = 30; x < width; x += 100) {
      for (let y = 40; y < height; y += 120) {
        const char = emojis[(x + y) % emojis.length];
        ctx.fillText(char, x, y);
      }
    }
  } else if (pattern === 'chicks') {
    const emojis = ['🐣', '🐥', '✨', '💛'];
    ctx.font = '22px sans-serif';
    ctx.globalAlpha = 0.2;
    for (let x = 30; x < width; x += 90) {
      for (let y = 50; y < height; y += 110) {
        const char = emojis[Math.floor((x * 7 + y * 3) % emojis.length)];
        ctx.fillText(char, x, y);
      }
    }
  } else if (pattern === 'sprouts') {
    const emojis = ['🌱', '🌿', '🍀', '🌸'];
    ctx.font = '22px sans-serif';
    ctx.globalAlpha = 0.2;
    for (let x = 30; x < width; x += 90) {
      for (let y = 50; y < height; y += 110) {
        const char = emojis[Math.floor((x * 11 + y * 5) % emojis.length)];
        ctx.fillText(char, x, y);
      }
    }
  } else if (pattern === 'clouds') {
    const emojis = ['☁️', '🌈', '☀️', '✨'];
    ctx.font = '24px sans-serif';
    ctx.globalAlpha = 0.2;
    for (let x = 40; x < width; x += 100) {
      for (let y = 60; y < height; y += 130) {
        const char = emojis[Math.floor((x * 13 + y * 7) % emojis.length)];
        ctx.fillText(char, x, y);
      }
    }
  } else if (pattern === 'crayons') {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    for (let y = 10; y < height; y += 40) {
      ctx.fillStyle = colors[Math.floor(y / 40) % colors.length];
      ctx.globalAlpha = 0.12;
      ctx.fillRect(8, y, 6, 20);
      ctx.fillRect(width - 14, y + 10, 6, 20);
    }
  }

  ctx.restore();
}

export async function renderPhotoCanvas(
  photos: CapturedPhoto[],
  settings: PhotoBoothSettings,
  theme: FrameTheme,
  options?: { twinStripForPrint?: boolean }
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas 2d context');

  const loadedImages: HTMLImageElement[] = [];
  for (const p of photos) {
    try {
      const img = await loadImage(p.dataUrl);
      loadedImages.push(img);
    } catch {
      // Create fallback placeholder canvas
      const fallback = document.createElement('canvas');
      fallback.width = 400;
      fallback.height = 300;
      const fctx = fallback.getContext('2d')!;
      fctx.fillStyle = '#f1f5f9';
      fctx.fillRect(0, 0, 400, 300);
      fctx.fillStyle = '#94a3b8';
      fctx.font = '24px sans-serif';
      fctx.textAlign = 'center';
      fctx.fillText('사진', 200, 150);
      const fallbackImg = await loadImage(fallback.toDataURL());
      loadedImages.push(fallbackImg);
    }
  }

  const isGrid = settings.layout === 'grid';
  const isTwinPrint = options?.twinStripForPrint && !isGrid;

  if (isGrid) {
    // 2x2 Grid Layout
    const W = 1600;
    const H = 2000;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, W, H);

    // Inner Pattern
    drawFramePattern(ctx, W, H, theme.pattern, theme.accentColor);

    // Outer subtle border
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 14;
    drawRoundedRect(ctx, 10, 10, W - 20, H - 20, 36);
    ctx.stroke();

    // Top Header Banner
    const headerH = 160;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Badge / Class Name
    if (settings.showClassName) {
      ctx.fillStyle = theme.textColor;
      ctx.font = 'bold 56px "Jua", "Gaegu", sans-serif';
      ctx.fillText(settings.className || '우리반 네컷', W / 2, 85);
    }

    if (settings.showSlogan && settings.sloganText) {
      ctx.fillStyle = theme.textColor;
      ctx.font = '400 32px "Gowun Dodum", "Jua", sans-serif';
      ctx.globalAlpha = 0.85;
      ctx.fillText(settings.sloganText, W / 2, 135);
      ctx.globalAlpha = 1.0;
    }

    // Photo Grid Area
    const paddingX = 80;
    const paddingY = headerH + 20;
    const gap = 36;
    const photoW = (W - paddingX * 2 - gap) / 2;
    const photoH = photoW * 0.75; // 4:3 aspect ratio
    const borderRadius = 20;

    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = paddingX + col * (photoW + gap);
      const y = paddingY + row * (photoH + gap);

      const img = loadedImages[i] || loadedImages[0];
      if (img) {
        // Draw photo shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, x - 6, y - 6, photoW + 12, photoH + 12, borderRadius + 4);
        ctx.fill();
        ctx.restore();

        // Draw photo with rounded clip
        ctx.save();
        drawRoundedRect(ctx, x, y, photoW, photoH, borderRadius);
        ctx.clip();

        // Draw image cover
        drawImageCover(ctx, img, x, y, photoW, photoH);
        ctx.restore();

        // White/Accent inner border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        drawRoundedRect(ctx, x, y, photoW, photoH, borderRadius);
        ctx.stroke();

        // Small corner badge index
        ctx.save();
        ctx.fillStyle = theme.accentColor;
        ctx.beginPath();
        ctx.arc(x + 28, y + 28, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px "Jua", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), x + 28, y + 29);
        ctx.restore();
      }
    }

    // Bottom Footer
    const footerY = paddingY + 2 * (photoH + gap) + 40;

    // Date and Kindergarten stamp
    if (settings.showDate) {
      ctx.fillStyle = theme.textColor;
      ctx.font = 'bold 36px "Jua", "Gaegu", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(settings.dateText || new Date().toLocaleDateString('ko-KR'), W / 2, footerY + 20);
    }

    // Logo & Cute branding at bottom
    if (settings.showLogoBadge) {
      ctx.fillStyle = theme.textColor;
      ctx.font = '500 24px "Gowun Dodum", sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText('✨ 우리들의 반짝이는 소중한 추억 📸 우리반 네컷 ✨', W / 2, footerY + 70);
      ctx.globalAlpha = 1.0;
    }

    // Placed Stickers
    drawPlacedStickers(ctx, settings.placedStickers, W, H);

  } else {
    // 1x4 Vertical Strip Layout
    const singleW = 900;
    const singleH = 2600;

    if (isTwinPrint) {
      // 2 Twin Strips for standard 4x6 print paper!
      const totalW = singleW * 2 + 60;
      canvas.width = totalW;
      canvas.height = singleH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalW, singleH);

      // Draw left strip
      await drawSingleStrip(ctx, 0, 0, singleW, singleH, loadedImages, settings, theme);
      // Cut line down the middle
      ctx.save();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(singleW + 30, 40);
      ctx.lineTo(singleW + 30, singleH - 40);
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText('✂️ 가위로 자르는 선 ✂️', singleW + 30, singleH / 2);
      ctx.restore();

      // Draw right strip
      await drawSingleStrip(ctx, singleW + 60, 0, singleW, singleH, loadedImages, settings, theme);

    } else {
      // Single Strip
      canvas.width = singleW;
      canvas.height = singleH;
      await drawSingleStrip(ctx, 0, 0, singleW, singleH, loadedImages, settings, theme);
    }
  }

  return canvas;
}

async function drawSingleStrip(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  W: number,
  H: number,
  loadedImages: HTMLImageElement[],
  settings: PhotoBoothSettings,
  theme: FrameTheme
) {
  ctx.save();
  ctx.translate(offsetX, offsetY);

  // Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, W, H);

  // Pattern
  drawFramePattern(ctx, W, H, theme.pattern, theme.accentColor);

  // Outer border
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, 8, 8, W - 16, H - 16, 28);
  ctx.stroke();

  // Header Title
  const headerH = 140;
  if (settings.showClassName) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 46px "Jua", "Gaegu", sans-serif';
    ctx.fillText(settings.className || '우리반 네컷', W / 2, 75);

    if (settings.showSlogan && settings.sloganText) {
      ctx.font = '400 24px "Gowun Dodum", sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(settings.sloganText, W / 2, 118);
      ctx.globalAlpha = 1.0;
    }
  }

  // 4 Photos in a column
  const paddingX = 64;
  const startY = headerH + 15;
  const gap = 24;
  const photoW = W - paddingX * 2;
  const photoH = (photoW * 3) / 4; // 4:3
  const borderRadius = 18;

  for (let i = 0; i < 4; i++) {
    const y = startY + i * (photoH + gap);
    const img = loadedImages[i] || loadedImages[0];

    if (img) {
      // Photo card shadow & white frame
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#FFFFFF';
      drawRoundedRect(ctx, paddingX - 4, y - 4, photoW + 8, photoH + 8, borderRadius + 2);
      ctx.fill();
      ctx.restore();

      // Clip & Draw Image
      ctx.save();
      drawRoundedRect(ctx, paddingX, y, photoW, photoH, borderRadius);
      ctx.clip();
      drawImageCover(ctx, img, paddingX, y, photoW, photoH);
      ctx.restore();

      // Inner stroke
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, paddingX, y, photoW, photoH, borderRadius);
      ctx.stroke();

      // Small number tag
      ctx.save();
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(paddingX + 24, y + 24, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Jua", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), paddingX + 24, y + 25);
      ctx.restore();
    }
  }

  // Footer area
  const footerY = startY + 4 * (photoH + gap) + 15;

  if (settings.showDate) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 30px "Jua", "Gaegu", sans-serif';
    ctx.fillText(settings.dateText || new Date().toLocaleDateString('ko-KR'), W / 2, footerY + 25);
  }

  if (settings.showLogoBadge) {
    ctx.fillStyle = theme.textColor;
    ctx.font = '500 20px "Gowun Dodum", sans-serif';
    ctx.globalAlpha = 0.75;
    ctx.fillText('✨ 우리반 행복한 네컷 사진관 📸', W / 2, footerY + 65);
    ctx.globalAlpha = 1.0;
  }

  // Placed Stickers
  drawPlacedStickers(ctx, settings.placedStickers, W, H);

  ctx.restore();
}

function drawPlacedStickers(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  W: number,
  H: number
) {
  if (!stickers || stickers.length === 0) return;

  stickers.forEach((s) => {
    ctx.save();
    const x = (s.xPercent / 100) * W;
    const y = (s.yPercent / 100) * H;
    const size = s.size || 50;
    const rot = ((s.rotation || 0) * Math.PI) / 180;

    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size * 1.5}px sans-serif`;

    // Drop shadow for sticker
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.fillText(s.emoji, 0, 0);
    ctx.restore();
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    // Image is wider than target
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    // Image is taller than target
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
