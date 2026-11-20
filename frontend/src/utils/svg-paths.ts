import type { DayNightBand, NormalizedHourPoint, SunWindow } from "../types";

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Fritsch-Carlson monotone cubic Hermite spline SVG path generator.
 * Guarantees smooth curves without overshooting flat plateaus
 * (crucial for 0-100% rain probability and temperature curves).
 */
export function buildMonotoneLinePath(points: Point2D[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  }
  if (points.length === 2) {
    return `M ${fmt(points[0].x)} ${fmt(points[0].y)} L ${fmt(points[1].x)} ${fmt(points[1].y)}`;
  }

  const n = points.length;
  const dx: number[] = new Array(n - 1);
  const dy: number[] = new Array(n - 1);
  const slopes: number[] = new Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    dy[i] = points[i + 1].y - points[i].y;
    slopes[i] = dx[i] !== 0 ? dy[i] / dx[i] : 0;
  }

  const tangents: number[] = new Array(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0;
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tangents[i] = (w1 + w2) / (w1 / slopes[i - 1] + w2 / slopes[i]);
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slopes[i]) < 1e-9) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / slopes[i];
      const beta = tangents[i + 1] / slopes[i];
      const hypot = Math.hypot(alpha, beta);
      if (hypot > 3) {
        const tau = 3 / hypot;
        tangents[i] = tau * alpha * slopes[i];
        tangents[i + 1] = tau * beta * slopes[i];
      }
    }
  }

  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const h = dx[i];
    const cp1x = p0.x + h / 3;
    const cp1y = p0.y + (tangents[i] * h) / 3;
    const cp2x = p1.x - h / 3;
    const cp2y = p1.y - (tangents[i + 1] * h) / 3;
    d += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p1.x)} ${fmt(p1.y)}`;
  }

  return d;
}

/**
 * Build a closed SVG area path under a monotone cubic curve down to `baselineY`.
 */
export function buildMonotoneAreaPath(
  points: Point2D[],
  baselineY: number
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${fmt(p.x)} ${fmt(baselineY)} L ${fmt(p.x)} ${fmt(p.y)} L ${fmt(p.x)} ${fmt(baselineY)} Z`;
  }
  const line = buildMonotoneLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${fmt(last.x)} ${fmt(baselineY)} L ${fmt(first.x)} ${fmt(baselineY)} Z`;
}

/**
 * Compute continuous daytime and nighttime vertical bands across the chart width,
 * interpolating exact sub-hour sunrise/sunset transitions when `sunWindows` are available.
 */
export function computeDayNightBands(
  hours: NormalizedHourPoint[],
  sunWindows: SunWindow[],
  xForIndex: (index: number) => number,
  totalWidth: number
): DayNightBand[] {
  if (hours.length === 0 || totalWidth <= 0) {
    return [];
  }

  if (hours.length === 1) {
    return [{ startX: 0, endX: totalWidth, isNight: hours[0].is_night }];
  }

  const startMs = hours[0].epoch_ms;
  const endMs = hours[hours.length - 1].epoch_ms;
  const firstX = xForIndex(0);
  const lastX = xForIndex(hours.length - 1);
  const msSpan = endMs - startMs;

  const xForMs = (ms: number): number => {
    if (msSpan <= 0) return firstX;
    const ratio = (ms - startMs) / msSpan;
    return Math.max(0, Math.min(totalWidth, firstX + ratio * (lastX - firstX)));
  };

  const transitions: Array<{ x: number; toNight: boolean }> = [];
  for (const win of sunWindows) {
    if (win.sunrise_ms !== null && win.sunrise_ms > startMs && win.sunrise_ms < endMs) {
      transitions.push({ x: xForMs(win.sunrise_ms), toNight: false });
    }
    if (win.sunset_ms !== null && win.sunset_ms > startMs && win.sunset_ms < endMs) {
      transitions.push({ x: xForMs(win.sunset_ms), toNight: true });
    }
  }

  if (transitions.length > 0) {
    transitions.sort((a, b) => a.x - b.x);
    const bands: DayNightBand[] = [];
    let cursorX = 0;
    let currentNight = !transitions[0].toNight;

    for (const tr of transitions) {
      const clampedX = Math.max(cursorX, Math.min(totalWidth, tr.x));
      if (clampedX > cursorX) {
        bands.push({ startX: cursorX, endX: clampedX, isNight: currentNight });
      }
      cursorX = clampedX;
      currentNight = tr.toNight;
    }
    if (cursorX < totalWidth) {
      bands.push({ startX: cursorX, endX: totalWidth, isNight: currentNight });
    }
    return bands;
  }

  const bands: DayNightBand[] = [];
  let bandStart = 0;
  let currentNight = hours[0].is_night;

  for (let i = 1; i < hours.length; i++) {
    if (hours[i].is_night !== currentNight) {
      const midX = (xForIndex(i - 1) + xForIndex(i)) / 2;
      bands.push({ startX: bandStart, endX: midX, isNight: currentNight });
      bandStart = midX;
      currentNight = hours[i].is_night;
    }
  }
  bands.push({ startX: bandStart, endX: totalWidth, isNight: currentNight });
  return bands;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}
