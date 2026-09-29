import { useEffect, useRef, useState } from 'react';
import { loadMedia, storeUpload } from '../mediaStorage';
import type { StoredMediaItem } from '../mediaStorage';
import type { MediaFolder } from '../types';

export function useMediaAssets() {
  const [items, setItems] = useState<StoredMediaItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const objectUrls = useRef<string[]>([]);

  async function refresh() {
    const records = await loadMedia();
    objectUrls.current.forEach(url => URL.revokeObjectURL(url));
    const nextUrls: Record<string, string> = {};
    const nextObjectUrls: string[] = [];
    records.forEach(record => {
      if (record.blob) {
        const url = URL.createObjectURL(record.blob);
        nextUrls[record.id] = url;
        nextObjectUrls.push(url);
      }
    });
    objectUrls.current = nextObjectUrls;
    setItems(records);
    setUrls(nextUrls);
  }

  useEffect(() => {
    let active = true;
    const load = async () => {
      try { await refresh(); }
      catch (reason) { if (active) setError(reason instanceof Error ? reason.message : 'Media could not be loaded.'); }
    };
    void load();
    const onChanged = () => { void refresh().catch(() => undefined); };
    window.addEventListener('content-edit:media-changed', onChanged);
    return () => {
      active = false;
      window.removeEventListener('content-edit:media-changed', onChanged);
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, []);

  async function uploadFiles(files: FileList | File[], folder: MediaFolder = 'brand') {
    setError('');
    const added: StoredMediaItem[] = [];
    const failures: string[] = [];
    for (const file of Array.from(files)) {
      try { added.push(await storeUpload(file, folder)); }
      catch (reason) { failures.push(reason instanceof Error ? reason.message : `${file.name} could not be uploaded.`); }
    }
    if (failures.length) setError(failures.join(' '));
    await refresh().catch(reason => setError(reason instanceof Error ? reason.message : 'Media could not be refreshed.'));
    return added;
  }

  return { items, urls, error, setError, refresh, uploadFiles };
}
