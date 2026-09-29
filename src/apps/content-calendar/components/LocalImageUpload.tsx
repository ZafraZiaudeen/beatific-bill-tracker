import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { MediaFolder } from '../types';
import { deleteMedia, mediaUrl, storeUpload } from '../mediaStorage';
import { useContentCalendarStore } from '../store';
import { useMediaAssets } from './useMediaAssets';

const UPLOAD_CSS = `.cc-local-image-upload{display:grid;gap:8px}.cc-local-image-upload-list{display:flex;gap:7px;flex-wrap:wrap}.cc-local-image-upload-item{position:relative;width:68px;height:58px;border-radius:7px;overflow:hidden;background:#eee6de;border:1px solid #e2d8ce}.cc-local-image-upload-item img{width:100%;height:100%;display:block;object-fit:cover}.cc-local-image-upload-remove{position:absolute;right:3px;top:3px;width:18px;height:18px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:#9c4e42;cursor:pointer}.cc-local-image-upload-button{min-height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px dashed #d6c8bd;border-radius:8px;background:#fff;color:#7a6a62;padding:8px 10px;font-size:10px;cursor:pointer}.cc-local-image-upload-button:disabled{opacity:.55;cursor:wait}.cc-local-image-upload-error{color:#ad5144;font-size:10px}`;

export function LocalImageUpload({ value, onChange, multiple = false, folder = 'brand', label }: { value: string[]; onChange: (ids: string[]) => void; multiple?: boolean; folder?: MediaFolder; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, urls } = useMediaAssets();
  const removeMediaReferences = useContentCalendarStore(state => state.removeMediaReferences);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = value.map(id => items.find(item => item.id === id)).filter(Boolean);

  async function remove(id: string) {
    setError('');
    onChange(value.filter(item => item !== id));
    removeMediaReferences(id);
    await deleteMedia(id).catch(reason => setError(reason instanceof Error ? reason.message : 'The old image could not be removed.'));
  }

  async function filesChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    const added: string[] = [];
    const failures: string[] = [];
    try {
      for (const file of files) {
        try {
          const item = await storeUpload(file, folder);
          added.push(item.id);
        } catch (reason) {
          failures.push(reason instanceof Error ? reason.message : `${file.name} could not be uploaded.`);
        }
      }
      if (added.length) {
        const oldIds = multiple ? [] : value;
        const next = multiple ? [...value, ...added] : [added[0]];
        onChange(Array.from(new Set(next)));
        for (const oldId of oldIds) {
          removeMediaReferences(oldId);
          await deleteMedia(oldId).catch(reason => failures.push(reason instanceof Error ? reason.message : 'The replaced image could not be removed.'));
        }
      }
      if (failures.length) setError(failures.join(' '));
    } finally {
      setBusy(false);
    }
  }

  return <div className="cc-local-image-upload">
    <style>{UPLOAD_CSS}</style>
    {selected.length > 0 && <div className="cc-local-image-upload-list">{selected.map(item => item && <div className="cc-local-image-upload-item" key={item.id}>{mediaUrl(item, urls) ? <img src={mediaUrl(item, urls)} alt={item.description || item.filename} /> : <span aria-label="Image unavailable" /> }<button type="button" className="cc-local-image-upload-remove" onClick={() => void remove(item.id)} aria-label={`Remove ${item.filename}`}><X size={11} /></button></div>)}</div>}
    <button type="button" className="cc-local-image-upload-button" onClick={() => inputRef.current?.click()} disabled={busy}><ImagePlus size={13} />{busy ? 'Saving image…' : label ?? (value.length ? (multiple ? 'Add another image' : 'Replace image') : 'Upload image')}</button>
    <input ref={inputRef} hidden type="file" accept="image/*" multiple={multiple} onChange={event => void filesChanged(event)} />
    {error && <div className="cc-local-image-upload-error" role="alert">{error}</div>}
  </div>;
}
