const dayMs = 24 * 60 * 60 * 1000;

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getTodayIsoDate() {
  return normalizeDate(new Date()).toISOString().slice(0, 10);
}

export function getDaysBetween(startIsoDate: string, endIsoDate: string) {
  const start = normalizeDate(new Date(startIsoDate));
  const end = normalizeDate(new Date(endIsoDate));
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / dayMs));
}
