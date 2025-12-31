import type { WebNotify } from '@/types/notify';

const allowedOffsets = [
  { label: '1h', seconds: 60 * 60 },
  { label: '1d', seconds: 24 * 60 * 60 },
  { label: '3d', seconds: 3 * 24 * 60 * 60 },
  { label: '1w', seconds: 7 * 24 * 60 * 60 },
];

const durationAliases: Record<string, number> = {
  '1h': 60 * 60,
  '1hour': 60 * 60,
  '1hr': 60 * 60,
  '60m': 60 * 60,
  '3600s': 60 * 60,
  '3600000': 60 * 60, // ms to seconds
  '1d': 24 * 60 * 60,
  '24h': 24 * 60 * 60,
  '86400s': 24 * 60 * 60,
  '86400000': 24 * 60 * 60, // ms to seconds
  '3d': 3 * 24 * 60 * 60,
  '72h': 3 * 24 * 60 * 60,
  '259200s': 3 * 24 * 60 * 60,
  '259200000': 3 * 24 * 60 * 60, // ms to seconds
  '1w': 7 * 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '168h': 7 * 24 * 60 * 60,
  '604800s': 7 * 24 * 60 * 60,
  '604800000': 7 * 24 * 60 * 60, // ms to seconds
};

const parseIsoDurationToSeconds = (value: string) => {
  const match = value.toLowerCase().match(/^p(?:(\d+)d)?(?:t(?:(\d+)h)?)?$/i);
  if (!match) {
    return null;
  }
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  return days * 24 * 60 * 60 + hours * 60 * 60;
};

const parseDurationToSeconds = (remainTime?: string | null) => {
  if (!remainTime) {
    return null;
  }
  const normalized = remainTime.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized in durationAliases) {
    return durationAliases[normalized];
  }

  const isoSeconds = parseIsoDurationToSeconds(normalized);
  if (isoSeconds) {
    return isoSeconds;
  }

  const unitMatch = normalized.match(/^(\d+)([smhdw])$/);
  if (unitMatch) {
    const value = Number(unitMatch[1]);
    const unit = unitMatch[2];
    if (Number.isFinite(value)) {
      if (unit === 's') return value;
      if (unit === 'm') return value * 60;
      if (unit === 'h') return value * 60 * 60;
      if (unit === 'd') return value * 24 * 60 * 60;
      if (unit === 'w') return value * 7 * 24 * 60 * 60;
    }
  }

  const numericValue = Number(normalized);
  if (Number.isFinite(numericValue)) {
    // If the numeric value looks like milliseconds, convert to seconds.
    if (numericValue > 100000) {
      return Math.round(numericValue / 1000);
    }
    return Math.round(numericValue);
  }

  return null;
};

const mapSecondsToOffset = (seconds: number | null) => {
  if (!seconds) {
    return null;
  }
  const tolerance = 60; // 1 minute tolerance for rounding issues
  for (const { label, seconds: targetSeconds } of allowedOffsets) {
    if (Math.abs(seconds - targetSeconds) <= tolerance) {
      return label;
    }
  }
  return null;
};

export const mapNotifiesToAlarmOffsets = (notifies: WebNotify[]) => {
  const start = new Set<string>();
  const end = new Set<string>();

  notifies.forEach((notify) => {
    const offset = mapSecondsToOffset(parseDurationToSeconds(notify.remainTime));
    if (!offset) {
      return;
    }
    const eventType = notify.eventType ?? notify.notifyType;
    if (eventType === 'DEADLINE') {
      end.add(offset);
      return;
    }
    if (eventType === 'REMINDER') {
      start.add(offset);
    }
  });

  return { start: Array.from(start), end: Array.from(end) };
};

export const mapNotifiesToAlarmTokens = (notifies: WebNotify[]) => {
  const { start, end } = mapNotifiesToAlarmOffsets(notifies);
  return [
    ...start.map((offset) => `reminder-${offset}`),
    ...end.map((offset) => `deadline-${offset}`),
  ];
};
