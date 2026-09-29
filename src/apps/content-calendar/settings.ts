import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import type {
  ContentCalendarAccent,
  ContentCalendarSettings,
  DateFormatPreference,
  WeekStartPreference,
} from './types';

export const SETTINGS_STORAGE_KEY = 'content-edit.settings.v1';
export const LEGACY_THEME_STORAGE_KEY = 'content-edit.theme.v1';
export const LEGACY_ACCENT_STORAGE_KEY = 'content-edit.accent.v1';
export const APPROVED_ACCENTS: ContentCalendarAccent[] = ['#d97856', '#9e6080', '#7a9db5', '#d4a843'];

const DATE_FORMATS: DateFormatPreference[] = ['medium', 'day-first', 'month-first', 'iso'];
const WEEK_STARTS: WeekStartPreference[] = [0, 1, 6];
const BACKUP_INTERVALS = [3, 7, 14, 30] as const;

function nonnegativeInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function defaultContentCalendarSettings(now = new Date()): ContentCalendarSettings {
  return {
    version: 1,
    theme: 'light',
    accent: '#d97856',
    backupIntervalDays: 7,
    workspaceStartedAt: now.toISOString(),
    dateFormat: 'medium',
    weekStartsOn: 1,
    monthlyContentGoal: 20,
    platformTargets: {},
  };
}

export function normalizeContentCalendarSettings(value: unknown): ContentCalendarSettings {
  const defaults = defaultContentCalendarSettings();
  const source = value && typeof value === 'object' ? value as Partial<ContentCalendarSettings> : {};
  const accent = APPROVED_ACCENTS.includes(source.accent as ContentCalendarAccent)
    ? source.accent as ContentCalendarAccent
    : defaults.accent;
  const backupIntervalDays = BACKUP_INTERVALS.includes(source.backupIntervalDays as (typeof BACKUP_INTERVALS)[number])
    ? source.backupIntervalDays as ContentCalendarSettings['backupIntervalDays']
    : defaults.backupIntervalDays;
  const dateFormat = DATE_FORMATS.includes(source.dateFormat as DateFormatPreference)
    ? source.dateFormat as DateFormatPreference
    : defaults.dateFormat;
  const weekStartsOn = WEEK_STARTS.includes(source.weekStartsOn as WeekStartPreference)
    ? source.weekStartsOn as WeekStartPreference
    : defaults.weekStartsOn;
  const platformTargets = source.platformTargets && typeof source.platformTargets === 'object'
    ? Object.fromEntries(Object.entries(source.platformTargets).map(([id, target]) => [id, nonnegativeInteger(target, 0)]))
    : {};
  return {
    version: 1,
    theme: source.theme === 'dark' ? 'dark' : 'light',
    accent,
    backupIntervalDays,
    lastBackupAt: typeof source.lastBackupAt === 'string' && !Number.isNaN(Date.parse(source.lastBackupAt)) ? source.lastBackupAt : undefined,
    backupReminderDismissedUntil: typeof source.backupReminderDismissedUntil === 'string' && !Number.isNaN(Date.parse(source.backupReminderDismissedUntil)) ? source.backupReminderDismissedUntil : undefined,
    workspaceStartedAt: typeof source.workspaceStartedAt === 'string' && !Number.isNaN(Date.parse(source.workspaceStartedAt)) ? source.workspaceStartedAt : defaults.workspaceStartedAt,
    dateFormat,
    weekStartsOn,
    monthlyContentGoal: nonnegativeInteger(source.monthlyContentGoal, defaults.monthlyContentGoal),
    platformTargets,
  };
}

export function readContentCalendarSettings(): ContentCalendarSettings {
  if (typeof window === 'undefined') return defaultContentCalendarSettings();
  let raw: unknown;
  try { raw = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? 'null'); } catch { raw = null; }
  const migrated = normalizeContentCalendarSettings({
    ...(raw && typeof raw === 'object' ? raw : {}),
    theme: (raw as Partial<ContentCalendarSettings> | null)?.theme ?? window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY),
    accent: (raw as Partial<ContentCalendarSettings> | null)?.accent ?? window.localStorage.getItem(LEGACY_ACCENT_STORAGE_KEY),
  });
  const serialized = JSON.stringify(migrated);
  if (window.localStorage.getItem(SETTINGS_STORAGE_KEY) !== serialized) {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
  }
  window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_ACCENT_STORAGE_KEY);
  return migrated;
}

export function writeContentCalendarSettings(settings: ContentCalendarSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeContentCalendarSettings(settings)));
}

export function formatContentDate(value: Date | string, preference: DateFormatPreference) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  if (Number.isNaN(date.getTime())) return '';
  if (preference === 'day-first') return format(date, 'dd/MM/yyyy');
  if (preference === 'month-first') return format(date, 'MM/dd/yyyy');
  if (preference === 'iso') return format(date, 'yyyy-MM-dd');
  return format(date, 'MMM d, yyyy');
}

export function contentWeekBounds(date: Date, weekStartsOn: WeekStartPreference) {
  const start = startOfWeek(date, { weekStartsOn });
  return { start, end: endOfWeek(date, { weekStartsOn }) };
}

export function formatContentWeek(date: Date, settings: Pick<ContentCalendarSettings, 'dateFormat' | 'weekStartsOn'>) {
  const { start, end } = contentWeekBounds(date, settings.weekStartsOn);
  return `${formatContentDate(start, settings.dateFormat)} - ${formatContentDate(end, settings.dateFormat)}`;
}

export function backupReminderIsDue(settings: ContentCalendarSettings, now = new Date()) {
  if (settings.backupReminderDismissedUntil && Date.parse(settings.backupReminderDismissedUntil) > now.getTime()) return false;
  const baseline = settings.lastBackupAt ?? settings.workspaceStartedAt;
  return addDays(new Date(baseline), settings.backupIntervalDays).getTime() <= now.getTime();
}
