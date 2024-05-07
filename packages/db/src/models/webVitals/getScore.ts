import {
  CLSThresholds,
  FCPThresholds,
  FIDThresholds,
  INPThresholds,
  LCPThresholds,
  TTFBThresholds,
} from 'web-vitals';

const webVitalTresholds = {
  LCP: LCPThresholds,
  FID: FIDThresholds,
  CLS: CLSThresholds,
  TTFB: TTFBThresholds,
  FCP: FCPThresholds,
  INP: INPThresholds,
};

export function getScore(
  name: keyof typeof webVitalTresholds,
  value: number | null,
): number | null {
  if (value === null) return null;

  const [good, needsImprovement] = webVitalTresholds[name];

  let score = 0;

  if (value <= good) {
    // linearly interpolate between 100 and 66.66
    score = 100 - (value / good) * (100 - 66.66);
  } else if (value <= needsImprovement) {
    // linearly interpolate between 66.66 and 33.33
    score = 66.66 - ((value - good) / (needsImprovement - good)) * (66.66 - 33.33);
  } else {
    // linear extrapolation below 33.33
    score = 33.33 - ((value - needsImprovement) / (needsImprovement - good)) * (66.66 - 33.33);
  }

  // If score goes negative, return 0
  return Math.max(0, score);
}
