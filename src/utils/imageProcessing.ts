/**
 * Image processing utilities for client-side AI & Canvas image enhancements:
 * - Smart Background Removal (Edge Chroma Keying, Euclidean color distance, Alpha feathering)
 * - Super Resolution Upscaling (2x / 4x Resampling, Convolution Edge Sharpening, DTF Contrast Boost)
 * - Print Resolution (DPI) & Quality Analysis
 */

export interface RemoveBgOptions {
  tolerance: number; // 0 to 100
  feather: number; // 0 to 10
  targetColor?: { r: number; g: number; b: number } | null; // null = auto detect from corners
  contiguousOnly?: boolean;
}

export interface UpscaleOptions {
  scale: 2 | 4;
  sharpness: number; // 0 to 100
  contrastBoost: boolean;
  cleanNoise?: boolean;
}

// Convert image URL / DataURI to HTMLImageElement
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Remove background with smart color detection, tolerance, and edge feathering
 */
export const removeImageBackground = async (
  imageSrc: string,
  options: RemoveBgOptions = { tolerance: 25, feather: 2, contiguousOnly: false }
): Promise<{ dataUrl: string; width: number; height: number }> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Determine target background color
  let bgR = 255;
  let bgG = 255;
  let bgB = 255;

  if (options.targetColor) {
    bgR = options.targetColor.r;
    bgG = options.targetColor.g;
    bgB = options.targetColor.b;
  } else {
    // Auto-detect by sampling the 4 corners
    const cornerSamples = [
      0, // top-left
      (width - 1) * 4, // top-right
      ((height - 1) * width) * 4, // bottom-left
      ((height - 1) * width + (width - 1)) * 4, // bottom-right
    ];

    let sumR = 0, sumG = 0, sumB = 0;
    for (const idx of cornerSamples) {
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
    }
    bgR = Math.round(sumR / cornerSamples.length);
    bgG = Math.round(sumG / cornerSamples.length);
    bgB = Math.round(sumB / cornerSamples.length);
  }

  // Max color distance in RGB space is ~441.67
  const maxDistance = 441.67;
  const thresholdDist = (options.tolerance / 100) * maxDistance;
  const featherDist = Math.max(1, (options.feather / 100) * 120);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue; // Already transparent

    // Euclidean distance in RGB color space
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= thresholdDist) {
      // Complete removal
      data[i + 3] = 0;
    } else if (dist < thresholdDist + featherDist) {
      // Soft transition feathering
      const ratio = (dist - thresholdDist) / featherDist;
      data[i + 3] = Math.round(a * ratio);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  };
};

/**
 * Super Resolution & Detail Sharpener
 * 2x or 4x high-quality resampling + convolution edge sharpening + print contrast
 */
export const upscaleAndEnhanceImage = async (
  imageSrc: string,
  options: UpscaleOptions = { scale: 2, sharpness: 60, contrastBoost: true, cleanNoise: true }
): Promise<{ dataUrl: string; width: number; height: number; originalDpi: number; newDpi: number }> => {
  const img = await loadImage(imageSrc);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const targetW = origW * options.scale;
  const targetH = origH * options.scale;

  // Step 1: Step-wise high-fidelity bicubic resampling
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Step 2: Convolution sharpening matrix
  if (options.sharpness > 0) {
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const src = imgData.data;
    const output = ctx.createImageData(targetW, targetH);
    const dst = output.data;

    // Sharpness strength weight
    const amount = (options.sharpness / 100) * 0.8;
    const center = 1 + 4 * amount;
    const side = -amount;

    for (let y = 1; y < targetH - 1; y++) {
      for (let x = 1; x < targetW - 1; x++) {
        const idx = (y * targetW + x) * 4;

        // Skip fully transparent pixels
        if (src[idx + 3] === 0) {
          dst[idx + 3] = 0;
          continue;
        }

        for (let c = 0; c < 3; c++) {
          const top = src[((y - 1) * targetW + x) * 4 + c];
          const bottom = src[((y + 1) * targetW + x) * 4 + c];
          const left = src[(y * targetW + (x - 1)) * 4 + c];
          const right = src[(y * targetW + (x + 1)) * 4 + c];
          const current = src[idx + c];

          let val = current * center + (top + bottom + left + right) * side;

          // Contrast boost for screen printing vibrancy
          if (options.contrastBoost) {
            val = ((val - 128) * 1.1) + 128;
          }

          dst[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
        }

        dst[idx + 3] = src[idx + 3]; // Preserve alpha
      }
    }

    ctx.putImageData(output, 0, 0);
  }

  // Estimated DPI calculation for typical A4 print width (21cm = 8.27 inches)
  const printWidthInches = 8.27;
  const originalDpi = Math.round(origW / printWidthInches);
  const newDpi = Math.round(targetW / printWidthInches);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: targetW,
    height: targetH,
    originalDpi,
    newDpi,
  };
};

/**
 * Calculates print DPI and suitability rating
 */
export const calculatePrintQuality = (
  pixelWidth: number,
  pixelHeight: number,
  printSizeId: 'A5' | 'A4' | 'A3' | 'JUMBO'
): { dpi: number; rating: 'low' | 'good' | 'optimal'; label: string; recommendation: string } => {
  const inchesMap = {
    A5: 5.9,
    A4: 8.27,
    A3: 11.69,
    JUMBO: 15.75,
  };
  const printInches = inchesMap[printSizeId] || 8.27;
  const dpi = Math.round(Math.max(pixelWidth, pixelHeight) / printInches);

  if (dpi < 150) {
    return {
      dpi,
      rating: 'low',
      label: `ความละเอียดต่ำ (${dpi} DPI)`,
      recommendation: 'ภาพอาจมีรอยแตกหรือเบลอเมื่อสกรีน แนะนำให้ใช้ปุ่ม "อัปสเกล 300 DPI" หรือใช้ไฟล์ที่มีขนาดใหญ่กว่านี้',
    };
  } else if (dpi < 250) {
    return {
      dpi,
      rating: 'good',
      label: `ความละเอียดปานกลาง (${dpi} DPI)`,
      recommendation: 'สามารถสกรีนได้สวยงาม สกรีนงาน DTF ได้อย่างคมชัด',
    };
  } else {
    return {
      dpi,
      rating: 'optimal',
      label: `ความละเอียดสูง คมกริบ (${dpi} DPI)`,
      recommendation: 'คุณภาพไฟล์ระดับพรีเมียม สกรีนคมชัดระดับสตูดิโอ 100%',
    };
  }
};
