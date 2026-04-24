/**
 * Racha y ventana de 7 días en UTC (misma referencia que `ReadingStreak.tsx` y Postgres `date`).
 * `is_streak`: solo los días consecutivos que forman la racha actual terminando en hoy UTC.
 */

export function utcTodayKey(now: Date = new Date()): string {
  const cur = new Date(now);
  cur.setUTCHours(0, 0, 0, 0);
  return cur.toISOString().slice(0, 10);
}

export function addUtcDaysFromYmd(ymd: string, deltaDays: number): string {
  const d = new Date(`${ymd}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

/** Cuenta días consecutivos con registro, desde hoy UTC hacia atrás. */
export function computeStreakUtc(readDays: Iterable<string>): number {
  const daySet = new Set(readDays);
  const cur = new Date();
  cur.setUTCHours(0, 0, 0, 0);
  let count = 0;
  while (daySet.has(cur.toISOString().slice(0, 10))) {
    count += 1;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return count;
}

export function streakDateKeys(streak: number, todayKey: string): Set<string> {
  const s = new Set<string>();
  if (streak <= 0) return s;
  let ymd = todayKey;
  for (let i = 0; i < streak; i++) {
    s.add(ymd);
    ymd = addUtcDaysFromYmd(ymd, -1);
  }
  return s;
}

export type ReadingWeekCell = {
  day: string;
  weekday: string;
  is_read: boolean;
  is_streak: boolean;
  is_today: boolean;
};

/** Siete columnas: (hoy UTC − 6) … hoy UTC, orden izquierda → derecha. */
export function buildReadingWeekUtc(readDays: Iterable<string>): {
  week: ReadingWeekCell[];
  streak: number;
  todayKey: string;
} {
  const readSet = new Set(readDays);
  const todayKey = utcTodayKey();
  const streak = computeStreakUtc(readSet);
  const streakKeys = streakDateKeys(streak, todayKey);
  const week: ReadingWeekCell[] = [];
  for (let off = -6; off <= 0; off++) {
    const dayKey = addUtcDaysFromYmd(todayKey, off);
    const d = new Date(`${dayKey}T00:00:00.000Z`);
    const weekday = ['L', 'M', 'M', 'J', 'V', 'S', 'D'][(d.getUTCDay() + 6) % 7];
    week.push({
      day: dayKey,
      weekday,
      is_read: readSet.has(dayKey),
      is_streak: streakKeys.has(dayKey),
      is_today: dayKey === todayKey,
    });
  }
  return { week, streak, todayKey };
}
