import type { MediaFolder, MediaItem } from './types';

export interface StoredMediaItem extends MediaItem {
  blob?: Blob;
}

const DB_NAME = 'content-edit-media';
const STORE_NAME = 'media';
const DB_VERSION = 1;

const SEED_CROPS = [
  [208,343],[341,343],[475,343],[609,343],[744,343],
  [208,455],[341,455],[475,455],[609,455],[744,455],
  [208,566],[341,566],[475,566],[609,566],[744,566],
];
const SEED_FILENAMES = ['sunlit-archway-terracotta.jpg','shoreline-blue.jpg','morning-coffee.jpg','wildflower-shadows.jpg','lemon-still-life.jpg','slow-morning.jpg','palm-shadow.jpg','coastal-village.jpg','white-architecture.jpg','linen-bedroom.jpg','desert-cactus.jpg','california-palms.jpg','glass-and-light.jpg','terracotta-shadows.jpg','good-content-notes.jpg'];
const SEED_FOLDERS: MediaFolder[] = ['brand','campaigns','brand','brand','campaigns','brand','campaigns','campaigns','brand','brand','brand','campaigns','reels','carousels','carousels'];

export const MEDIA_SEED: StoredMediaItem[] = SEED_CROPS.map(([x,y], index) => ({
  id: `seed-media-${index + 1}`, filename: SEED_FILENAMES[index], description: index === 0 ? 'Warm architectural image for lifestyle and campaign content.' : '', mimeType: 'image/jpeg', extension: 'JPG', width: 1600, height: 1200, size: 1_400_000, folder: SEED_FOLDERS[index], createdAt: `2025-04-${String(24 - (index % 10)).padStart(2,'0')}T10:00:00.000Z`, tags: index === 0 ? ['architecture','lifestyle','aesthetic'] : index % 3 === 0 ? ['aesthetic'] : ['lifestyle'], usedInIds: index === 0 ? ['pi-4','pi-7','pi-5'] : [], source: { kind: 'reference', crop: { x, y, source: 'media' } },
}));

function openDatabase(): Promise<IDBDatabase> {
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

export async function loadMedia(seed: StoredMediaItem[]): Promise<StoredMediaItem[]> {
  const items = await transaction<StoredMediaItem[]>('readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as StoredMediaItem[]);
    request.onerror = () => reject(request.error);
  });
  if (items.length) return items;
  await transaction<void>('readwrite', (store, resolve, reject) => {
    for (const item of seed) store.put(item);
    const request = store.count();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return seed;
}

export function saveMedia(item: StoredMediaItem): Promise<void> {
  return transaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const result = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return result;
}

export async function storeUpload(file: File, folder: MediaFolder = 'brand'): Promise<StoredMediaItem> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  const dimensions = await imageDimensions(file);
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
