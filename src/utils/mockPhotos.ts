import { CapturedPhoto } from '../types';

export function generateSampleKindergartenPhotos(): CapturedPhoto[] {
  const samples: { title: string; bg: string; character: string; hat: string }[] = [
    { title: '꽃받침 🌸', bg: '#FEF3C7', character: '👧', hat: '🌸' },
    { title: '브이윙크 ✌️', bg: '#FCE7F3', character: '👦', hat: '🧢' },
    { title: '하트뿅뿅 ❤️', bg: '#DCFCE7', character: '👧', hat: '🎀' },
    { title: '개구쟁이 😝', bg: '#E0F2FE', character: '👦', hat: '👑' },
    { title: '최고야 👍', bg: '#EDE9FE', character: '👧', hat: '⭐' },
  ];

  const now = Date.now();

  return samples.map((sample, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, sample.bg);
    grad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Decorative classroom background items
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.font = '50px sans-serif';
    ctx.fillText('🏫', 60, 100);
    ctx.fillText('🌈', 500, 120);
    ctx.fillText('🎈', 100, 380);
    ctx.fillText('🧸', 490, 400);

    // Character Face
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '160px sans-serif';
    ctx.fillText(sample.character, 320, 240);

    // Character Hat / Accessory
    ctx.font = '80px sans-serif';
    ctx.fillText(sample.hat, 320, 140);

    // Cute sticker label badge on photo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(160, 400, 320, 56, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 24px "Jua", sans-serif';
    ctx.fillText(`${idx + 1}번 컷: ${sample.title}`, 320, 428);

    return {
      id: `sample_${idx + 1}_${now}`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      timestamp: now + idx * 1000,
      filter: 'normal',
    };
  });
}
