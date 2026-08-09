/**
  Generates synthetic test files representing various media (Photos, Text documents, Audio)
 */
export async function createDemoPhotoFiles(): Promise<File[]> {
  const files: File[] = [];

  // 1. HEIC Photo
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#ff7e5f');
    grad.addColorStop(1, '#feb47b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('Карпати • Знімальний день', 80, 150);
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('Apple HEIF High Efficiency Image Format (4K Photo)', 80, 210);
    ctx.fillText('1600 × 1200 px • iPhone 15 Pro Max', 80, 250);
  }
  const imgBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png', 0.95);
  });
  files.push(
    new File([imgBlob], 'IMG_4821_Apple_iPhone.heic', {
      type: 'image/heic',
      lastModified: Date.now(),
    })
  );

  // 2. Canon EOS CR2 Camera RAW File
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = 1920;
  rawCanvas.height = 1080;
  const rawCtx = rawCanvas.getContext('2d');
  if (rawCtx) {
    const rawGrad = rawCtx.createLinearGradient(0, 0, rawCanvas.width, rawCanvas.height);
    rawGrad.addColorStop(0, '#0f172a');
    rawGrad.addColorStop(0.5, '#3b82f6');
    rawGrad.addColorStop(1, '#06b6d4');
    rawCtx.fillStyle = rawGrad;
    rawCtx.fillRect(0, 0, rawCanvas.width, rawCanvas.height);

    // Decorative camera viewfinder grid
    rawCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    rawCtx.lineWidth = 2;
    rawCtx.strokeRect(100, 100, rawCanvas.width - 200, rawCanvas.height - 200);

    // Viewfinder crosshair
    rawCtx.beginPath();
    rawCtx.arc(rawCanvas.width / 2, rawCanvas.height / 2, 80, 0, Math.PI * 2);
    rawCtx.stroke();

    rawCtx.fillStyle = '#ffffff';
    rawCtx.font = 'bold 50px sans-serif';
    rawCtx.fillText('Canon EOS R5 • 45MP Uncompressed RAW', 140, 200);

    rawCtx.font = '26px monospace';
    rawCtx.fillStyle = '#f1f5f9';
    rawCtx.fillText('RAW format: .CR2 (Canon Digital RAW)', 140, 260);
    rawCtx.fillText('ISO 100 • 50mm f/1.4 • 1/1000s • 14-bit Color Depth', 140, 300);
  }

  const rawJpegBlob = await new Promise<Blob>((resolve) => {
    rawCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
  });
  const rawJpegArray = new Uint8Array(await rawJpegBlob.arrayBuffer());

  // TIFF Header for Canon CR2
  const cr2Header = new Uint8Array([0x49, 0x49, 0x2a, 0x00, 0x10, 0x00, 0x00, 0x00, 0x43, 0x52, 0x02, 0x00]);
  const combinedBuffer = new Uint8Array(cr2Header.length + rawJpegArray.length);
  combinedBuffer.set(cr2Header, 0);
  combinedBuffer.set(rawJpegArray, cr2Header.length);

  files.push(
    new File([combinedBuffer], 'IMG_1092_Canon_EOS.cr2', {
      type: 'image/x-canon-cr2',
      lastModified: Date.now(),
    })
  );

  // 3. Text / Markdown Document
  const docContent = `# Universal Converter Pro Notes

This is a sample document file created for testing conversions.

## Features:
- Converts Markdown to HTML, Text, JSON, and PDF
- Fast client-side browser processing
- High security and privacy (no cloud uploads required)`;

  files.push(
    new File([docContent], 'Project_Summary.md', {
      type: 'text/markdown',
      lastModified: Date.now(),
    })
  );

  // 3. Audio Tone File (1 second 440Hz Sine Wave WAV)
  try {
    const sampleRate = 22050;
    const duration = 1.5; // seconds
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new Uint8Array(44 + numSamples * 2);
    const view = new DataView(buffer.buffer);

    // WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // 440Hz Sine Wave
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * t) * 0.5;
      const intSample = Math.floor(sample * 32767);
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const audioBlob = new Blob([buffer], { type: 'audio/wav' });
    files.push(
      new File([audioBlob], 'Sample_Synth_Melody.wav', {
        type: 'audio/wav',
        lastModified: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Audio synthesis demo skipped:', e);
  }

  return files;
}
