import { useEffect, useRef, useState } from "react"
import { Check, ImagePlus, Search, X } from "lucide-react"
import type { MediaFolder } from "../types"
import { mediaUrl } from "../mediaStorage"
import { useMediaAssets } from "./useMediaAssets"

const PICKER_CSS = `
.cc-asset-picker{border:1px solid #eadfd6;border-radius:10px;background:#fffaf6;padding:12px;box-shadow:0 10px 24px rgba(48,39,34,.1);position:relative;z-index:3}.cc-asset-picker-head{display:flex;align-items:center;gap:8px;margin-bottom:9px}.cc-asset-picker-head h3{font:400 17px 'DM Serif Display',Georgia,serif;margin:0}.cc-asset-picker-close{margin-left:auto;width:26px;height:26px;display:grid;place-items:center;border:1px solid #e4dbd3;border-radius:7px;background:white;cursor:pointer}.cc-asset-picker-toolbar{display:flex;align-items:center;gap:7px;margin-bottom:9px}.cc-asset-picker-search{display:flex;align-items:center;gap:6px;flex:1;border:1px solid #e4dbd3;border-radius:7px;background:white;padding:0 8px;height:29px}.cc-asset-picker-search input{border:0;outline:0;width:100%;font-size:9px;background:transparent}.cc-asset-picker-upload{height:29px;display:flex;align-items:center;gap:5px;padding:0 9px;border:1px solid #d97856;border-radius:7px;background:#fff0e8;color:#a84f36;font-size:9px;cursor:pointer;white-space:nowrap}.cc-asset-picker-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;max-height:190px;overflow:auto}.cc-asset-picker-item{position:relative;aspect-ratio:1;border:1px solid #e2d8ce;border-radius:6px;overflow:hidden;background:#eee6de;cursor:pointer;padding:0}.cc-asset-picker-item.selected{box-shadow:inset 0 0 0 2px #d46d4a}.cc-asset-picker-item img{width:100%;height:100%;display:block;object-fit:cover}.cc-asset-picker-item input{position:absolute;left:5px;top:5px;width:14px;height:14px;accent-color:#c85b3b;z-index:1}.cc-asset-picker-empty{padding:20px 8px;text-align:center;color:#7a6a62;font-size:9px;grid-column:1/-1}.cc-asset-picker-error{margin:7px 0 0;color:#ad5144;font-size:9px}.cc-asset-picker-foot{display:flex;align-items:center;justify-content:space-between;margin-top:9px;color:#7a6a62;font-size:9px}.cc-asset-picker-clear{border:0;background:transparent;color:#a84f36;font-size:9px;cursor:pointer}.cc-asset-picker-check{position:absolute;right:5px;bottom:5px;width:16px;height:16px;border-radius:50%;background:#c85b3b;color:white;display:grid;place-items:center}
@media(max-width:650px){.cc-asset-picker-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.cc-asset-picker-toolbar{align-items:stretch;flex-direction:column}.cc-asset-picker-upload{justify-content:center}}
`

export function MediaAssetPicker({
  selectedIds,
  onChange,
  onClose,
  multiple = true,
  folder = "brand",
  title = "Choose media",
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onClose?: () => void
  multiple?: boolean
  folder?: MediaFolder
  title?: string
}) {
  const { items, urls, error, uploadFiles } = useMediaAssets()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const filtered = items.filter((item) =>
    `${item.filename} ${item.description} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  )
  function toggle(id: string) {
    if (selectedIds.includes(id))
      onChange(selectedIds.filter((item) => item !== id))
    else onChange(multiple ? [...selectedIds, id] : [id])
  }
  async function filesChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const added = event.target.files?.length
      ? await uploadFiles(event.target.files, folder)
      : []
    if (added.length)
      onChange(
        multiple
          ? [...selectedIds, ...added.map((item) => item.id)]
          : [added[0].id]
      )
    event.target.value = ""
  }

  return (
    <div className="cc-asset-picker" role="dialog" aria-label={title}>
      <style>{PICKER_CSS}</style>
      <div className="cc-asset-picker-head">
        <ImagePlus size={15} color="#bd7249" />
        <h3>{title}</h3>
        {onClose && (
          <button
            type="button"
            className="cc-asset-picker-close"
            onClick={onClose}
            aria-label="Close media picker"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <div className="cc-asset-picker-toolbar">
        <label className="cc-asset-picker-search">
          <Search size={12} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search media"
            aria-label="Search media"
          />
        </label>
        <button
          type="button"
          className="cc-asset-picker-upload"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={12} />
          Upload from device
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(event) => void filesChanged(event)}
        />
      </div>
      <div className="cc-asset-picker-grid">
        {filtered.length ? (
          filtered.map((item) => (
            <label
              key={item.id}
              className={`cc-asset-picker-item${selectedIds.includes(item.id) ? "selected" : ""}`}
              title={item.filename}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={`Select ${item.filename}`}
              />
              {mediaUrl(item, urls) ? (
                <img
                  src={mediaUrl(item, urls)}
                  alt={item.description || item.filename}
                />
              ) : (
                <span
                  aria-label="Image unavailable"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "#9a8a82",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {item.extension || "IMG"}
                </span>
              )}
              {selectedIds.includes(item.id) && (
                <span className="cc-asset-picker-check">
                  <Check size={10} />
                </span>
              )}
            </label>
          ))
        ) : (
          <div className="cc-asset-picker-empty">
            No uploaded media yet. Choose an image from your device to add one.
          </div>
        )}
      </div>
      {error && (
        <div className="cc-asset-picker-error" role="alert">
          {error}
        </div>
      )}
      <div className="cc-asset-picker-foot">
        <span>
          {selectedIds.length} selected{multiple ? "" : " (one image)"}
        </span>
        {selectedIds.length > 0 && (
          <button
            type="button"
            className="cc-asset-picker-clear"
            onClick={() => onChange([])}
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  )
}
