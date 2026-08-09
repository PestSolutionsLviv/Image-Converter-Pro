/**
  Generates synthetic canvas test files representing typical photos (iPhone camera style)
 */
export async function createDemoPhotoFiles(): Promise<File[]> {
  const photos = [
    { name: 'IMG_4821_Apple_iPhone.heic', color1: '#ff7e5f', color2: '#feb47b', title: 'Карпати • Знімальний день', type: 'heic' },
    { name: 'IMG_5033_Portrait_Shot.heic', color1: '#6a11cb', color2: '#2575fc', title: 'Портрет на захід сонця', type: 'heic' },
    { name: 'IMG_9102_Architecture.heic', color1: '#11998e', color2: '#38ef7d', title: 'Архітектура Київ', type: 'heic' },
  ];

  const files: File[] = [];

  for (const photo of photos) {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw artistic gradient photo mockup
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, photo.color1);
      grad.addColorStop(1, photo.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(1200, 300, 250, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(300, 900, 400, 0, Math.PI * 2);
      ctx.fill();

      // Text watermark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(photo.title, 80, 150);

      ctx.font = '28px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('Apple HEIF High Efficiency Image Format (4K Photo)', 80, 210);
      ctx.fillText('1600 × 1200 px • iPhone 15 Pro Max', 80, 250);

      // Simple photo grid elements
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 300, 1440, 750);
    }

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png', 0.95);
    });

    // Create a File object with HEIC extension
    const file = new File([blob], photo.name, {
      type: 'image/heic',
      lastModified: Date.now(),
    });

    files.push(file);
  }

  return files;
}
