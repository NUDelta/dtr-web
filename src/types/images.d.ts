interface WebpOptions {
  /** 0..100; typical sweet spot 78–85 */
  quality: number;
  /** true = lossless WebP; ignores `quality` */
  lossless: boolean;
  /** 0..6 (higher = slower but smaller). 4–5 is a good default. */
  effort: number;
  /** Downscale to this width (px) while preserving aspect ratio. Won’t upscale. */
  targetWidth: number;
}
