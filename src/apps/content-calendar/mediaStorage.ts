import type { ContentCalendarWorkspaceBackup, MediaFolder, MediaItem } from './types';

export interface StoredMediaItem extends MediaItem {
  blob?: Blob;
  dataUrl?: string;
}

const MEDIA_METADATA_KEY = 'content-edit.media.v2';
const DB_NAME = 'content-edit-media';
const STORE_NAME = 'media';
const DB_VERSION = 2;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_FALLBACK_BYTES = 4 * 1024 * 1024;
const REFERENCE_KEYS = ['content-edit.campaigns.v2', 'content-edit.pipeline.v2', 'content-edit.composer.v1', 'content-edit.composer-posts.v1', 'content-edit.templates.v1', 'content-edit.templates.v2'];

function canUseIndexedDb() { return typeof window !== 'undefined' && typeof indexedDB !== 'undefined'; }

function readMetadata(): StoredMediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEDIA_METADATA_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeMetadata(items: StoredMediaItem[]) {
  if (typeof window === 'undefined') return;
  const serializable = items.map(item => { const copy = { ...item }; delete copy.blob; return copy; });
  try { window.localStorage.setItem(MEDIA_METADATA_KEY, JSON.stringify(serializable)); }
  catch { throw new Error('Media metadata could not be saved. Clear workspace storage and try again.'); }
}

function collectUsage(value: unknown, ownerId: string | undefined, usage: Map<string, Set<string>>) {
  if (Array.isArray(value)) { value.forEach(item => collectUsage(item, ownerId, usage)); return; }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  const nextOwner = typeof record.id === 'string' ? record.id : ownerId;
  if (typeof record.mediaId === 'string' && nextOwner) {
    const owners = usage.get(record.mediaId) ?? new Set<string>(); owners.add(nextOwner); usage.set(record.mediaId, owners);
  }
  if (Array.isArray(record.mediaIds) && nextOwner) record.mediaIds.forEach(id => { if (typeof id === 'string') { const owners = usage.get(id) ?? new Set<string>(); owners.add(nextOwner); usage.set(id, owners); } });
  if (typeof record.coverMediaId === 'string' && nextOwner) {
    const owners = usage.get(record.coverMediaId) ?? new Set<string>(); owners.add(nextOwner); usage.set(record.coverMediaId, owners);
  }
  Object.values(record).forEach(child => collectUsage(child, nextOwner, usage));
}

export function recalculateMediaUsage() {
  if (typeof window === 'undefined') return;
  const usage = new Map<string, Set<string>>();
  REFERENCE_KEYS.forEach(key => {
    try { collectUsage(JSON.parse(window.localStorage.getItem(key) ?? '[]'), undefined, usage); } catch { /* malformed content is ignored */ }
  });
  const next = readMetadata().map(item => ({ ...item, usedInIds: Array.from(usage.get(item.id) ?? []) }));
  try { writeMetadata(next); } catch { /* usage metadata is derived and can be rebuilt after a quota recovery */ }
}

function openDatabase(): Promise<IDBDatabase> {
  if (!canUseIndexedDb()) return Promise.reject(new Error('IndexedDB is unavailable.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open local media storage.'));
  });
}

function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  return openDatabase().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error ?? new Error('Media storage transaction failed.'));
    run(tx.objectStore(STORE_NAME), resolve, reject);
  }));
}

function legacyRecordIsSample(item: StoredMediaItem) {
  return item.id.startsWith('seed-media-') || item.source?.kind === 'reference';
}

async function getBlob(id: string): Promise<Blob | undefined> {
  return transaction<Blob | undefined>('readonly', (store, resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.blob as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function putBlob(id: string, blob: Blob): Promise<void> {
  return transaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.put({ id, blob });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteBlob(id: string): Promise<void> {
  if (!canUseIndexedDb()) return;
  return transaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FALLBACK_BYTES) { reject(new Error('This image is too large for the localStorage fallback.')); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

function blobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not serialize image data.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlAsBlob(dataUrl: string): Blob {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) throw new Error('Backup contains invalid image data.');
  const mimeType = match[1] || 'application/octet-stream';
  const binary = match[2] ? atob(match[3]) : decodeURIComponent(match[3]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

export async function loadMedia(): Promise<StoredMediaItem[]> {
  let metadata = readMetadata();
  if (!metadata.length && canUseIndexedDb()) {
    try {
      const legacy = await transaction<StoredMediaItem[]>('readonly', (store, resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as StoredMediaItem[]);
        request.onerror = () => reject(request.error);
      });
      const userItems = legacy.filter(item => !legacyRecordIsSample(item));
      if (userItems.length) { writeMetadata(userItems); metadata = userItems; }
      await Promise.all(legacy.filter(legacyRecordIsSample).map(item => deleteBlob(item.id)));
    } catch { /* localStorage remains a valid empty fallback */ }
  }
  metadata = metadata.filter(item => !legacyRecordIsSample(item));
  return Promise.all(metadata.map(async item => {
    if (item.dataUrl || !canUseIndexedDb()) return item;
    try { return { ...item, blob: await getBlob(item.id) }; } catch { return item; }
  }));
}

export async function saveMedia(item: StoredMediaItem): Promise<void> {
  const metadata = { ...item, blob: undefined } as StoredMediaItem;
  if (item.blob && canUseIndexedDb()) { await putBlob(item.id, item.blob); delete metadata.dataUrl; }
  else if (item.blob && !item.dataUrl) metadata.dataUrl = await readAsDataUrl(item.blob as File);
  writeMetadata([...readMetadata().filter(existing => existing.id !== item.id), metadata]);
  recalculateMediaUsage();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('content-edit:media-changed'));
}

export async function deleteMedia(id: string): Promise<void> {
  writeMetadata(readMetadata().filter(item => item.id !== id));
  await deleteBlob(id).catch(() => undefined);
  recalculateMediaUsage();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('content-edit:media-changed'));
}

export async function clearMediaStorage(): Promise<void> {
  if (typeof window !== 'undefined') window.localStorage.removeItem(MEDIA_METADATA_KEY);
  if (!canUseIndexedDb()) return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

export async function exportMediaBackup(): Promise<ContentCalendarWorkspaceBackup['media']> {
  const items = await loadMedia();
  return Promise.all(items.map(async item => {
    const { blob, dataUrl, ...metadata } = item;
    const serializedData = dataUrl || (blob ? await blobAsDataUrl(blob) : undefined);
    return { metadata: { ...metadata, usedInIds: item.usedInIds ?? [] }, dataUrl: serializedData };
  }));
}

export async function replaceMediaFromBackup(records: ContentCalendarWorkspaceBackup['media']): Promise<void> {
  await clearMediaStorage();
  for (const record of records) {
    const item: StoredMediaItem = {
      ...record.metadata,
      usedInIds: Array.isArray(record.metadata.usedInIds) ? record.metadata.usedInIds : [],
      ...(record.dataUrl ? { blob: dataUrlAsBlob(record.dataUrl) } : {}),
    };
    await saveMedia(item);
  }
  recalculateMediaUsage();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('content-edit:media-changed'));
}

async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    const result = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return result;
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image dimensions.')); };
    image.src = url;
  });
}

export async function storeUpload(file: File, folder: MediaFolder = 'brand'): Promise<StoredMediaItem> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);
  const dimensions = await imageDimensions(file);
  if (!dimensions.width || !dimensions.height) throw new Error(`${file.name} has no readable dimensions.`);
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : file.type.split('/').pop()!.toUpperCase();
  const item: StoredMediaItem = {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: file.name,
    description: '',
    mimeType: file.type,
    extension,
    width: dimensions.width,
    height: dimensions.height,
    size: file.size,
    folder,
    createdAt: new Date().toISOString(),
    tags: [],
    usedInIds: [],
    source: { kind: 'upload' },
    blob: file,
  };
  await saveMedia(item);
  return item;
}

export function mediaUrl(item: StoredMediaItem, urls: Record<string, string>) {
  return item.dataUrl || urls[item.id] || '';
}
