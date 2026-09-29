import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import {
  CalendarDays,
  ArrowDown,
  ArrowUp,
  Bookmark,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Expand,
  Hash,
  Heart,
  Home,
  ImagePlus,
  Image as ImageIcon,
  Link,
  MessageCircle,
  MousePointer2,
  Music2,
  PenLine,
  Plus,
  Save,
  Search,
  Send,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  Square,
  Trash2,
  Type,
  UserCircle,
  X,
} from "lucide-react"
import { useContentCalendarStore } from "../store"
import type { ComposerDraft, ComposerChecklist, PlatformSlot, PreviewDesign, PreviewLayer } from "../types"
import { loadMedia, mediaUrl } from "../mediaStorage"
import type { StoredMediaItem } from "../mediaStorage"
import { LocalImageUpload } from "../components/LocalImageUpload"
import type { LocalImageUploadHandle } from "../components/LocalImageUpload"
import placeholderMedia from "../../../assets/content-calendar/placeholder-media.svg"
import {
  getAllPlatforms,
  getActivePlatformIds,
  getActivePlatformOptions,
  getComposerMode,
  getCompatiblePostTypes,
  getPlatformConfig,
  getPostTypeConfig,
  type PreviewLayout,
  type PlatformFieldSet,
} from "../platformConfig"

// ─── CSS ──────────────────────────────────────────────────────────────────────
const COMPOSER_CSS = `
.cc-composer{min-width:1040px;background:var(--cc-bg);color:var(--cc-text);min-height:100%;padding:16px 18px 24px}.cc-composer-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:14px}.cc-composer-heading{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0}.cc-composer-heading-row{display:flex;align-items:center;gap:10px}.cc-composer-star{color:#e8af44;transform:rotate(-8deg)}.cc-composer-line{width:118px;border-top:3px solid #d87755;border-radius:50%;margin-top:10px;transform:rotate(-2deg)}.cc-composer-actions{margin-left:auto;display:flex;gap:12px}.cc-composer-action{height:32px;border-radius:10px;padding:0 16px;display:flex;align-items:center;gap:8px;font-size:10px;border:1px solid #edd8ca;background:var(--cc-bg-2)}.cc-composer-action.primary{background:linear-gradient(90deg,#d86e4a,#dc7b57);color:#fff;border:0}.cc-composer-action.preview{background:var(--cc-bg-2);border:0}.cc-composer-body{display:flex;gap:17px;align-items:flex-start}.cc-composer-form{flex:1;min-width:0}
.cc-type-row{height:52px;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:8px;padding:8px 10px;display:grid;gap:12px;align-items:center;margin-bottom:10px}.cc-type-label{font-size:10px;font-weight:600}.cc-type-choice{height:34px;border:1px solid #e7e0d9;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:10.5px;background:rgba(255,255,255,.45);position:relative}.cc-type-choice.active{border:1.5px solid #DA7652;background:#fff0e8}
.cc-details-panel{border:1px solid #ece5de;border-radius:8px;background:var(--cc-card);overflow:hidden}.cc-details-title{height:42px;border-bottom:1px solid #ece5de;padding:13px 11px 0;font:400 18px 'DM Serif Display',Georgia,serif}.cc-details-title span{color:#e7ad43;margin-left:8px}.cc-form-columns{display:grid;grid-template-columns:1fr 1fr}.cc-form-col{padding:10px 11px}.cc-form-col:first-child{border-right:1px solid #ece5de}.cc-field-block{margin-bottom:11px;padding-bottom:10px;border-bottom:1px solid #eee7e0}.cc-field-block:last-child{border-bottom:0}.cc-field-title{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:650;margin-bottom:7px}.cc-field-title svg{color:#bd7249}
.cc-platform-section{border:1px solid #e9e2db;border-radius:8px;padding:8px;margin-bottom:10px;background:var(--cc-card)}
.cc-platform-heading{font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#839094;margin:0 0 6px}
.cc-platform-check-row,.cc-platform-tabs{display:flex;gap:7px;flex-wrap:wrap}
.cc-platform-tabs{border-top:1px solid #eee6df;margin-top:8px;padding-top:8px}
.cc-platform-check,.cc-platform-tab{height:29px;padding:0 10px;border:1.5px solid #e3ddd7;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px;background:var(--cc-input);color:var(--cc-text-2);cursor:pointer;transition:background .12s,border-color .12s}
.cc-platform-check.selected{background:#fff0e8;border-color:#DA7652;color:#3d2010}
.cc-platform-tab.active{background:var(--cc-accent-light);border-color:#52848a;color:var(--cc-text);font-weight:600}
.cc-platform-strip{border:1px solid #e9e2db;border-radius:8px;padding:8px;margin-bottom:10px;background:var(--cc-card);display:flex;gap:7px;flex-wrap:wrap}
.cc-strip-btn{height:29px;padding:0 10px;border:1.5px solid #e3ddd7;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px;background:var(--cc-input);color:var(--cc-text-2);cursor:pointer;transition:background .12s,border-color .12s}
.cc-strip-btn.selected{background:#fff7f2;border-color:#ead6c8;color:#3d2010}
.cc-strip-btn.active{background:#fff0e8;border-color:#DA7652;color:#3d2010;font-weight:700}
.cc-input-wrap{position:relative}.cc-composer textarea,.cc-composer input,.cc-composer select{font:inherit;color:inherit}.cc-textarea,.cc-text-input,.cc-select{width:100%;border:1px solid #e6dfd8;border-radius:7px;background:var(--cc-card);outline:none;font-size:9px;padding:9px}.cc-textarea{height:93px;resize:none;line-height:1.45}.cc-text-input{height:30px}.cc-select{height:30px;appearance:none}.cc-counter{position:absolute;right:8px;bottom:5px;font-size:7.5px;color:#6f7b7e}.cc-hashtags{min-height:72px;border:1px solid #e5ded7;border-radius:7px;padding:7px}.cc-hashtag-list{display:flex;flex-wrap:wrap;gap:6px}.cc-hashtag{padding:4px 8px;border-radius:99px;background:#e8f0f4;color:#52748a;font-size:10px}.cc-hashtag button{margin-left:5px}.cc-hashtag-entry{border:0!important;background:transparent!important;height:25px!important;padding:3px!important;width:120px!important;font-size:8px!important;outline:0}.cc-hash-count{float:right;font-size:8px;color:#7c8587}
.cc-publish-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-select-arrow{position:absolute;right:8px;top:9px;pointer-events:none}.cc-publish-help{font-size:7.5px;color:#869092;margin-top:5px}
.cc-media-box{border:1px dashed #d6dee0;border-radius:7px;padding:8px}.cc-media-items{display:flex;gap:6px}.cc-media-attachment{width:60px;height:54px;border-radius:5px;background-size:cover;background-position:center;position:relative}.cc-media-attachment.reference{background-size:1280px 720px}.cc-remove-media{position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.65);display:grid;place-items:center}.cc-add-media{width:58px;height:54px;border-radius:5px;background:var(--cc-bg-2);display:grid;place-items:center;color:#74909d}.cc-media-note{text-align:center;font-size:7.5px;color:#859093;margin-top:7px}
.cc-frames-list{display:flex;gap:6px;flex-wrap:wrap}.cc-frame-thumb{width:52px;height:46px;border-radius:5px;background-size:cover;background-position:center;position:relative;border:1px solid #e2dcd6}.cc-frame-num{position:absolute;top:2px;left:4px;font-size:7px;color:white;background:rgba(0,0,0,.45);padding:1px 4px;border-radius:3px}
.cc-sticker-row{display:flex;gap:6px;flex-wrap:wrap}.cc-sticker-opt{height:26px;border:1px solid #e3ddd7;border-radius:6px;padding:0 10px;font-size:8.5px;background:var(--cc-input)}.cc-sticker-opt.active{background:#ffe1cc;border-color:#DA7652}
.cc-slide-list{display:flex;flex-direction:column;gap:6px}.cc-slide-item{display:flex;gap:8px;align-items:center;border:1px solid #e8e1da;border-radius:6px;padding:6px 8px;background:var(--cc-card)}.cc-slide-thumb{width:40px;height:36px;border-radius:4px;background-size:cover;background-position:center;background-color:#e8e1da;flex-shrink:0}.cc-slide-cap{flex:1;border:1px solid #e0d9d2;border-radius:5px;background:var(--cc-input);height:26px;padding:0 7px;font-size:8px}.cc-slide-remove{color:#aaa;font-size:10px}.cc-slide-add{height:30px;border:1px dashed #c8bdb5;border-radius:6px;background:transparent;color:#7c8587;font-size:8.5px}
.cc-checklist{grid-column:1/-1;margin:0 11px 12px;padding-top:0}.cc-checklist-box{background:var(--cc-bg-2);border-radius:7px;padding:9px 14px;display:grid;grid-template-columns:1fr 1fr;gap:6px 35px}.cc-check{display:flex;align-items:center;gap:8px;font-size:8.5px}.cc-check input{accent-color:#54849b}
.cc-composer-error{padding:7px 10px;background:#fbe4df;color:#a94e3b;border-radius:6px;font-size:8.5px;margin:0 11px 10px}.cc-composer-success{padding:7px 10px;background:#e7f1ec;color:#477664;border-radius:6px;font-size:8.5px;margin:0 11px 10px}
.cc-preview-panel{width:370px;flex:0 0 370px;border:1px solid #ece5de;border-radius:8px;background:var(--cc-card);padding:14px 16px;position:sticky;top:12px;align-self:flex-start;max-height:calc(100vh - 64px);overflow:auto;display:flex;flex-direction:column}.cc-preview-title{font:400 19px 'DM Serif Display',Georgia,serif;display:flex;align-items:center;gap:8px}.cc-preview-tabs{display:flex;justify-content:flex-end;gap:5px;margin:5px 0 12px;flex-wrap:wrap}.cc-preview-tab{height:28px;padding:0 12px;border:1px solid #e7e0da;border-radius:14px;display:flex;align-items:center;gap:6px;font-size:9px}.cc-preview-tab.active{background:#ffe1cc;border-color:transparent}
.cc-phone{width:248px;height:478px;margin:0 auto 14px;background:#080b0d;border:5px solid #151719;border-radius:39px;padding:10px;box-shadow:0 0 0 2px #aeb1b1,0 8px 18px rgba(33,27,23,.16);position:relative;overflow:hidden}.cc-phone-notch{position:absolute;top:5px;left:50%;transform:translateX(-50%);width:90px;height:17px;background:#030405;border-radius:0 0 12px 12px;z-index:4}.cc-phone-island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:34px;height:11px;background:#000;border-radius:20px;z-index:100;pointer-events:none}.cc-phone-status-bar{position:absolute;top:10px;left:10px;right:10px;height:20px;display:flex;align-items:center;justify-content:space-between;padding:0 8px;z-index:99;pointer-events:none;color:#fff;font-size:8px;font-weight:600;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.55)}.cc-phone-status-icons{display:flex;align-items:center;gap:3px}.cc-phone-home{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:80px;height:4px;background:rgba(255,255,255,.35);border-radius:2px;z-index:100;pointer-events:none}.cc-phone-media{position:absolute;inset:10px;border-radius:28px;background-size:cover;background-position:center;overflow:hidden}.cc-phone-media.reference{background-size:1280px 720px}.cc-phone-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18),transparent 42%,rgba(0,0,0,.8))}.cc-phone-status{position:absolute;top:13px;left:27px;color:#fff;font-size:9px;font-weight:700;z-index:3}.cc-phone-social{position:absolute;right:18px;bottom:92px;color:#fff;display:flex;flex-direction:column;gap:12px;align-items:center;z-index:3}.cc-phone-copy{position:absolute;left:20px;right:40px;bottom:50px;color:#fff;font-size:8px;line-height:1.35;z-index:3}.cc-phone-copy strong{display:block;margin-bottom:5px}.cc-phone-copy p{white-space:pre-line;max-height:45px;overflow:hidden}.cc-phone-nav{position:absolute;left:10px;right:10px;bottom:10px;height:31px;background:rgba(3,5,6,.88);display:flex;align-items:center;justify-content:space-around;color:white;z-index:3}
.cc-card-preview{width:248px;margin:0 auto 14px;border:1px solid #ddd3c8;border-radius:12px;overflow:hidden;background:var(--cc-card)}.cc-card-thumb{height:132px;background-size:cover;background-position:center;background-color:#e8e0d8}.cc-card-body{padding:10px 12px}.cc-card-title{font-size:12px;font-weight:600;margin:0 0 4px;line-height:1.3}.cc-card-desc{font-size:9px;color:var(--cc-text-3);line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.cc-card-meta{display:flex;align-items:center;gap:6px;font-size:8.5px;color:#7a8588;margin-top:8px}
.cc-text-preview{width:248px;margin:0 auto 14px;border:1px solid #ddd3c8;border-radius:12px;padding:14px;background:var(--cc-card)}.cc-text-preview-content{font-size:11px;line-height:1.45;color:var(--cc-text)}
.cc-preview-customize{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;font-size:8.5px;color:#7a8588}.cc-preview-customize button{height:28px;border:1px solid #e4dbd3;border-radius:8px;background:var(--cc-card);display:flex;align-items:center;gap:6px;padding:0 10px;font-size:9px;color:var(--cc-text);cursor:pointer}.cc-preview-customize button.active{background:#263338;color:#fff;border-color:#263338}.cc-layer-quickbar{border:1px solid var(--cc-border);background:var(--cc-card);border-radius:8px;padding:8px;margin:0 0 10px}.cc-layer-toolbar{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 8px}.cc-layer-toolbar button,.cc-layer-actions button{height:28px;border:1px solid #e4dbd3;border-radius:7px;background:var(--cc-card);display:grid;place-items:center;color:#526368;cursor:pointer}.cc-layer-toolbar button:hover,.cc-layer-actions button:hover{background:#f7efe8}.cc-preview-editor{border:1px solid var(--cc-border);background:var(--cc-card);border-radius:8px;padding:8px;margin:0;max-height:calc(82vh - 72px);overflow:auto}.cc-preview-editor select,.cc-preview-editor input,.cc-preview-editor textarea{width:100%;border:1px solid #e4dbd3;border-radius:6px;background:var(--cc-card);padding:6px;font-size:9px;outline:0}.cc-preview-editor textarea{height:48px;resize:none;line-height:1.3}.cc-layer-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.cc-layer-actions.order{grid-template-columns:repeat(4,1fr);margin-top:6px}.cc-preview-editor-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.cc-preview-editor-row label{font-size:8px;color:#7a8588;display:flex;flex-direction:column;gap:4px}.cc-media-layer-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:7px}.cc-media-layer-choice{aspect-ratio:1;border:1px solid #e2d8ce;border-radius:5px;background-size:cover;background-position:center}.cc-media-layer-choice.reference{background-size:1280px 720px}.cc-media-layer-choice.active{box-shadow:inset 0 0 0 2px #d86e4a}.cc-layer-upload{display:flex;align-items:center;justify-content:center;gap:5px;height:28px;border:1px dashed #d6c8bd;border-radius:7px;background:var(--cc-card);font-size:8.5px;color:var(--cc-text-3);cursor:pointer;margin-top:7px}.cc-preview-canvas{position:relative;overflow:hidden;margin:0 auto 14px;background:#f8f0e8}.cc-preview-canvas.phone{width:248px;height:478px;background:#080b0d;border:5px solid #151719;border-radius:39px;padding:10px;box-shadow:0 0 0 2px #aeb1b1,0 8px 18px rgba(33,27,23,.16)}.cc-preview-canvas.card{width:248px;height:315px;border:1px solid #ddd3c8;border-radius:12px;background:var(--cc-card)}.cc-preview-canvas.text{width:248px;height:270px;border:1px solid #ddd3c8;border-radius:12px;background:var(--cc-card)}.cc-canvas-art{position:absolute;inset:10px;border-radius:28px;background-size:cover;background-position:center;overflow:hidden}.cc-preview-canvas.card .cc-canvas-art,.cc-preview-canvas.text .cc-canvas-art{inset:0;border-radius:12px}.cc-canvas-art.reference{background-size:1280px 720px}.cc-canvas-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.22),transparent 38%,rgba(0,0,0,.78))}.cc-preview-canvas.card .cc-canvas-shade{background:linear-gradient(180deg,transparent 0 42%,rgba(255,255,255,.95) 68%)}.cc-preview-canvas.text .cc-canvas-shade{background:var(--cc-card)}.cc-layer{position:absolute;box-sizing:border-box;line-height:1.25;white-space:pre-line;overflow:hidden;touch-action:none}.cc-layer.editing{cursor:move}.cc-layer.selected{outline:1px solid #f3b25e;outline-offset:1px;overflow:visible}.cc-layer-handle{position:absolute;right:3px;bottom:3px;width:14px;height:14px;border-radius:50%;background:#f3b25e;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.24);cursor:nwse-resize;z-index:30}.cc-layer.media{background-size:cover;background-position:center}.cc-layer.media.reference{background-size:1280px 720px}.cc-device-row{order:4;display:flex;gap:10px}.cc-device-select{height:31px;border:1px solid #e5ded7;border-radius:7px;flex:1;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:9px}.cc-expand{width:39px;border:1px solid #e5ded7;border-radius:7px;display:grid;place-items:center}.cc-preview-panel>.cc-preview-editor{display:none}.cc-preview-edit-overlay{position:fixed;inset:0;background:rgba(30,34,35,.42);z-index:1200;display:flex;align-items:center;justify-content:center;padding:22px}.cc-preview-edit-modal{width:min(980px,calc(100vw - 44px));max-height:calc(100vh - 44px);border:1px solid var(--cc-border);border-radius:14px;background:var(--cc-card);box-shadow:0 24px 80px rgba(35,28,24,.25);display:flex;flex-direction:column;overflow:hidden}.cc-preview-edit-head{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--cc-border)}.cc-preview-edit-head h2{font:400 20px 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}.cc-preview-edit-head span{font-size:9px;color:#7a8588}.cc-preview-edit-head button{height:30px;border:1px solid #e4dbd3;border-radius:8px;background:var(--cc-card);display:flex;align-items:center;gap:6px;padding:0 12px;font-size:9px;color:#3d2f2f;cursor:pointer}.cc-preview-edit-body{display:grid;grid-template-columns:1fr 318px;gap:16px;padding:16px;overflow:auto}.cc-preview-edit-stage{min-height:540px;display:grid;place-items:center;background:var(--cc-bg-3);border:1px solid var(--cc-border);border-radius:10px;padding:18px}.cc-preview-edit-stage .cc-preview-canvas{margin:0}.cc-preview-edit-tools{min-width:0}
.cc-media-overlay{position:fixed;inset:0;background:rgba(29,34,35,.28);z-index:1000;display:grid;place-items:center;padding:20px}.cc-media-modal{width:min(520px,100%);max-height:85vh;overflow:auto;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:14px;padding:21px;box-shadow:0 18px 60px rgba(40,34,30,.2)}.cc-media-modal h2{font:400 23px 'DM Serif Display',Georgia,serif;margin:0 0 13px}.cc-media-modal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-height:360px;overflow:auto}.cc-media-choice{aspect-ratio:1;border-radius:6px;background-size:cover;background-position:center;position:relative}.cc-media-choice.reference{background-size:1280px 720px}.cc-media-choice.selected{box-shadow:inset 0 0 0 3px #d46d4a}.cc-media-check{position:absolute;left:6px;top:6px;width:14px;height:14px;border-radius:3px;background:rgba(255,255,255,.88);display:grid;place-items:center;font-size:9px}.cc-media-modal-count{font-size:9px;color:#778184;margin:-8px 0 12px}.cc-media-modal-actions{display:flex;justify-content:flex-end;margin-top:14px}.cc-media-modal-actions button{padding:8px 14px;border:1px solid #ddd3cb;border-radius:8px;background:white;font-size:10px}
.cc-cta-select{position:relative}.cc-cta-trigger{width:100%;height:34px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e6dfd8;border-radius:7px;background:var(--cc-card);color:var(--cc-text);padding:0 9px;font:inherit;font-size:9px;text-align:left}.cc-cta-trigger svg{color:#69787b}.cc-cta-menu{position:absolute;left:0;right:0;top:38px;z-index:10;padding:4px;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:7px;box-shadow:0 8px 18px rgba(45,37,32,.14)}.cc-cta-option{width:100%;padding:7px 8px;border-radius:4px;color:#263338;font:inherit;font-size:9px;text-align:left}.cc-cta-option:hover,.cc-cta-option.selected{background:#fbe1d5;color:#a94e3b}
@media(max-width:1120px){.cc-composer{min-width:1020px}.cc-preview-panel{width:335px;flex-basis:335px}.cc-platform-toggle{font-size:8px}.cc-composer-actions{gap:6px}}
@media(max-width:1120px){.cc-composer{width:100%;min-width:0;box-sizing:border-box}.cc-composer-body{min-width:0}}
@media(max-width:900px){.cc-composer-body{flex-direction:column}.cc-composer-form{width:100%}.cc-preview-panel{width:100%;flex-basis:auto;position:static;max-height:none;box-sizing:border-box}.cc-composer-head{flex-wrap:wrap}.cc-composer-actions{width:100%;margin-left:0;flex-wrap:wrap}}
@media(max-width:620px){.cc-composer{padding:12px}.cc-form-columns{grid-template-columns:1fr}.cc-form-col:first-child{border-right:0;border-bottom:1px solid #ece5de}.cc-composer-action{flex:1;justify-content:center;padding:0 10px}}
`

// ─── Platform Icon ─────────────────────────────────────────────────────────────
function PlatformIcon({ platform, size = 13 }: { platform: string; size?: number }) {
  if (platform === "instagram")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#e24b3d" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="#e24b3d" />
      </svg>
    )
  if (platform === "tiktok") return <b style={{ fontSize: size }}>♪</b>
  if (platform === "pinterest") return <b style={{ fontFamily: "Georgia", fontSize: size, color: "#c92f3e" }}>P</b>
  if (platform === "youtube") return <b style={{ color: "#cf352f", fontSize: size }}>▶</b>
  if (platform === "facebook") return <b style={{ color: "#1877f2", fontSize: size }}>f</b>
  const cfg = getAllPlatforms()[platform]
  const icon = cfg?.icon ?? platform
  if (icon.startsWith("data:image/") || icon.startsWith("https://") || icon.startsWith("http://"))
    return <img src={icon} alt="" width={size} height={size} style={{ objectFit: "contain", borderRadius: 3 }} />
  return <span style={{ fontSize: (size ?? 13) - 2, color: cfg?.color ?? "#7c8587" }}>{icon.length <= 2 ? icon : icon[0].toUpperCase()}</span>
}

// ─── Media helpers ─────────────────────────────────────────────────────────────
function mediaStyle(item: StoredMediaItem | undefined, urls: Record<string, string>) {
  if (!item) return {}
  const url = mediaUrl(item, urls)
  return url ? { backgroundImage: `url(${url})` } : { background: "#e8e0d8" }
}

function createPlatformSlot(platform: string, seed?: Partial<PlatformSlot>): PlatformSlot {
  const firstType = getPlatformConfig(platform).postTypes[0]?.id ?? "Post"
  return {
    postType: firstType,
    caption: "",
    hashtags: [],
    altText: "",
    hook: "",
    cta: "Shop the look",
    mediaIds: [],
    firstComment: "",
    extras: {},
    ...seed,
  }
}

function contentSlotKey(platform: string, postType: string) {
  return `${platform}::${postType}`
}

function selectedPostTypeForPlatform(draft: ComposerDraft, platform: string) {
  return draft.platformSlots?.[platform]?.postType
    ?? (platform === draft.platforms[0] ? draft.postType : getPlatformConfig(platform).postTypes[0]?.id)
    ?? draft.postType
}

function rootSlotFromDraft(draft: ComposerDraft, postType = draft.postType): PlatformSlot {
  return createPlatformSlot(draft.platforms[0] ?? "instagram", {
    postType,
    caption: draft.caption,
    hashtags: draft.hashtags,
    altText: draft.altText,
    hook: draft.hook,
    cta: draft.cta,
    mediaIds: draft.mediaIds,
    firstComment: draft.firstComment,
    extras: draft.platformExtras ?? {},
    previewDesign: draft.previewDesign,
    previewDesigns: draft.previewDesigns,
  })
}

function readContentSlot(draft: ComposerDraft, platform: string, postType = selectedPostTypeForPlatform(draft, platform)): PlatformSlot {
  return draft.contentSlots?.[contentSlotKey(platform, postType)]
    ?? (draft.platformSlots?.[platform]?.postType === postType ? draft.platformSlots[platform] : undefined)
    ?? (platform === draft.platforms[0] && draft.postType === postType ? rootSlotFromDraft(draft, postType) : undefined)
    ?? createPlatformSlot(platform, { postType })
}

function syncRootFromSlot(draft: ComposerDraft, platform: string, slot: PlatformSlot): ComposerDraft {
  const contentSlots = { ...(draft.contentSlots ?? {}), [contentSlotKey(platform, slot.postType)]: slot }
  return {
    ...draft,
    postType: slot.postType,
    caption: slot.caption,
    hashtags: slot.hashtags,
    altText: slot.altText,
    hook: slot.hook,
    cta: slot.cta,
    mediaIds: slot.mediaIds,
    firstComment: slot.firstComment,
    platformExtras: slot.extras,
    previewDesign: slot.previewDesign,
    previewDesigns: slot.previewDesigns,
    contentSlots,
  }
}

// ─── CTA Select ───────────────────────────────────────────────────────────────
function CtaSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const options = ["Shop the look", "Learn more", "Save for later", "Share your thoughts", "None"]
  return (
    <div className="cc-cta-select">
      <button type="button" className="cc-cta-trigger" onClick={() => setOpen(c => !c)}>
        <span>{value || "Select CTA…"}</span><ChevronDown size={11} />
      </button>
      {open && (
        <div className="cc-cta-menu" role="listbox">
          {options.map(opt => (
            <button key={opt} type="button" role="option" aria-selected={value === opt}
              className={`cc-cta-option${value === opt ? " selected" : ""}`}
              onClick={() => { onChange(opt); setOpen(false) }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Platform Strip ────────────────────────────────────────────────────────────
export function PlatformStrip({ draft, onPlatformsChange, previewPlatform, onPreviewChange }: {
  draft: ComposerDraft
  onPlatformsChange: (platforms: string[]) => void
  previewPlatform: string
  onPreviewChange: (p: string) => void
}) {
  const activePlatformIds = getActivePlatformOptions().map(item => item.id)
  const allPlatforms = Array.from(new Set([...activePlatformIds, ...draft.platforms]))
  return (
    <div className="cc-platform-strip">
      {allPlatforms.map(platform => {
        const isSelected = draft.platforms.includes(platform)
        const isActive = isSelected && previewPlatform === platform
        return (
          <button key={platform}
            className={`cc-strip-btn${isSelected ? " selected" : ""}${isActive ? " active" : ""}`}
            onClick={() => {
              if (!isSelected) {
                // Add to post and switch preview to it
                onPlatformsChange([...draft.platforms, platform])
                onPreviewChange(platform)
              } else if (!isActive) {
                // Already in post — just switch preview
                onPreviewChange(platform)
              } else {
                // Active platform — deselect (keep at least 1)
                const next = draft.platforms.filter(p => p !== platform)
                if (next.length) { onPlatformsChange(next); onPreviewChange(next[0]) }
              }
            }}>
            <PlatformIcon platform={platform} />
            {getPlatformConfig(platform).label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Form Fields ──────────────────────────────────────────────────────────────
function ComposerFields({
  fields, draft, extra, updateDraft, updateExtra,
  media, urls, hashtag, setHashtag, addHashtag, openFilePicker,
}: {
  fields: PlatformFieldSet
  draft: ComposerDraft
  extra: Record<string, unknown>
  updateDraft: <K extends keyof ComposerDraft>(k: K, v: ComposerDraft[K]) => void
  updateExtra: (k: string, v: unknown) => void
  media: StoredMediaItem[]
  urls: Record<string, string>
  hashtag: string
  setHashtag: (v: string) => void
  addHashtag: (e: KeyboardEvent<HTMLInputElement>) => void
  openFilePicker: () => void
}) {
  const attached = draft.mediaIds.map(id => media.find(i => i.id === id)).filter(Boolean) as StoredMediaItem[]
  const slides = (extra.slides as { mediaId: string; caption: string }[] | undefined) ?? []
  const sticker = (extra.sticker as string | undefined) ?? "None"
  const hashtagInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="cc-form-columns">
      {/* Left column */}
      <div className="cc-form-col">

        {fields.caption && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MessageCircle size={13} />{fields.captionLabel}</div>
            <div className="cc-input-wrap">
              <textarea className="cc-textarea" maxLength={fields.captionMaxLength}
                value={draft.caption} onChange={e => updateDraft("caption", e.target.value)} />
              <span className="cc-counter">{draft.caption.length}/{fields.captionMaxLength}</span>
            </div>
          </div>
        )}

        {fields.headline && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Sparkles size={13} />{fields.headlineLabel}</div>
            <div className="cc-input-wrap">
              <input className="cc-text-input" maxLength={fields.headlineMaxLength}
                value={(extra.headline as string) ?? ""}
                onChange={e => updateExtra("headline", e.target.value)} />
              <span className="cc-counter">{((extra.headline as string) ?? "").length}/{fields.headlineMaxLength}</span>
            </div>
          </div>
        )}

        {fields.description && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MessageCircle size={13} />Description</div>
            <div className="cc-input-wrap">
              <textarea className="cc-textarea" style={{ height: 110 }}
                maxLength={fields.descriptionMaxLength}
                value={(extra.description as string) ?? ""}
                onChange={e => updateExtra("description", e.target.value)} />
              <span className="cc-counter">{((extra.description as string) ?? "").length}/{fields.descriptionMaxLength}</span>
            </div>
          </div>
        )}

        {fields.board && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Hash size={13} />Board</div>
            <input className="cc-text-input" placeholder="Select or type board name…"
              value={(extra.board as string) ?? ""}
              onChange={e => updateExtra("board", e.target.value)} />
          </div>
        )}

        {fields.destinationUrl && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Link size={13} />Destination URL</div>
            <input className="cc-text-input" placeholder="https://…"
              value={(extra.destinationUrl as string) ?? ""}
              onChange={e => updateExtra("destinationUrl", e.target.value)} />
          </div>
        )}

        {fields.hashtags && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Hash size={15} />Hashtags</div>
            <div className="cc-hashtags" onClick={() => hashtagInputRef.current?.focus()}>
              <div className="cc-hashtag-list">
                {draft.hashtags.map(tag => (
                  <span key={tag} className="cc-hashtag">#{tag}
                    <button onClick={() => updateDraft("hashtags", draft.hashtags.filter(h => h !== tag))}>×</button>
                  </span>
                ))}
                <input ref={hashtagInputRef} className="cc-hashtag-entry" value={hashtag}
                  onChange={e => setHashtag(e.target.value)}
                  onKeyDown={addHashtag} placeholder="Add hashtag…" />
              </div>
              <span className="cc-hash-count">{draft.hashtags.length}/{fields.hashtagsMax}</span>
            </div>
          </div>
        )}

        {fields.altText && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Sparkles size={13} />Alt text</div>
            <div className="cc-input-wrap">
              <input className="cc-text-input" maxLength={125} value={draft.altText}
                onChange={e => updateDraft("altText", e.target.value)} />
              <span className="cc-counter">{draft.altText.length}/125</span>
            </div>
          </div>
        )}

        {fields.sticker && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Sparkles size={13} />Interactive sticker</div>
            <div className="cc-sticker-row">
              {["Poll", "Question", "Quiz", "Countdown", "None"].map(opt => (
                <button key={opt} className={`cc-sticker-opt${sticker === opt ? " active" : ""}`}
                  onClick={() => updateExtra("sticker", opt)}>
                  {opt}
                </button>
              ))}
            </div>
            {sticker !== "None" && (
              <div className="cc-input-wrap" style={{ marginTop: 6 }}>
                <input className="cc-text-input" maxLength={60}
                  placeholder={`${sticker} question…`}
                  value={(extra.stickerQuestion as string) ?? ""}
                  onChange={e => updateExtra("stickerQuestion", e.target.value)} />
                <span className="cc-counter">{((extra.stickerQuestion as string) ?? "").length}/60</span>
              </div>
            )}
          </div>
        )}

        {fields.frames && !fields.slides && (
          <div className="cc-field-block">
            <div className="cc-field-title"><ImageIcon size={13} />Story frames</div>
            <div className="cc-frames-list">
              {draft.mediaIds.slice(0, 10).map((id, i) => {
                const item = media.find(m => m.id === id)
                return (
                  <div key={id} className="cc-frame-thumb" style={item ? mediaStyle(item, urls) : {}}>
                    <span className="cc-frame-num">{i + 1}</span>
                  </div>
                )
              })}
              {draft.mediaIds.length < 10 && (
                <button className="cc-add-media" style={{ width: 52, height: 46 }} onClick={openFilePicker}>
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="cc-media-note">Add more frames (up to 10)</div>
          </div>
        )}

        {fields.slides && (
          <div className="cc-field-block">
            <div className="cc-field-title"><ImageIcon size={13} />Carousel media</div>
            <div className="cc-slide-list">
              {slides.map((slide, i) => {
                const item = media.find(m => m.id === slide.mediaId)
                return (
                  <div key={i} className="cc-slide-item">
                    <span style={{ fontSize: 8, color: "#7c8587", minWidth: 14 }}>{i + 1}</span>
                    <div className="cc-slide-thumb" style={item ? mediaStyle(item, urls) : {}} />
                    <input className="cc-slide-cap" placeholder="Slide caption…"
                      value={slide.caption}
                      onChange={e => {
                        const next = slides.map((s, idx) => idx === i ? { ...s, caption: e.target.value } : s)
                        updateExtra("slides", next)
                      }} />
                    <button className="cc-slide-remove"
                      onClick={() => updateExtra("slides", slides.filter((_, idx) => idx !== i))}>×</button>
                  </div>
                )
              })}
              <button className="cc-slide-add" onClick={() => {
                const nextId = draft.mediaIds[slides.length] ?? ""
                updateExtra("slides", [...slides, { mediaId: nextId, caption: "" }])
              }}>+ Add slide</button>
            </div>
            {fields.coverSlide && slides.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 8.5, color: "#5a6568" }}>Cover slide:</span>
                <div className="cc-input-wrap" style={{ flex: 1 }}>
                  <select className="cc-select" style={{ height: 28 }}
                    value={(extra.coverSlide as number) ?? 0}
                    onChange={e => updateExtra("coverSlide", Number(e.target.value))}>
                    {slides.map((_, i) => <option key={i} value={i}>{i + 1}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="cc-form-col">
        <div className="cc-field-block">
          <div className="cc-field-title"><CalendarDays size={13} />Publish date &amp; time</div>
          <div className="cc-publish-row">
            <input className="cc-text-input" type="date" value={draft.publishDate}
              onChange={e => updateDraft("publishDate", e.target.value)} />
            <input className="cc-text-input" type="time" value={draft.publishTime}
              onChange={e => updateDraft("publishTime", e.target.value)} />
          </div>
          <div className="cc-publish-help">Your post will publish on the selected local date</div>
        </div>

        {fields.hook && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Sparkles size={13} />Hook</div>
            <div className="cc-input-wrap">
              <input className="cc-text-input" maxLength={80} value={draft.hook}
                onChange={e => updateDraft("hook", e.target.value)} />
              <span className="cc-counter">{draft.hook.length}/80</span>
            </div>
          </div>
        )}

        {fields.cta && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MousePointer2 size={13} />CTA</div>
            <CtaSelect value={draft.cta} onChange={v => updateDraft("cta", v)} />
          </div>
        )}

        {fields.expiry && (
          <div className="cc-field-block">
            <div className="cc-field-title"><CalendarDays size={13} />Expiry or posting window</div>
            <div className="cc-input-wrap">
              <select className="cc-select"
                value={(extra.expiry as string) ?? "24 hours"}
                onChange={e => updateExtra("expiry", e.target.value)}>
                <option>24 hours</option>
                <option>48 hours</option>
                <option>Custom</option>
              </select>
              <ChevronDown className="cc-select-arrow" size={11} />
            </div>
            <div className="cc-publish-help">Story will expire after the selected window.</div>
          </div>
        )}

        {fields.playlist && (
          <div className="cc-field-block">
            <div className="cc-field-title"><ImageIcon size={13} />Playlist</div>
            <input className="cc-text-input" placeholder="Select playlist…"
              value={(extra.playlist as string) ?? ""}
              onChange={e => updateExtra("playlist", e.target.value)} />
          </div>
        )}

        {fields.visibility && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Eye size={13} />Visibility</div>
            <div className="cc-input-wrap">
              <select className="cc-select"
                value={(extra.visibility as string) ?? "Public"}
                onChange={e => updateExtra("visibility", e.target.value)}>
                <option>Public</option>
                <option>Unlisted</option>
                <option>Private</option>
              </select>
              <ChevronDown className="cc-select-arrow" size={11} />
            </div>
          </div>
        )}

        {fields.audience && (
          <div className="cc-field-block">
            <div className="cc-field-title"><Sparkles size={13} />Audience</div>
            <div className="cc-input-wrap">
              <select className="cc-select"
                value={(extra.audience as string) ?? "Not made for kids (13+)"}
                onChange={e => updateExtra("audience", e.target.value)}>
                <option>Not made for kids (13+)</option>
                <option>Made for kids</option>
              </select>
              <ChevronDown className="cc-select-arrow" size={11} />
            </div>
          </div>
        )}

        {fields.endScreens && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MousePointer2 size={13} />End screens or cards</div>
            <input className="cc-text-input" placeholder="Add note about end screens…"
              value={(extra.endScreens as string) ?? ""}
              onChange={e => updateExtra("endScreens", e.target.value)} />
          </div>
        )}

        {fields.chapters && (
          <div className="cc-field-block">
            <div className="cc-field-title"><CalendarDays size={13} />Chapters / Timestamps</div>
            <div className="cc-input-wrap">
              <textarea className="cc-textarea" style={{ height: 64 }}
                placeholder={"0:00 Intro\n1:20 Main topic\n5:45 Outro"}
                value={(extra.chapters as string) ?? ""}
                onChange={e => updateExtra("chapters", e.target.value)} />
            </div>
          </div>
        )}

        {fields.subtitles && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MessageCircle size={13} />Subtitles / Captions</div>
            <label className="cc-check">
              <input type="checkbox"
                checked={(extra.subtitles as boolean) ?? false}
                onChange={e => updateExtra("subtitles", e.target.checked)} />
              Upload or generate captions
            </label>
          </div>
        )}

        {fields.thumbnail && (
          <div className="cc-field-block">
            <div className="cc-field-title"><ImageIcon size={13} />Thumbnail</div>
            <div className="cc-media-box" style={{ textAlign: "center" }}>
              <div className="cc-media-note" style={{ padding: "12px 0" }}>Upload thumbnail (JPG, PNG · 16:9 recommended)</div>
            </div>
          </div>
        )}

        {fields.media && !fields.frames && !fields.slides && (
          <div className="cc-field-block">
            <div className="cc-field-title"><ImageIcon size={13} />
              {fields.thumbnail ? "Media (video)" : "Media attachment"}
            </div>
            <div className="cc-media-box">
              <div className="cc-media-items">
                {attached.slice(0, 3).map(item => (
                  <div key={item.id}
                    className={`cc-media-attachment${item.source.kind === "reference" ? " reference" : ""}`}
                    style={mediaStyle(item, urls)}>
                    <button className="cc-remove-media"
                      onClick={() => updateDraft("mediaIds", draft.mediaIds.filter(id => id !== item.id))}>
                      <X size={7} />
                    </button>
                  </div>
                ))}
                {draft.mediaIds.length < (fields.mediaMax ?? 10) && (
                  <button className="cc-add-media" onClick={openFilePicker}><Plus size={21} /></button>
                )}
              </div>
              <div className="cc-media-note">Add media (up to {fields.mediaMax ?? 10})</div>
            </div>
          </div>
        )}

        {fields.firstComment && (
          <div className="cc-field-block">
            <div className="cc-field-title"><MessageCircle size={13} />First comment</div>
            <div className="cc-input-wrap">
              <input className="cc-text-input" maxLength={280} value={draft.firstComment}
                onChange={e => updateDraft("firstComment", e.target.value)} />
              <span className="cc-counter">{draft.firstComment.length}/280</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Checklist items per post type ────────────────────────────────────────────
function getChecklistItems(postTypeId: string): { key: keyof ComposerChecklist; label: string }[] {
  if (postTypeId === "Long-form Video" || postTypeId === "Short") {
    return [
      { key: "captionOnBrand", label: "Title is on brand" },
      { key: "hashtagsRelevant", label: "Hashtags are relevant" },
      { key: "mediaHighQuality", label: "Media is high quality" },
      { key: "altTextAdded", label: "Thumbnail uploaded" },
      { key: "firstCommentIncluded", label: "Visibility set" },
      { key: "ctaClear", label: "CTA is clear" },
    ]
  }
  if (postTypeId === "Standard Pin" || postTypeId === "Video Pin" || postTypeId === "Idea Pin") {
    return [
      { key: "captionOnBrand", label: "Pin title is on brand" },
      { key: "hashtagsRelevant", label: "Board selected" },
      { key: "mediaHighQuality", label: "Media is high quality" },
      { key: "altTextAdded", label: "Alt text added" },
      { key: "firstCommentIncluded", label: "Destination URL added" },
      { key: "ctaClear", label: "CTA is clear" },
    ]
  }
  if (postTypeId === "Carousel") {
    return [
      { key: "captionOnBrand", label: "Caption is on brand" },
      { key: "hashtagsRelevant", label: "Slide order checked" },
      { key: "mediaHighQuality", label: "Cover slide selected" },
      { key: "altTextAdded", label: "Alt text added" },
      { key: "firstCommentIncluded", label: "First comment included" },
      { key: "ctaClear", label: "CTA is clear" },
    ]
  }
  if (postTypeId === "Story") {
    return [
      { key: "captionOnBrand", label: "Frames ordered" },
      { key: "hashtagsRelevant", label: "Link added" },
      { key: "mediaHighQuality", label: "Sticker planned" },
      { key: "altTextAdded", label: "Alt text added" },
      { key: "firstCommentIncluded", label: "Expiry set" },
      { key: "ctaClear", label: "Caption ready" },
    ]
  }
  return [
    { key: "captionOnBrand", label: "Caption is on brand" },
    { key: "hashtagsRelevant", label: "Hashtags are relevant" },
    { key: "mediaHighQuality", label: "Media is high quality" },
    { key: "altTextAdded", label: "Alt text added" },
    { key: "firstCommentIncluded", label: "First comment included" },
    { key: "ctaClear", label: "CTA is clear" },
  ]
}

function createLegacyPreviewDesign(layout: PreviewLayout): PreviewDesign {
  const reel = layout === "fullscreen"
  const layers: PreviewLayer[] = [
    { id: "status", type: "text", x: 8, y: 4, width: 30, height: 5, text: "9:41", color: "#fff", fontSize: 9 },
    { id: "account", type: "text", x: 8, y: reel ? 77 : 73, width: 66, height: 5, binding: "username", color: "#fff", fontSize: 8 },
    { id: "copy", type: "text", x: 8, y: reel ? 82 : 78, width: 78, height: 11, binding: reel ? "caption" : "headline", color: "#fff", fontSize: 8 },
    { id: "hashtags", type: "text", x: 8, y: 91, width: 80, height: 4, binding: "hashtags", color: "#fff", fontSize: 7 },
    { id: "actions", type: "text", x: 86, y: 57, width: 9, height: 22, text: "♡\n◯\n➤", color: "#fff", fontSize: 14 },
    { id: "nav", type: "shape", x: 0, y: 94, width: 100, height: 6, color: "rgba(3,5,6,.88)" },
    { id: "nav-label", type: "text", x: 8, y: 95, width: 84, height: 4, text: "◆     ⌕       +       ▣       ●", color: "#fff", fontSize: 9 },
  ]
  return { version: 1, template: reel ? "social-reel" : "social-feed", layers }
}

function previewLayerText(layer: PreviewLayer, values: Record<string, string>): string {
  if (layer.binding) return values[layer.binding] ?? ""
  return layer.text ?? ""
}

function LegacyPreviewLayers({ design, values, editing, selectedId, onSelect }: {
  design: PreviewDesign; values: Record<string, string>; editing: boolean
  selectedId: string; onSelect: (id: string) => void
}) {
  return <>
    {design.layers.map(layer => {
      const style: React.CSSProperties = {
        position: "absolute", left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, height: `${layer.height}%`,
        opacity: layer.opacity ?? 1, color: layer.color ?? "#fff", fontSize: layer.fontSize ?? 8,
        lineHeight: 1.25, whiteSpace: "pre-line", zIndex: layer.id === "nav" ? 3 : 4,
        overflow: "hidden", border: editing && selectedId === layer.id ? "1px solid #f3b25e" : "1px solid transparent",
        cursor: editing ? "pointer" : "default", boxSizing: "border-box",
      }
      if (layer.type === "shape") style.background = layer.color ?? "rgba(0,0,0,.5)"
      return <div key={layer.id} style={style} onClick={() => editing && onSelect(layer.id)}>{layer.type === "shape" ? null : previewLayerText(layer, values)}</div>
    })}
  </>
}

function previewDesignKey(platform: string, postType: string) {
  return `${platform}::${postType}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function layerId(prefix: PreviewLayer["type"]) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function createDefaultPreviewDesign(layout: PreviewLayout, platform = "instagram", postType = "Post", mediaId?: string): PreviewDesign {
  const fullscreen = layout === "fullscreen"
  const textOnly = layout === "text-only"
  const card = layout === "card"
  const template = fullscreen ? "social-reel" : card ? "social-card" : textOnly ? "social-text" : "social-feed"
  const platformLabel = getPlatformConfig(platform).label
  const layers: PreviewLayer[] = []

  if (fullscreen) {
    layers.push(
      { id: "screen-title", type: "text", x: 40, y: 7, width: 24, height: 5, text: postType === "Story" ? "Story" : platform === "youtube" ? "Shorts" : platform === "tiktok" ? "Following" : "Reels", color: "#fff", fontSize: 11, zIndex: 12 },
      { id: "account", type: "text", x: 10, y: 73, width: 52, height: 5, binding: "username", color: "#fff", fontSize: 9, zIndex: 12 },
      { id: "follow", type: "shape", x: 33, y: 73.1, width: 13, height: 3.8, color: "rgba(255,255,255,.18)", borderRadius: 4, zIndex: 11 },
      { id: "follow-text", type: "text", x: 35.5, y: 73.4, width: 8, height: 3, text: "Follow", color: "#fff", fontSize: 6, zIndex: 12 },
      { id: "copy", type: "text", x: 10, y: 79, width: 68, height: 10, binding: "caption", color: "#fff", fontSize: 8, zIndex: 12 },
      { id: "hashtags", type: "text", x: 10, y: 89, width: 70, height: 4, binding: "hashtags", color: "#fff", fontSize: 7, zIndex: 12 },
      { id: "like", type: "icon", x: 87, y: 53, width: 8, height: 6, icon: "heart", color: "#fff", fontSize: 18, zIndex: 12 },
      { id: "comment", type: "icon", x: 87, y: 61, width: 8, height: 6, icon: "comment", color: "#fff", fontSize: 18, zIndex: 12 },
      { id: "share", type: "icon", x: 87, y: 69, width: 8, height: 6, icon: "send", color: "#fff", fontSize: 17, zIndex: 12 },
      { id: "audio", type: "icon", x: 87, y: 82, width: 8, height: 6, icon: "music", color: "#fff", fontSize: 16, zIndex: 12 },
      { id: "nav", type: "shape", x: 0, y: 94, width: 100, height: 6, color: "rgba(3,5,6,.88)", zIndex: 10 },
      { id: "home", type: "icon", x: 12, y: 95.1, width: 7, height: 4, icon: "home", color: "#fff", fontSize: 13, zIndex: 12 },
      { id: "search", type: "icon", x: 32, y: 95.1, width: 7, height: 4, icon: "search", color: "#fff", fontSize: 13, zIndex: 12 },
      { id: "create", type: "text", x: 49, y: 94.8, width: 6, height: 4, text: "+", color: "#fff", fontSize: 15, zIndex: 12 },
      { id: "profile", type: "icon", x: 79, y: 95.1, width: 7, height: 4, icon: "user", color: "#fff", fontSize: 13, zIndex: 12 },
    )
  } else if (textOnly) {
    layers.push(
      { id: "platform", type: "text", x: 8, y: 9, width: 76, height: 5, text: platformLabel, color: "#657174", fontSize: 8, zIndex: 8 },
      { id: "headline", type: "text", x: 8, y: 22, width: 84, height: 18, binding: "headline", color: "#263338", fontSize: 15, zIndex: 8 },
      { id: "copy", type: "text", x: 8, y: 46, width: 84, height: 34, binding: "caption", color: "#526368", fontSize: 10, zIndex: 8 },
      { id: "action-row", type: "text", x: 8, y: 88, width: 84, height: 5, text: "Reply    Share    Save", color: "#7a8588", fontSize: 8, zIndex: 8 },
    )
  } else if (card) {
    layers.push(
      { id: "media-card", type: "media", x: 0, y: 0, width: 100, height: 48, mediaId, borderRadius: 0, zIndex: 5 },
      { id: "card-bg", type: "shape", x: 0, y: 48, width: 100, height: 52, color: "#fff", zIndex: 6 },
      { id: "headline", type: "text", x: 7, y: 55, width: 86, height: 13, binding: "headline", color: "#263338", fontSize: 13, zIndex: 8 },
      { id: "copy", type: "text", x: 7, y: 70, width: 86, height: 17, binding: "caption", color: "#5a6568", fontSize: 8, zIndex: 8 },
      { id: "meta", type: "text", x: 7, y: 90, width: 70, height: 5, text: `thecontentedit - ${platformLabel}`, color: "#7a8588", fontSize: 7, zIndex: 8 },
    )
  } else {
    layers.push(
      { id: "top-bar", type: "shape", x: 0, y: 0, width: 100, height: 13, color: "#fff", zIndex: 8 },
      { id: "account", type: "text", x: 9, y: 7, width: 55, height: 4, binding: "username", color: "#263338", fontSize: 8, zIndex: 10 },
      { id: "media-frame", type: "media", x: 0, y: 13, width: 100, height: 62, mediaId, borderRadius: 0, zIndex: 5 },
      { id: "actions", type: "text", x: 7, y: 77, width: 74, height: 4, text: "Like     Comment     Share", color: "#263338", fontSize: 7, zIndex: 10 },
      { id: "copy", type: "text", x: 7, y: 83, width: 84, height: 8, binding: "caption", color: "#263338", fontSize: 8, zIndex: 10 },
      { id: "hashtags", type: "text", x: 7, y: 92, width: 84, height: 4, binding: "hashtags", color: "#526368", fontSize: 7, zIndex: 10 },
    )
  }
  return { version: 1, template, layers }
}

function IconLayer({ name, size, color }: { name?: string; size: number; color: string }) {
  const props = { size, color, strokeWidth: 2.2 }
  if (name === "heart") return <Heart {...props} />
  if (name === "comment") return <MessageCircle {...props} />
  if (name === "send") return <Send {...props} />
  if (name === "bookmark") return <Bookmark {...props} />
  if (name === "music") return <Music2 {...props} />
  if (name === "home") return <Home {...props} />
  if (name === "search") return <Search {...props} />
  return <UserCircle {...props} />
}

function PreviewLayers({ design, values, editing, selectedId, media, urls, onSelect, onLayerChange }: {
  design: PreviewDesign; values: Record<string, string>; editing: boolean
  selectedId: string; media: StoredMediaItem[]; urls: Record<string, string>
  onSelect: (id: string) => void; onLayerChange: (id: string, patch: Partial<PreviewLayer>) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{
    mode: "move" | "resize"; id: string; startX: number; startY: number; rect: DOMRect; layer: PreviewLayer
  } | null>(null)

  useEffect(() => {
    if (!drag) return
    const activeDrag = drag
    function moved(event: PointerEvent) {
      const dx = ((event.clientX - activeDrag.startX) / activeDrag.rect.width) * 100
      const dy = ((event.clientY - activeDrag.startY) / activeDrag.rect.height) * 100
      if (activeDrag.mode === "move") {
        onLayerChange(activeDrag.id, {
          x: clamp(activeDrag.layer.x + dx, 0, 100 - activeDrag.layer.width),
          y: clamp(activeDrag.layer.y + dy, 0, 100 - activeDrag.layer.height),
        })
      } else {
        onLayerChange(activeDrag.id, {
          width: clamp(activeDrag.layer.width + dx, 4, 100 - activeDrag.layer.x),
          height: clamp(activeDrag.layer.height + dy, 3, 100 - activeDrag.layer.y),
        })
      }
    }
    function ended() { setDrag(null) }
    window.addEventListener("pointermove", moved)
    window.addEventListener("pointerup", ended)
    return () => {
      window.removeEventListener("pointermove", moved)
      window.removeEventListener("pointerup", ended)
    }
  }, [drag, onLayerChange])

  function begin(event: React.PointerEvent, layer: PreviewLayer, mode: "move" | "resize") {
    if (!editing) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    // The event already came from this layer; re-hit-testing lets a full-size media layer steal selection.
    const targetLayer = layer
    event.preventDefault()
    event.stopPropagation()
    onSelect(targetLayer.id)
    setDrag({ mode, id: targetLayer.id, startX: event.clientX, startY: event.clientY, rect, layer: targetLayer })
  }

  function layerAtPoint(event: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    return design.layers
      .filter(layer => layer.visible !== false)
      .filter(layer => x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height)
      .sort((a, b) => (b.zIndex ?? 4) - (a.zIndex ?? 4))[0] ?? null
  }

  function selectAtPoint(event: React.PointerEvent) {
    if (!editing) return
    const layer = layerAtPoint(event)
    if (layer) begin(event, layer, "move")
  }

  const phoneTemplate = design.template === "social-reel" || design.template === "social-feed"
  return (
    <div ref={canvasRef} onPointerDown={selectAtPoint} style={{ position: "absolute", inset: phoneTemplate ? 10 : 0, borderRadius: phoneTemplate ? 28 : 12, overflow: "hidden" }}>
      {design.layers.filter(layer => layer.visible !== false).sort((a, b) => (a.zIndex ?? 4) - (b.zIndex ?? 4)).map(layer => {
        const item = layer.mediaId ? media.find(i => i.id === layer.mediaId) : undefined
        const isMedia = layer.type === "media"
        const style: React.CSSProperties = {
          left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, height: `${layer.height}%`,
          opacity: isMedia ? undefined : (layer.opacity ?? 1), color: layer.color ?? "#fff", fontSize: layer.fontSize ?? 8,
          zIndex: layer.zIndex ?? 4, borderRadius: layer.borderRadius ?? 0,
          background: layer.type === "shape" ? layer.color ?? "rgba(0,0,0,.5)" : isMedia ? "#e8e0d8" : undefined,
          pointerEvents: editing ? "none" : "auto",
        }
        return (
          <div key={layer.id}
            className={`cc-layer ${layer.type}${editing ? " editing" : ""}${selectedId === layer.id ? " selected" : ""}${item?.source.kind === "reference" ? " reference" : ""}`}
            style={style}
            onPointerDown={event => begin(event, layer, "move")}>
            {isMedia && item && mediaUrl(item, urls) && <img src={mediaUrl(item, urls)} alt={item.description || item.filename} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: layer.opacity ?? 1, pointerEvents: "none" }} />}
            {isMedia && <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - (layer.opacity ?? 1), pointerEvents: "none" }} />}
            {layer.type === "text" && previewLayerText(layer, values)}
            {layer.type === "icon" && <IconLayer name={layer.icon} size={layer.fontSize ?? 16} color={layer.color ?? "#fff"} />}
            {editing && selectedId === layer.id && <span className="cc-layer-handle" style={{ pointerEvents: "auto" }} onPointerDown={event => begin(event, layer, "resize")} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────
function LegacyPreviewPanel({ draft, media, urls, previewRef, previewPlatform, onDesignChange }: {
  draft: ComposerDraft; media: StoredMediaItem[]; urls: Record<string, string>
  previewRef: React.RefObject<HTMLElement | null>; previewPlatform: string
  onDesignChange: (design: PreviewDesign) => void
}) {
  const activePreview = draft.platforms.includes(previewPlatform)
    ? previewPlatform : (draft.platforms[0] ?? "instagram")

  const selectedType = selectedPostTypeForPlatform(draft, activePreview)
  const activeSlot = readContentSlot(draft, activePreview, selectedType)
  const activePostType = activeSlot?.postType ?? draft.postType
  const activeMediaIds = activeSlot?.mediaIds ?? draft.mediaIds
  const activeExtras = activeSlot?.extras ?? draft.platformExtras ?? {}
  const activeCaption = activeSlot?.caption ?? draft.caption
  const activeHashtags = activeSlot?.hashtags ?? draft.hashtags
  const ptConfig = getPostTypeConfig(activePreview, activePostType)
  const layout: PreviewLayout = ptConfig.previewLayout ?? "feed"
  const design = activeSlot?.previewDesign ?? draft.previewDesign ?? createDefaultPreviewDesign(layout)
  const [editing, setEditing] = useState(false)
  const [selectedId, setSelectedId] = useState(design.layers.find(layer => layer.type !== "shape")?.id ?? "copy")

  const previewItem = activeMediaIds.map(id => media.find(i => i.id === id)).find(Boolean)

  const useReferencePreview = false

  const previewStyle = useReferencePreview
    ? { backgroundImage: `url(${placeholderMedia})`, backgroundPosition: "-958px -176px" }
    : previewItem ? mediaStyle(previewItem, urls) : {}

  const headline = (activeExtras.headline as string) ?? ""
  const displayText = headline || activeCaption
  const selectedLayer = design.layers.find(layer => layer.id === selectedId) ?? design.layers[0]
  const updateLayer = (patch: Partial<PreviewLayer>) => {
    if (!selectedLayer) return
    onDesignChange({ ...design, layers: design.layers.map(layer => layer.id === selectedLayer.id ? { ...layer, ...patch } : layer) })
  }

  return (
    <aside className="cc-preview-panel" ref={previewRef}>
      <div className="cc-preview-title">Preview <span style={{ color: "#e7ad42" }}>☆</span></div>
      <div style={{ fontSize: 8.5, color: "#7a8588", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <PlatformIcon platform={activePreview} size={11} />
        {getPlatformConfig(activePreview).label}
      </div>

      <div className="cc-preview-customize">
        <span>{editing ? "Select a layer to adjust its position" : "Preview template"}</span>
        <button type="button" onClick={() => setEditing(value => !value)}><SlidersHorizontal size={11} />{editing ? "Done" : "Customize"}</button>
      </div>
      {editing && selectedLayer && (
        <div className="cc-preview-editor">
          <select value={selectedLayer.id} onChange={event => setSelectedId(event.target.value)}>
            {design.layers.map(layer => <option key={layer.id} value={layer.id}>{layer.id}</option>)}
          </select>
          <div className="cc-preview-editor-row">
            <label>X <input type="range" min="0" max="100" value={selectedLayer.x} onChange={event => updateLayer({ x: Number(event.target.value) })} /></label>
            <label>Y <input type="range" min="0" max="100" value={selectedLayer.y} onChange={event => updateLayer({ y: Number(event.target.value) })} /></label>
          </div>
        </div>
      )}

      {(layout === "fullscreen" || layout === "feed") && (
        <div className="cc-phone">
          <div className="cc-phone-notch" />
          <div className={`cc-phone-media${useReferencePreview ? " reference" : ""}`} style={previewStyle}>
            <div className="cc-phone-shade" />
          </div>
          <LegacyPreviewLayers design={design} editing={editing} selectedId={selectedId}
            onSelect={setSelectedId} values={{ username: "thecontentedit", caption: displayText, headline: headline || displayText, hashtags: activeHashtags.map(h => `#${h}`).join(" "), platform: getPlatformConfig(activePreview).label }} />
        </div>
      )}

      {layout === "card" && (
        <div className="cc-card-preview">
          <div className="cc-card-thumb" style={previewStyle} />
          <div className="cc-card-body">
            <div className="cc-card-title">{headline || activeCaption.split("\n")[0] || "Your title here"}</div>
            <div className="cc-card-desc">{(activeExtras.description as string) || activeCaption}</div>
            <div className="cc-card-meta">
              <PlatformIcon platform={activePreview} />
              thecontentedit · {getPlatformConfig(activePreview).label}
            </div>
          </div>
        </div>
      )}

      {layout === "text-only" && (
        <div className="cc-text-preview">
          <div className="cc-text-preview-content">{activeCaption || "Your post text will appear here…"}</div>
        </div>
      )}

      <div className="cc-device-row">
        <div className="cc-device-select"><Smartphone size={13} />iPhone 14/15 Pro <ChevronDown size={11} style={{ marginLeft: "auto" }} /></div>
        <button className="cc-expand"><Expand size={14} /></button>
      </div>
    </aside>
  )
}

// ─── Main Composer ─────────────────────────────────────────────────────────────
void createLegacyPreviewDesign
void LegacyPreviewPanel

function PreviewPanel({ draft, media, urls, previewRef, previewPlatform, onDesignChange, userName }: {
  draft: ComposerDraft; media: StoredMediaItem[]; urls: Record<string, string>
  previewRef: React.RefObject<HTMLElement | null>; previewPlatform: string
  onDesignChange: (platform: string, postType: string, design: PreviewDesign) => void
  userName: string
}) {
  const activePreview = draft.platforms.includes(previewPlatform)
    ? previewPlatform : (draft.platforms[0] ?? "instagram")
  const selectedType = selectedPostTypeForPlatform(draft, activePreview)
  const activeSlot = readContentSlot(draft, activePreview, selectedType)
  const activePostType = activeSlot?.postType ?? draft.postType
  const activeMediaIds = activeSlot?.mediaIds ?? draft.mediaIds
  const activeExtras = activeSlot?.extras ?? draft.platformExtras ?? {}
  const activeCaption = activeSlot?.caption ?? draft.caption
  const activeHashtags = activeSlot?.hashtags ?? draft.hashtags
  const ptConfig = getPostTypeConfig(activePreview, activePostType)
  const layout: PreviewLayout = ptConfig.previewLayout ?? "feed"
  const previewItem = activeMediaIds.map(id => media.find(i => i.id === id)).find(Boolean)
  const key = previewDesignKey(activePreview, activePostType)
  const design = activeSlot?.previewDesigns?.[key]
    ?? draft.previewDesigns?.[key]
    ?? activeSlot?.previewDesign
    ?? draft.previewDesign
    ?? createDefaultPreviewDesign(layout, activePreview, activePostType, previewItem?.id)
  const [editing, setEditing] = useState(false)
  const [selectedId, setSelectedId] = useState(design.layers.find(layer => layer.type !== "shape")?.id ?? design.layers[0]?.id ?? "")
  const headline = (activeExtras.headline as string) ?? ""
  const displayText = headline || activeCaption
  const effectiveSelectedId = design.layers.some(layer => layer.id === selectedId)
    ? selectedId
    : (design.layers.find(layer => layer.visible !== false)?.id ?? design.layers[0]?.id ?? "")
  const selectedLayer = design.layers.find(layer => layer.id === effectiveSelectedId) ?? design.layers[0]
  const useReferencePreview = false
  const previewStyle = useReferencePreview
    ? { backgroundImage: `url(${placeholderMedia})`, backgroundPosition: "-958px -176px" }
    : previewItem ? mediaStyle(previewItem, urls) : {}
  const canvasClass = layout === "card" ? "card" : layout === "text-only" ? "text" : "phone"
  const values = {
    username: userName || "thecontentedit",
    caption: displayText || "Write your caption here",
    headline: headline || displayText || "Your title here",
    hashtags: activeHashtags.map(h => `#${h}`).join(" "),
    platform: getPlatformConfig(activePreview).label,
  }

  const saveDesign = (next: PreviewDesign) => onDesignChange(activePreview, activePostType, next)
  const updateLayerById = (id: string, patch: Partial<PreviewLayer>) => {
    saveDesign({ ...design, layers: design.layers.map(layer => layer.id === id ? { ...layer, ...patch } : layer) })
  }
  const updateLayer = (patch: Partial<PreviewLayer>) => {
    if (selectedLayer) updateLayerById(selectedLayer.id, patch)
  }
  function addLayer(type: PreviewLayer["type"], mediaId?: string) {
    const maxZ = Math.max(0, ...design.layers.map(layer => layer.zIndex ?? 4))
    const base: PreviewLayer = {
      id: layerId(type), type, x: 18, y: 24, width: type === "text" ? 44 : 18, height: type === "text" ? 10 : 12,
      color: type === "shape" ? "rgba(255,255,255,.22)" : "#fff", opacity: 1, zIndex: maxZ + 1, borderRadius: type === "shape" ? 8 : 0,
    }
    const next: PreviewLayer = type === "text"
      ? { ...base, text: "Mock text", fontSize: 10 }
      : type === "icon"
        ? { ...base, icon: "heart", fontSize: 18 }
        : type === "media"
        ? { ...base, mediaId, width: 42, height: 30, borderRadius: 8 }
          : base
    saveDesign({ ...design, layers: [...design.layers, next] })
    setSelectedId(next.id)
    setEditing(true)
  }
  function duplicateLayer() {
    if (!selectedLayer) return
    const copy = {
      ...selectedLayer,
      id: layerId(selectedLayer.type),
      x: clamp(selectedLayer.x + 4, 0, 100 - selectedLayer.width),
      y: clamp(selectedLayer.y + 4, 0, 100 - selectedLayer.height),
      zIndex: Math.max(0, ...design.layers.map(layer => layer.zIndex ?? 4)) + 1,
    }
    saveDesign({ ...design, layers: [...design.layers, copy] })
    setSelectedId(copy.id)
  }
  function deleteLayer() {
    if (!selectedLayer || design.layers.length <= 1) return
    const nextLayers = design.layers.filter(layer => layer.id !== selectedLayer.id)
    saveDesign({ ...design, layers: nextLayers })
    setSelectedId(nextLayers[0]?.id ?? "")
  }
  function orderedLayers(layers = design.layers) {
    return [...layers]
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      .map((layer, index) => ({ ...layer, zIndex: index + 1 }))
  }
  function reorderLayer(action: "front" | "back" | "forward" | "backward") {
    if (!selectedLayer) return
    const layers = orderedLayers()
    const index = layers.findIndex(layer => layer.id === selectedLayer.id)
    if (index < 0) return
    const [layer] = layers.splice(index, 1)
    if (action === "front") layers.push(layer)
    if (action === "back") layers.unshift(layer)
    if (action === "forward") layers.splice(Math.min(index + 1, layers.length), 0, layer)
    if (action === "backward") layers.splice(Math.max(index - 1, 0), 0, layer)
    saveDesign({ ...design, layers: layers.map((l, i) => ({ ...l, zIndex: i + 1 })) })
    setSelectedId(selectedLayer.id)
  }
  function resetTemplate() {
    const next = createDefaultPreviewDesign(layout, activePreview, activePostType, previewItem?.id)
    saveDesign(next)
    setSelectedId(next.layers.find(layer => layer.type !== "shape")?.id ?? next.layers[0]?.id ?? "")
  }
  return (
    <>
    <aside className="cc-preview-panel" ref={previewRef}>
      <div className="cc-preview-title">Preview <span style={{ color: "#e7ad42" }}>☆</span></div>
      <div style={{ fontSize: 8.5, color: "#7a8588", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <PlatformIcon platform={activePreview} size={11} />
        {getPlatformConfig(activePreview).label} / {activePostType}
      </div>
      <div className="cc-preview-customize">
        <span>Preview designer</span>
        <button type="button" onClick={() => setEditing(true)}><PenLine size={11} />Edit</button>
      </div>
      {editing && selectedLayer && (
        <div className="cc-preview-editor">
          <div className="cc-layer-toolbar">
            <button type="button" title="Add text" onClick={() => addLayer("text")}><Type size={13} /></button>
            <button type="button" title="Add image" onClick={() => addLayer("media")}><ImagePlus size={13} /></button>
            <button type="button" title="Add icon" onClick={() => addLayer("icon")}><Heart size={13} /></button>
            <button type="button" title="Add shape" onClick={() => addLayer("shape")}><Square size={13} /></button>
          </div>
          <div className="cc-layer-actions">
            <button type="button" title="Duplicate" onClick={duplicateLayer}><Copy size={12} /></button>
            <button type="button" title="Show or hide" onClick={() => updateLayer({ visible: selectedLayer.visible === false })}>{selectedLayer.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}</button>
            <button type="button" title="Reset template" onClick={resetTemplate}><Sparkles size={12} /></button>
            <button type="button" title="Delete" onClick={deleteLayer}><Trash2 size={12} /></button>
          </div>
          <div className="cc-layer-actions order">
            <button type="button" title="Send to back" onClick={() => reorderLayer("back")}><ChevronsDown size={12} /></button>
            <button type="button" title="Move backward" onClick={() => reorderLayer("backward")}><ArrowDown size={12} /></button>
            <button type="button" title="Move forward" onClick={() => reorderLayer("forward")}><ArrowUp size={12} /></button>
            <button type="button" title="Bring to front" onClick={() => reorderLayer("front")}><ChevronsUp size={12} /></button>
          </div>
          <select value={selectedLayer.id} onChange={event => setSelectedId(event.target.value)}>
            {design.layers.map(layer => <option key={layer.id} value={layer.id}>{layer.id} ({layer.type})</option>)}
          </select>
          {selectedLayer.type === "text" && (
            <>
              <textarea value={selectedLayer.text ?? ""} placeholder="Layer text"
                onChange={event => updateLayer({ text: event.target.value, binding: undefined })} />
              <div className="cc-preview-editor-row">
                <label>Binding
                  <select value={selectedLayer.binding ?? ""} onChange={event => updateLayer({ binding: (event.target.value || undefined) as PreviewLayer["binding"] })}>
                    <option value="">Manual text</option>
                    <option value="caption">Caption</option>
                    <option value="headline">Headline</option>
                    <option value="hashtags">Hashtags</option>
                    <option value="username">Username</option>
                    <option value="platform">Platform</option>
                  </select>
                </label>
                <label>Size <input type="number" min="5" max="48" value={selectedLayer.fontSize ?? 9} onChange={event => updateLayer({ fontSize: Number(event.target.value) })} /></label>
              </div>
            </>
          )}
          {selectedLayer.type === "icon" && (
            <div className="cc-preview-editor-row">
              <label>Icon
                <select value={selectedLayer.icon ?? "heart"} onChange={event => updateLayer({ icon: event.target.value })}>
                  <option value="heart">Heart</option><option value="comment">Comment</option><option value="send">Send</option><option value="bookmark">Bookmark</option><option value="music">Music</option><option value="home">Home</option><option value="search">Search</option><option value="user">User</option>
                </select>
              </label>
              <label>Size <input type="number" min="8" max="48" value={selectedLayer.fontSize ?? 16} onChange={event => updateLayer({ fontSize: Number(event.target.value) })} /></label>
            </div>
          )}
          {selectedLayer.type === "media" && (
            <>
              <LocalImageUpload value={selectedLayer.mediaId ? [selectedLayer.mediaId] : []} folder="brand" label={selectedLayer.mediaId ? "Replace layer image" : "Upload layer image"} onChange={ids => updateLayer({ mediaId: ids[0] })} />
            </>
          )}
          <div className="cc-preview-editor-row">
            <label>X <input type="range" min="0" max="100" value={selectedLayer.x} onChange={event => updateLayer({ x: Number(event.target.value) })} /></label>
            <label>Y <input type="range" min="0" max="100" value={selectedLayer.y} onChange={event => updateLayer({ y: Number(event.target.value) })} /></label>
            <label>W <input type="range" min="4" max="100" value={selectedLayer.width} onChange={event => updateLayer({ width: Number(event.target.value) })} /></label>
            <label>H <input type="range" min="3" max="100" value={selectedLayer.height} onChange={event => updateLayer({ height: Number(event.target.value) })} /></label>
            <label>Color <input type="color" value={(selectedLayer.color?.startsWith("#") ? selectedLayer.color : "#ffffff")} onChange={event => updateLayer({ color: event.target.value })} /></label>
            <label>Opacity <input type="range" min="0.1" max="1" step="0.05" value={selectedLayer.opacity ?? 1} onChange={event => updateLayer({ opacity: Number(event.target.value) })} /></label>
          </div>
        </div>
      )}
      <div className={`cc-preview-canvas ${canvasClass}`}>
        {canvasClass === "phone" && <>
          <div className="cc-phone-island" />
          <div className="cc-phone-status-bar">
            <span>9:41</span>
            <div className="cc-phone-status-icons">
              <svg width="11" height="8" viewBox="0 0 11 8" fill="white"><rect x="0" y="5" width="2" height="3" rx=".4"/><rect x="3" y="3.5" width="2" height="4.5" rx=".4"/><rect x="6" y="2" width="2" height="6" rx=".4"/><rect x="9" y="0" width="2" height="8" rx=".4"/></svg>
              <svg width="11" height="8" viewBox="0 0 11 8" fill="white"><path d="M5.5 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/><path d="M5.5 3C6.9 3 8.1 3.6 9 4.5l1-1A6 6 0 0 0 5.5 1.5 6 6 0 0 0 2 3.5l1 1A4.3 4.3 0 0 1 5.5 3z" fillOpacity=".8"/><path d="M5.5.5C7.8.5 9.8 1.4 11.2 3L10 4.1A5.3 5.3 0 0 0 5.5 2a5.3 5.3 0 0 0-4.5 2L-.2 3A7 7 0 0 1 5.5.5z" fillOpacity=".5"/></svg>
              <svg width="20" height="9" viewBox="0 0 20 9" fill="none"><rect x=".5" y=".5" width="16" height="8" rx="2.5" stroke="white" strokeOpacity=".45" strokeWidth=".8"/><rect x="1.5" y="1.5" width="12" height="6" rx="1.5" fill="white"/><path d="M17.5 3.2v2.6c.9-.4.9-2.2 0-2.6z" fill="white" fillOpacity=".45"/></svg>
            </div>
          </div>
          <div className="cc-phone-home" />
        </>}
        <div className={`cc-canvas-art${useReferencePreview ? " reference" : ""}`} style={previewStyle}>
          <div className="cc-canvas-shade" />
        </div>
        <PreviewLayers design={design} editing={false} selectedId={effectiveSelectedId}
          media={media} urls={urls} onSelect={setSelectedId} onLayerChange={updateLayerById}
          values={values} />
      </div>
      <div className="cc-device-row">
        <div className="cc-device-select"><Smartphone size={13} />iPhone 14/15 Pro <ChevronDown size={11} style={{ marginLeft: "auto" }} /></div>
        <button className="cc-expand"><Expand size={14} /></button>
      </div>
    </aside>
    {editing && selectedLayer && (
      <div className="cc-preview-edit-overlay" role="dialog" aria-modal="true">
        <div className="cc-preview-edit-modal">
          <div className="cc-preview-edit-head">
            <div>
              <h2>Edit preview</h2>
              <span>{getPlatformConfig(activePreview).label} / {activePostType}</span>
            </div>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => setEditing(false)}><Save size={12} />Save</button>
            <button type="button" onClick={() => setEditing(false)}><X size={12} />Close</button>
          </div>
          <div className="cc-preview-edit-body">
            <div className="cc-preview-edit-stage">
              <div className={`cc-preview-canvas ${canvasClass}`}>
                {canvasClass === "phone" && <>
                  <div className="cc-phone-island" />
                  <div className="cc-phone-status-bar">
                    <span>9:41</span>
                    <div className="cc-phone-status-icons">
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="white"><rect x="0" y="5" width="2" height="3" rx=".4"/><rect x="3" y="3.5" width="2" height="4.5" rx=".4"/><rect x="6" y="2" width="2" height="6" rx=".4"/><rect x="9" y="0" width="2" height="8" rx=".4"/></svg>
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="white"><path d="M5.5 5.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/><path d="M5.5 3C6.9 3 8.1 3.6 9 4.5l1-1A6 6 0 0 0 5.5 1.5 6 6 0 0 0 2 3.5l1 1A4.3 4.3 0 0 1 5.5 3z" fillOpacity=".8"/><path d="M5.5.5C7.8.5 9.8 1.4 11.2 3L10 4.1A5.3 5.3 0 0 0 5.5 2a5.3 5.3 0 0 0-4.5 2L-.2 3A7 7 0 0 1 5.5.5z" fillOpacity=".5"/></svg>
                      <svg width="20" height="9" viewBox="0 0 20 9" fill="none"><rect x=".5" y=".5" width="16" height="8" rx="2.5" stroke="white" strokeOpacity=".45" strokeWidth=".8"/><rect x="1.5" y="1.5" width="12" height="6" rx="1.5" fill="white"/><path d="M17.5 3.2v2.6c.9-.4.9-2.2 0-2.6z" fill="white" fillOpacity=".45"/></svg>
                    </div>
                  </div>
                  <div className="cc-phone-home" />
                </>}
                <div className={`cc-canvas-art${useReferencePreview ? " reference" : ""}`} style={previewStyle}>
                  <div className="cc-canvas-shade" />
                </div>
                <PreviewLayers design={design} editing={true} selectedId={effectiveSelectedId}
                  media={media} urls={urls} onSelect={setSelectedId} onLayerChange={updateLayerById}
                  values={values} />
              </div>
            </div>
            <div className="cc-preview-edit-tools">
              <div className="cc-preview-editor">
                <div className="cc-layer-toolbar">
                  <button type="button" title="Add text" onClick={() => addLayer("text")}><Type size={13} /></button>
                  <button type="button" title="Add image" onClick={() => addLayer("media")}><ImagePlus size={13} /></button>
                  <button type="button" title="Add icon" onClick={() => addLayer("icon")}><Heart size={13} /></button>
                  <button type="button" title="Add shape" onClick={() => addLayer("shape")}><Square size={13} /></button>
                </div>
                <div className="cc-layer-actions">
                  <button type="button" title="Duplicate" onClick={duplicateLayer}><Copy size={12} /></button>
                  <button type="button" title="Show or hide" onClick={() => updateLayer({ visible: selectedLayer.visible === false })}>{selectedLayer.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}</button>
                  <button type="button" title="Reset template" onClick={resetTemplate}><Sparkles size={12} /></button>
                  <button type="button" title="Delete" onClick={deleteLayer}><Trash2 size={12} /></button>
                </div>
                <div className="cc-layer-actions order">
                  <button type="button" title="Send to back" onClick={() => reorderLayer("back")}><ChevronsDown size={12} /></button>
                  <button type="button" title="Move backward" onClick={() => reorderLayer("backward")}><ArrowDown size={12} /></button>
                  <button type="button" title="Move forward" onClick={() => reorderLayer("forward")}><ArrowUp size={12} /></button>
                  <button type="button" title="Bring to front" onClick={() => reorderLayer("front")}><ChevronsUp size={12} /></button>
                </div>
                <select value={selectedLayer.id} onChange={event => setSelectedId(event.target.value)}>
                  {design.layers.map(layer => <option key={layer.id} value={layer.id}>{layer.id} ({layer.type})</option>)}
                </select>
                {selectedLayer.type === "text" && (
                  <>
                    <textarea value={selectedLayer.text ?? ""} placeholder="Layer text"
                      onChange={event => updateLayer({ text: event.target.value, binding: undefined })} />
                    <div className="cc-preview-editor-row">
                      <label>Binding
                        <select value={selectedLayer.binding ?? ""} onChange={event => updateLayer({ binding: (event.target.value || undefined) as PreviewLayer["binding"] })}>
                          <option value="">Manual text</option>
                          <option value="caption">Caption</option>
                          <option value="headline">Headline</option>
                          <option value="hashtags">Hashtags</option>
                          <option value="username">Username</option>
                          <option value="platform">Platform</option>
                        </select>
                      </label>
                      <label>Size <input type="number" min="5" max="48" value={selectedLayer.fontSize ?? 9} onChange={event => updateLayer({ fontSize: Number(event.target.value) })} /></label>
                    </div>
                  </>
                )}
                {selectedLayer.type === "icon" && (
                  <div className="cc-preview-editor-row">
                    <label>Icon
                      <select value={selectedLayer.icon ?? "heart"} onChange={event => updateLayer({ icon: event.target.value })}>
                        <option value="heart">Heart</option><option value="comment">Comment</option><option value="send">Send</option><option value="bookmark">Bookmark</option><option value="music">Music</option><option value="home">Home</option><option value="search">Search</option><option value="user">User</option>
                      </select>
                    </label>
                    <label>Size <input type="number" min="8" max="48" value={selectedLayer.fontSize ?? 16} onChange={event => updateLayer({ fontSize: Number(event.target.value) })} /></label>
                  </div>
                )}
                {selectedLayer.type === "media" && (
                  <>
                    <LocalImageUpload value={selectedLayer.mediaId ? [selectedLayer.mediaId] : []} folder="brand" label={selectedLayer.mediaId ? "Replace layer image" : "Upload layer image"} onChange={ids => updateLayer({ mediaId: ids[0] })} />
                  </>
                )}
                <div className="cc-preview-editor-row">
                  <label>X <input type="range" min="0" max="100" value={selectedLayer.x} onChange={event => updateLayer({ x: Number(event.target.value) })} /></label>
                  <label>Y <input type="range" min="0" max="100" value={selectedLayer.y} onChange={event => updateLayer({ y: Number(event.target.value) })} /></label>
                  <label>W <input type="range" min="4" max="100" value={selectedLayer.width} onChange={event => updateLayer({ width: Number(event.target.value) })} /></label>
                  <label>H <input type="range" min="3" max="100" value={selectedLayer.height} onChange={event => updateLayer({ height: Number(event.target.value) })} /></label>
                  <label>Color <input type="color" value={(selectedLayer.color?.startsWith("#") ? selectedLayer.color : "#ffffff")} onChange={event => updateLayer({ color: event.target.value })} /></label>
                  <label>Opacity <input type="range" min="0.1" max="1" step="0.05" value={selectedLayer.opacity ?? 1} onChange={event => updateLayer({ opacity: Number(event.target.value) })} /></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default function Composer() {
  const { composerDrafts, activeComposerId, campaigns, userName, saveComposerDraft, scheduleComposer, closeComposer } = useContentCalendarStore()
  const stored = composerDrafts.find(d => d.id === activeComposerId)
  function prepareInitialDraft(source: ComposerDraft | undefined) {
    if (!source) return source
    const selectedPlatforms = Array.from(new Set(source.platforms.length ? source.platforms : [getActivePlatformIds()[0] ?? "instagram"]))
    const platformSlots: Record<string, PlatformSlot> = { ...(source.platformSlots ?? {}) }
    const contentSlots: Record<string, PlatformSlot> = { ...(source.contentSlots ?? {}) }

    for (const [platform, slot] of Object.entries(source.platformSlots ?? {})) {
      const key = contentSlotKey(platform, slot.postType)
      if (!contentSlots[key]) contentSlots[key] = slot
    }

    for (const platform of selectedPlatforms) {
      const selectedType = platformSlots[platform]?.postType
        ?? (platform === source.platforms[0] ? source.postType : getPlatformConfig(platform).postTypes[0]?.id)
        ?? source.postType
      const isPrimaryPlatform = platform === source.platforms[0]
      const selectedSlot = platformSlots[platform] ?? createPlatformSlot(platform, isPrimaryPlatform ? {
        postType: selectedType,
        caption: source.caption,
        hashtags: source.hashtags,
        altText: source.altText,
        hook: source.hook,
        cta: source.cta,
        mediaIds: source.mediaIds,
        firstComment: source.firstComment,
        extras: source.platformExtras ?? {},
        previewDesign: source.previewDesign,
        previewDesigns: source.previewDesigns,
      } : { postType: selectedType })
      platformSlots[platform] = { ...selectedSlot, postType: selectedType }
      const key = contentSlotKey(platform, selectedType)
      if (!contentSlots[key]) contentSlots[key] = platformSlots[platform]
    }

    const normalized: ComposerDraft = {
      ...source,
      platforms: selectedPlatforms,
      composerMode: getComposerMode(selectedPlatforms),
      contentSlots,
      platformSlots: selectedPlatforms.length > 1 ? platformSlots : undefined,
      activePlatformTab: source.activePlatformTab && selectedPlatforms.includes(source.activePlatformTab)
        ? source.activePlatformTab
        : selectedPlatforms[0],
    }
    const activePlatform = normalized.activePlatformTab ?? normalized.platforms[0] ?? "instagram"
    const activeType = selectedPostTypeForPlatform(normalized, activePlatform)
    return syncRootFromSlot(normalized, activePlatform, readContentSlot(normalized, activePlatform, activeType))
  }
  const [draft, setDraft] = useState<ComposerDraft | undefined>(() => prepareInitialDraft(stored))
  const [hashtag, setHashtag] = useState("")
  const [slotHashtag, setSlotHashtag] = useState("")
  const [media, setMedia] = useState<StoredMediaItem[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null)
  const [previewPlatform, setPreviewPlatform] = useState<string>(stored?.platforms[0] ?? "instagram")
  const previewRef = useRef<HTMLElement>(null)
  const urlRef = useRef<string[]>([])
  const addMediaRef = useRef<LocalImageUploadHandle>(null)

  useEffect(() => {
    let active = true
    loadMedia()
      .then(items => {
        if (!active) return
        const next: Record<string, string> = {}
        for (const item of items) {
          if (item.blob) {
            const url = URL.createObjectURL(item.blob)
            next[item.id] = url
            urlRef.current.push(url)
          }
        }
        setMedia(items); setUrls(next)
      })
      .catch(() => setMessage({ kind: "error", text: "Local images could not be loaded. Your form is still safe." }))
    return () => {
      active = false
      urlRef.current.forEach(URL.revokeObjectURL)
      urlRef.current = []
    }
  }, [])

  if (!draft) return (
    <div className="cc-placeholder"><div>No composer draft is open.</div><button onClick={closeComposer}>Return</button></div>
  )
  const currentDraft = draft

  function activeEditPlatform(source: ComposerDraft = currentDraft) {
    return source.platforms.includes(previewPlatform) ? previewPlatform : (source.platforms[0] ?? "instagram")
  }

  function updateContentSlot(platform: string, postType: string, patch: Partial<PlatformSlot>) {
    setDraft(cur => {
      if (!cur) return cur
      const existing = readContentSlot(cur, platform, postType)
      const nextSlot: PlatformSlot = { ...existing, ...patch, postType }
      const contentSlots = { ...(cur.contentSlots ?? {}), [contentSlotKey(platform, postType)]: nextSlot }
      const platformSlots = cur.platforms.length > 1
        ? { ...(cur.platformSlots ?? {}), [platform]: { ...nextSlot } }
        : cur.platformSlots
      const next: ComposerDraft = { ...cur, contentSlots, platformSlots }
      return platform === activeEditPlatform(cur) ? syncRootFromSlot(next, platform, nextSlot) : next
    })
    setMessage(null)
  }

  function switchPostType(platform: string, postType: string) {
    setDraft(cur => {
      if (!cur) return cur
      const contentSlots = { ...(cur.contentSlots ?? {}) }
      const key = contentSlotKey(platform, postType)
      if (!contentSlots[key]) contentSlots[key] = createPlatformSlot(platform, { postType })
      const platformSlots = cur.platforms.length > 1
        ? { ...(cur.platformSlots ?? {}), [platform]: { ...contentSlots[key], postType } }
        : cur.platformSlots
      const next: ComposerDraft = {
        ...cur,
        postType: platform === cur.platforms[0] ? postType : cur.postType,
        contentSlots,
        platformSlots,
      }
      return platform === activeEditPlatform(cur) ? syncRootFromSlot(next, platform, contentSlots[key]) : next
    })
    setMessage(null)
  }

  function updateDraft<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    if (key === "postType") {
      switchPostType(activeEditPlatform(), value as string)
      return
    }
    if (key === "caption" || key === "hashtags" || key === "altText" || key === "hook" || key === "cta" || key === "mediaIds" || key === "firstComment") {
      const platform = activeEditPlatform()
      updateContentSlot(platform, selectedPostTypeForPlatform(currentDraft, platform), { [key]: value } as Partial<PlatformSlot>)
      return
    }
    setDraft(cur => cur ? { ...cur, [key]: value } : cur)
    setMessage(null)
  }

  function updateExtra(key: string, val: unknown) {
    const platform = activeEditPlatform()
    const postType = selectedPostTypeForPlatform(currentDraft, platform)
    const slot = readContentSlot(currentDraft, platform, postType)
    updateContentSlot(platform, postType, { extras: { ...slot.extras, [key]: val } })
  }

  function handlePlatformsChange(platforms: string[]) {
    setDraft(cur => {
      if (!cur) return cur
      const selected = Array.from(new Set(platforms)).filter(Boolean)
      if (!selected.length) return cur
      const existingPlatformSlots = cur.platformSlots ?? {}
      const platformSlots: Record<string, PlatformSlot> = {}
      const contentSlots: Record<string, PlatformSlot> = { ...(cur.contentSlots ?? {}) }
      for (const platform of selected) {
        const selectedType = existingPlatformSlots[platform]?.postType
          ?? (platform === cur.platforms[0] ? cur.postType : getPlatformConfig(platform).postTypes[0]?.id)
          ?? cur.postType
        const key = contentSlotKey(platform, selectedType)
        const isPrimaryPlatform = platform === cur.platforms[0]
        if (!contentSlots[key]) {
          contentSlots[key] = existingPlatformSlots[platform] ?? createPlatformSlot(platform, isPrimaryPlatform ? {
            postType: selectedType,
            caption: cur.caption,
            hashtags: cur.hashtags,
            altText: cur.altText,
            hook: cur.hook,
            cta: cur.cta,
            mediaIds: cur.mediaIds,
            firstComment: cur.firstComment,
            extras: cur.platformExtras ?? {},
            previewDesign: cur.previewDesign,
            previewDesigns: cur.previewDesigns,
          } : { postType: selectedType })
        }
        platformSlots[platform] = { ...contentSlots[key], postType: selectedType }
      }
      const next: ComposerDraft = {
        ...cur,
        platforms: selected,
        composerMode: getComposerMode(selected),
        contentSlots,
        platformSlots: selected.length > 1 ? platformSlots : undefined,
        activePlatformTab: selected.includes(cur.activePlatformTab ?? "") ? cur.activePlatformTab : selected[0],
      }
      const activePlatform = selected.includes(activeEditPlatform(cur)) ? activeEditPlatform(cur) : selected[0]
      const activeType = selectedPostTypeForPlatform(next, activePlatform)
      return syncRootFromSlot(next, activePlatform, readContentSlot(next, activePlatform, activeType))
    })
    setMessage(null)
  }

  function addHashtag(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return
    event.preventDefault()
    const val = hashtag.replace(/^#/, "").trim()
    if (val && currentDraft.hashtags.length < 30 && !currentDraft.hashtags.includes(val))
      updateDraft("hashtags", [...currentDraft.hashtags, val])
    setHashtag("")
  }

  function updateSlot(platform: string, key: keyof PlatformSlot, val: unknown) {
    const postType = selectedPostTypeForPlatform(currentDraft, platform)
    if (key === "postType") {
      switchPostType(platform, val as string)
      return
    }
    updateContentSlot(platform, postType, { [key]: val } as Partial<PlatformSlot>)
  }

  function updateActiveSlotDraft<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    if (!activePlatformTab) return
    if (key === "caption" || key === "hashtags" || key === "altText" || key === "hook" || key === "cta" || key === "mediaIds" || key === "firstComment") {
      updateSlot(activePlatformTab, key as keyof PlatformSlot, value)
      return
    }
    if (key === "postType") updateSlot(activePlatformTab, "postType", value)
    if (key === "publishDate" || key === "publishTime") updateDraft(key, value)
  }

  function updateSlotExtra(key: string, val: unknown) {
    if (!activePlatformTab || !activeSlot) return
    updateContentSlot(activePlatformTab, activeSlot.postType, { extras: { ...activeSlot.extras, [key]: val } })
  }

  function updatePreviewDesign(platform: string, postType: string, design: PreviewDesign) {
    const key = previewDesignKey(platform, postType)
    const slot = readContentSlot(currentDraft, platform, postType)
    updateContentSlot(platform, postType, {
      previewDesign: design,
      previewDesigns: { ...(slot.previewDesigns ?? {}), [key]: design },
    })
  }

  function addSlotHashtag(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return
    event.preventDefault()
    if (!activePlatformTab || !activeSlot) return
    const val = slotHashtag.replace(/^#/, "").trim()
    const max = getPostTypeConfig(activePlatformTab, activeSlot.postType).fields.hashtagsMax
    if (val && activeSlot.hashtags.length < max && !activeSlot.hashtags.includes(val)) {
      updateSlot(activePlatformTab, "hashtags", [...activeSlot.hashtags, val])
    }
    setSlotHashtag("")
  }

  function save() {
    const saved = saveComposerDraft(currentDraft)
    setDraft(saved)
    setMessage({ kind: "success", text: "Draft saved locally and added to Drafting." })
  }

  function schedule() {
    const missing: string[] = []
    if (!currentDraft.platforms.length) missing.push("a platform")
    if (currentDraft.platforms.length <= 1) {
      const needsText = !currentDraft.caption.trim() && !((currentDraft.platformExtras?.headline as string)?.trim())
      if (needsText) missing.push("a caption or title")
      if (!currentDraft.mediaIds.length) missing.push("media")
    } else {
      const emptySlots = currentDraft.platforms.filter(platform => {
        const postType = selectedPostTypeForPlatform(currentDraft, platform)
        const slot = readContentSlot(currentDraft, platform, postType)
        const needsText = !slot.caption.trim() && !((slot.extras.headline as string | undefined)?.trim())
        const needsMedia = getPostTypeConfig(platform, slot.postType).fields.media && !slot.mediaIds.length
        return needsText || needsMedia
      })
      if (emptySlots.length) missing.push(`content for ${emptySlots.map(platform => getPlatformConfig(platform).label).join(", ")}`)
    }
    if (!currentDraft.publishDate) missing.push("a date")
    if (!currentDraft.publishTime) missing.push("a time")
    if (missing.length) { setMessage({ kind: "error", text: `Add ${missing.join(", ")} before scheduling.` }); return }
    scheduleComposer(currentDraft)
  }

  const usesPlatformSlots = currentDraft.platforms.length > 1
  const validPostTypes = getCompatiblePostTypes(currentDraft.platforms)
  const primaryPlatform = currentDraft.platforms[0] ?? "instagram"
  const ptConfig = getPostTypeConfig(primaryPlatform, currentDraft.postType)
  const activeFields = ptConfig.fields
  const checkItems = getChecklistItems(currentDraft.postType)

  const activePlatformTab = currentDraft.platforms.includes(previewPlatform) ? previewPlatform : (currentDraft.platforms[0] ?? "")
  const activeSlotPostType = activePlatformTab ? selectedPostTypeForPlatform(currentDraft, activePlatformTab) : ""
  const activeSlot = activePlatformTab ? readContentSlot(currentDraft, activePlatformTab, activeSlotPostType) : undefined
  const slotPlatformConfig = activePlatformTab ? getPlatformConfig(activePlatformTab) : null
  const slotPostTypes = slotPlatformConfig?.postTypes ?? []
  const slotType = activeSlot?.postType ?? slotPostTypes[0]?.id ?? "Post"
  const slotPtConfig = getPostTypeConfig(activePlatformTab, slotType)
  const slotDraft: ComposerDraft | undefined = activeSlot ? {
    ...currentDraft,
    postType: activeSlot.postType,
    caption: activeSlot.caption,
    hashtags: activeSlot.hashtags,
    altText: activeSlot.altText,
    hook: activeSlot.hook,
    cta: activeSlot.cta,
    mediaIds: activeSlot.mediaIds,
    firstComment: activeSlot.firstComment,
    platformExtras: activeSlot.extras,
  } : undefined

  return (
    <div className="cc-composer">
      <style>{COMPOSER_CSS}</style><style>{`.cc-campaign-select-row{display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:10px;border:1px solid #ede6df;border-radius:8px;background:var(--cc-card);font-size:10px;font-weight:700}.cc-campaign-select-row select{height:28px;min-width:220px;border:1px solid #e6dfd8;border-radius:7px;background:var(--cc-card);padding:0 8px;font:inherit;font-weight:400}`}</style>

      {/* Header */}
      <header className="cc-composer-head">
        <div>
          <div className="cc-composer-heading-row">
            <h1 className="cc-composer-heading">Create something worth saving.</h1>
            <Sparkles className="cc-composer-star" size={28} />
          </div>
          <div className="cc-composer-line" />
        </div>
        <div className="cc-composer-actions">
          {currentDraft.calendarPostId ? (
            <button className="cc-composer-action primary" onClick={save}><Save size={13} />Save</button>
          ) : (
            <>
              <button className="cc-composer-action" onClick={save}><Save size={13} />Save draft</button>
              <button className="cc-composer-action primary" onClick={schedule}><CalendarDays size={13} />Add to calendar</button>
            </>
          )}
          <button className="cc-composer-action preview"
            onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            <Eye size={14} />Preview
          </button>
        </div>
      </header>

      <div className="cc-composer-body">
        <main className="cc-composer-form">

          <div className="cc-campaign-select-row"><label htmlFor="composer-campaign">Campaign</label><select id="composer-campaign" value={currentDraft.campaignId ?? ""} onChange={event => updateDraft("campaignId", event.target.value || undefined)}><option value="">No campaign</option>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></div>

          {/* Unified platform strip — click to select/deselect and switch preview */}
          <PlatformStrip
            draft={currentDraft}
            onPlatformsChange={handlePlatformsChange}
            previewPlatform={previewPlatform}
            onPreviewChange={setPreviewPlatform}
          />

          {usesPlatformSlots ? (
            /* PLATFORM-SPECIFIC MODE */
            <>
              {activePlatformTab && (
                <section className="cc-type-row"
                  style={{ gridTemplateColumns: `80px repeat(${slotPostTypes.length}, 1fr)` }}>
                  <span className="cc-type-label">Post type</span>
                  {slotPostTypes.map(pt => (
                    <button key={pt.id}
                      className={`cc-type-choice${slotType === pt.id ? " active" : ""}`}
                      onClick={() => switchPostType(activePlatformTab, pt.id)}>
                      {pt.label}
                    </button>
                  ))}
                </section>
              )}

              {activeSlot && slotDraft && (
                <section className="cc-details-panel">
                  <div className="cc-details-title">
                    {slotPlatformConfig?.label ?? activePlatformTab} · {slotType} Details <span>+</span>
                  </div>
                  <ComposerFields
                    fields={slotPtConfig.fields}
                    draft={slotDraft}
                    extra={activeSlot.extras}
                    updateDraft={updateActiveSlotDraft}
                    updateExtra={updateSlotExtra}
                    media={media}
                    urls={urls}
                    hashtag={slotHashtag}
                    setHashtag={setSlotHashtag}
                    addHashtag={addSlotHashtag}
                    openFilePicker={() => addMediaRef.current?.open()}
                  />
                </section>
              )}


              {message && (
                <div className={message.kind === "error" ? "cc-composer-error" : "cc-composer-success"} style={{ marginTop: 8 }}>
                  {message.text}
                </div>
              )}
            </>
          ) : (
            /* SINGLE PLATFORM MODE */
            <>
              <section className="cc-type-row"
                style={{ gridTemplateColumns: `80px repeat(${validPostTypes.length}, 1fr)` }}>
                <span className="cc-type-label">Post type</span>
                {validPostTypes.map(typeId => {
                  const pt = getPostTypeConfig(primaryPlatform, typeId)
                  return (
                    <button key={typeId}
                      className={`cc-type-choice${currentDraft.postType === typeId ? " active" : ""}`}
                      onClick={() => switchPostType(primaryPlatform, typeId)}>
                      {pt.label}
                    </button>
                  )
                })}
              </section>

              <section className="cc-details-panel">
                <div className="cc-details-title">{currentDraft.postType} Details <span>☆</span></div>
                {(() => {
                  const singleSlot = readContentSlot(currentDraft, primaryPlatform, currentDraft.postType)
                  const singleSlotDraft: ComposerDraft = {
                    ...currentDraft,
                    caption: singleSlot.caption,
                    hashtags: singleSlot.hashtags,
                    altText: singleSlot.altText,
                    hook: singleSlot.hook,
                    cta: singleSlot.cta,
                    mediaIds: singleSlot.mediaIds,
                    firstComment: singleSlot.firstComment,
                    platformExtras: singleSlot.extras,
                  }
                  return (
                    <ComposerFields
                      fields={activeFields}
                      draft={singleSlotDraft}
                      extra={singleSlot.extras}
                      updateDraft={updateDraft}
                      updateExtra={updateExtra}
                      media={media}
                      urls={urls}
                      hashtag={hashtag}
                      setHashtag={setHashtag}
                      addHashtag={addHashtag}
                      openFilePicker={() => addMediaRef.current?.open()}
                    />
                  )
                })()}

                <div className="cc-checklist">
                  <div className="cc-field-title"><CheckCircle2 size={15} />Checklist</div>
                  <div className="cc-checklist-box">
                    {checkItems.map(item => (
                      <label className="cc-check" key={item.key}>
                        <input type="checkbox" checked={currentDraft.checklist[item.key]}
                          onChange={e => updateDraft("checklist", { ...currentDraft.checklist, [item.key]: e.target.checked })} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                {message && (
                  <div className={message.kind === "error" ? "cc-composer-error" : "cc-composer-success"}>
                    {message.text}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <PreviewPanel draft={currentDraft} media={media} urls={urls} previewRef={previewRef}
          previewPlatform={previewPlatform} onDesignChange={updatePreviewDesign} userName={userName} />
      </div>

      <div style={{ display: 'none' }}>
        <LocalImageUpload
          ref={addMediaRef}
          value={usesPlatformSlots && activeSlot ? activeSlot.mediaIds : currentDraft.mediaIds}
          multiple={(usesPlatformSlots ? (slotPtConfig.fields.mediaMax ?? 10) : (activeFields.mediaMax ?? 10)) > 1}
          onChange={ids => {
            if (usesPlatformSlots && activePlatformTab)
              updateSlot(activePlatformTab, "mediaIds", ids)
            else
              updateDraft("mediaIds", ids)
          }}
        />
      </div>
    </div>
  )
}
