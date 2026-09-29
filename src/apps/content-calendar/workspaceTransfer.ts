import type {
  Campaign,
  ContentCalendarSettings,
  ContentCalendarWorkspaceBackup,
  ContentPost,
  PipelineItem,
  PipelineStage,
  Platform,
  PostStatus,
} from './types';
import { exportMediaBackup, replaceMediaFromBackup } from './mediaStorage';
import { normalizeContentCalendarSettings, SETTINGS_STORAGE_KEY, writeContentCalendarSettings } from './settings';

const WORKSPACE_KEYS = [
  'content-edit.pipeline.v2',
  'content-edit.ideas.v1',
  'content-edit.composer.v1',
  'content-edit.composer-posts.v1',
  'content-edit.campaigns.v2',
  'content-edit.templates.v2',
  'content-edit.analytics.v1',
  'content-edit.custom-platforms.v1',
  'content-edit.active-platforms.v1',
] as const;

export interface ScheduleCsvRecord {
  title: string;
  status: PostStatus;
  stage: PipelineStage;
  scheduledDate: string;
  scheduledTime?: string;
  platforms: Platform[];
  contentType: string;
  campaignId?: string;
  notes?: string;
}

export async function createWorkspaceBackup(settings: ContentCalendarSettings): Promise<ContentCalendarWorkspaceBackup> {
  const exportedAt = new Date().toISOString();
  const storage: Record<string, unknown> = {};
  if (typeof window !== 'undefined') {
    WORKSPACE_KEYS.forEach(key => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      try { storage[key] = JSON.parse(raw); } catch { storage[key] = []; }
    });
  }
  return {
    kind: 'content-edit-workspace',
    version: 1,
    exportedAt,
    settings: normalizeContentCalendarSettings({
      ...settings,
      lastBackupAt: exportedAt,
      backupReminderDismissedUntil: undefined,
    }),
    storage,
    media: await exportMediaBackup(),
  };
}

export function validateWorkspaceBackup(value: unknown): ContentCalendarWorkspaceBackup {
  if (!value || typeof value !== 'object') throw new Error('This file is not a workspace backup.');
  const backup = value as Partial<ContentCalendarWorkspaceBackup>;
  if (backup.kind !== 'content-edit-workspace' || backup.version !== 1) throw new Error('This backup version is not supported.');
  if (!backup.storage || typeof backup.storage !== 'object' || Array.isArray(backup.storage)) throw new Error('The backup content section is invalid.');
  Object.entries(backup.storage).forEach(([key, storedValue]) => {
    if (!WORKSPACE_KEYS.includes(key as (typeof WORKSPACE_KEYS)[number])) return;
    if (key === 'content-edit.custom-platforms.v1') {
      if (!storedValue || typeof storedValue !== 'object' || Array.isArray(storedValue)) throw new Error('The backup contains invalid custom-platform data.');
      return;
    }
    if (!Array.isArray(storedValue)) throw new Error(`The backup contains invalid data for ${key}.`);
    if (key === 'content-edit.active-platforms.v1') {
      if (!storedValue.every(item => typeof item === 'string')) throw new Error('The backup contains invalid active-platform data.');
      return;
    }
    if (!storedValue.every(item => item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string')) {
      throw new Error(`The backup contains an invalid record in ${key}.`);
    }
  });
  if (!Array.isArray(backup.media)) throw new Error('The backup media section is invalid.');
  backup.media.forEach(record => {
    if (!record || typeof record !== 'object' || !record.metadata || typeof record.metadata.id !== 'string') throw new Error('The backup contains an invalid media record.');
    if (record.dataUrl !== undefined && (typeof record.dataUrl !== 'string' || !record.dataUrl.startsWith('data:'))) throw new Error('The backup contains invalid image data.');
  });
  return {
    kind: 'content-edit-workspace',
    version: 1,
    exportedAt: typeof backup.exportedAt === 'string' ? backup.exportedAt : new Date().toISOString(),
    settings: normalizeContentCalendarSettings(backup.settings),
    storage: backup.storage as Record<string, unknown>,
    media: backup.media,
  };
}

export async function restoreWorkspaceBackup(value: unknown): Promise<void> {
  if (typeof window === 'undefined') throw new Error('Workspace restore is only available in the browser.');
  const backup = validateWorkspaceBackup(value);
  const previousStorage = new Map<string, string | null>([
    ...WORKSPACE_KEYS.map(key => [key, window.localStorage.getItem(key)] as const),
    [SETTINGS_STORAGE_KEY, window.localStorage.getItem(SETTINGS_STORAGE_KEY)] as const,
  ]);
  const previousMedia = await exportMediaBackup();
  try {
    WORKSPACE_KEYS.forEach(key => window.localStorage.removeItem(key));
    Object.entries(backup.storage).forEach(([key, data]) => {
      if (WORKSPACE_KEYS.includes(key as (typeof WORKSPACE_KEYS)[number])) window.localStorage.setItem(key, JSON.stringify(data));
    });
    writeContentCalendarSettings(backup.settings);
    await replaceMediaFromBackup(backup.media);
  } catch (error) {
    previousStorage.forEach((raw, key) => raw === null ? window.localStorage.removeItem(key) : window.localStorage.setItem(key, raw));
    await replaceMediaFromBackup(previousMedia).catch(() => undefined);
    throw error instanceof Error ? error : new Error('The workspace could not be restored.');
  }
}

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function stageStatus(stage: PipelineStage): PostStatus {
  return stage === 'published' ? 'Published' : stage === 'ready' ? 'Scheduled' : stage === 'drafting' ? 'Draft' : 'Planned';
}

function statusStage(status: PostStatus): PipelineStage {
  return status === 'Published' ? 'published' : status === 'Scheduled' ? 'ready' : status === 'Draft' ? 'drafting' : 'ideas';
}

function validDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]);
}

export function createScheduleCsv(posts: ContentPost[], pipelineItems: PipelineItem[], campaigns: Campaign[]) {
  const campaignNames = new Map(campaigns.map(campaign => [campaign.id, campaign.name]));
  const records = new Map<string, ScheduleCsvRecord>();
  posts.forEach(post => records.set(post.pipelineId ? `pipeline:${post.pipelineId}` : post.composerId ? `composer:${post.composerId}` : `post:${post.id}`, {
    title: post.title,
    status: post.status,
    stage: statusStage(post.status),
    scheduledDate: post.date,
    scheduledTime: post.time,
    platforms: post.platforms,
    contentType: post.type,
    campaignId: post.campaignId,
  }));
  pipelineItems.forEach(item => records.set(`pipeline:${item.id}`, {
    title: item.title,
    status: stageStatus(item.stage),
    stage: item.stage,
    scheduledDate: item.scheduledDate,
    scheduledTime: item.scheduledTime,
    platforms: item.platforms,
    contentType: item.contentType,
    campaignId: item.campaignId,
    notes: item.notes,
  }));
  const header = ['title', 'status', 'stage', 'scheduledDate', 'scheduledTime', 'platforms', 'contentType', 'campaignId', 'campaignName', 'notes'];
  const rows = Array.from(records.values()).map(record => [
    record.title, record.status, record.stage, record.scheduledDate, record.scheduledTime ?? '', record.platforms.join('|'),
    record.contentType, record.campaignId ?? '', record.campaignId ? campaignNames.get(record.campaignId) ?? '' : '', record.notes ?? '',
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (!quoted && char === ',') { row.push(cell); cell = ''; continue; }
    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; continue;
    }
    cell += char;
  }
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

export function parseScheduleCsv(
  text: string,
  options: { campaigns: Campaign[]; validPlatforms: Set<string>; isValidPostType: (platform: string, postType: string) => boolean },
) {
  const rows = parseCsvRows(text);
  if (!rows.length) throw new Error('The CSV file is empty.');
  const header = rows[0].map(value => value.trim());
  const required = ['title', 'scheduledDate', 'platforms', 'contentType'];
  if (required.some(column => !header.includes(column))) throw new Error(`CSV must include: ${required.join(', ')}.`);
  const index = Object.fromEntries(header.map((column, position) => [column, position]));
  const campaignsByName = new Map(options.campaigns.map(campaign => [campaign.name.toLowerCase(), campaign.id]));
  const records: ScheduleCsvRecord[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  rows.slice(1).forEach(row => {
    const title = row[index.title]?.trim();
    const scheduledDate = row[index.scheduledDate]?.trim();
    const contentType = row[index.contentType]?.trim();
    const platforms = (row[index.platforms] ?? '').split('|').map(value => value.trim()).filter(platform => options.validPlatforms.has(platform));
    if (!title || !validDateKey(scheduledDate) || !contentType || !platforms.length || !platforms.every(platform => options.isValidPostType(platform, contentType))) { skipped += 1; return; }
    const rawStage = row[index.stage]?.trim() as PipelineStage;
    const rawStatus = row[index.status]?.trim() as PostStatus;
    const stage: PipelineStage = ['ideas', 'drafting', 'ready', 'published'].includes(rawStage) ? rawStage : statusStage(rawStatus);
    const campaignIdValue = row[index.campaignId]?.trim();
    const campaignName = row[index.campaignName]?.trim().toLowerCase();
    const campaignId = options.campaigns.some(campaign => campaign.id === campaignIdValue) ? campaignIdValue : campaignsByName.get(campaignName);
    const signature = [title.toLowerCase(), scheduledDate, row[index.scheduledTime]?.trim() ?? '', platforms.slice().sort().join('|'), contentType, campaignId ?? ''].join('::');
    if (seen.has(signature)) { skipped += 1; return; }
    seen.add(signature);
    records.push({
      title, stage, status: stageStatus(stage), scheduledDate, scheduledTime: row[index.scheduledTime]?.trim() || undefined,
      platforms, contentType, campaignId, notes: row[index.notes]?.trim() || undefined,
    });
  });
  return { records, skipped };
}

export function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
