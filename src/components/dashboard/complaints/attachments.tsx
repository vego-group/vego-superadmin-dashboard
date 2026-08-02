"use client";

// Attachment rendering for the complaints thread (CR-6): image thumbnails with
// a lightbox, PDF chips, and HEIC/HEIF support. HEIC is the iPhone camera
// default and MUST render — Chromium can't decode it natively, so files are
// converted to JPEG in the browser via heic2any (dynamically imported so the
// wasm decoder is only loaded when a HEIC attachment actually appears).

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, X } from "lucide-react";
import {
  ComplaintAttachment,
  isHeicAttachment,
  isImageAttachment,
} from "@/types/dashboard/complaint";
import { useLang } from "@/lib/language-context";

export const formatBytes = (bytes: number | null): string => {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Same-origin relay for cross-origin storage URLs (needed for HEIC fetch). */
const relayUrl = (url: string) => `/api/attachment?url=${encodeURIComponent(url)}`;

// ─── HEIC → JPEG conversion (cached per URL for the session) ─────────────────

const heicCache = new Map<string, Promise<string>>();

const fetchBlob = async (url: string): Promise<Blob> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download attachment (${res.status})`);
  return res.blob();
};

const convertHeic = (url: string): Promise<string> => {
  let promise = heicCache.get(url);
  if (!promise) {
    promise = (async () => {
      const [{ default: heic2any }, blob] = await Promise.all([
        import("heic2any"),
        // Direct fetch first (works if storage sends CORS headers), then the
        // same-origin relay.
        fetchBlob(url).catch(() => fetchBlob(relayUrl(url))),
      ]);
      const out = await heic2any({ blob, toType: "image/jpeg", quality: 0.9 });
      return URL.createObjectURL(Array.isArray(out) ? out[0] : out);
    })();
    // Drop failed conversions from the cache so a retry is possible.
    promise.catch(() => heicCache.delete(url));
    heicCache.set(url, promise);
  }
  return promise;
};

/** Displayable src for an image attachment; HEIC is converted on the fly. */
const useAttachmentImageSrc = (att: ComplaintAttachment) => {
  const heic = isHeicAttachment(att);
  const [converted, setConverted] = useState<{
    url: string;
    src: string | null;
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!heic) return;
    let cancelled = false;
    convertHeic(att.url)
      .then((src) => !cancelled && setConverted({ url: att.url, src, failed: false }))
      .catch(() => !cancelled && setConverted({ url: att.url, src: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [att.url, heic]);

  if (!heic) return { src: att.url, failed: false, converting: false };
  // Guard against state carried over from a previous attachment URL.
  const current = converted !== null && converted.url === att.url ? converted : null;
  return {
    src: current?.src ?? null,
    failed: current?.failed ?? false,
    converting: current === null,
  };
};

// ─── File chip (PDF / non-renderable files) ──────────────────────────────────

function FileChip({ att }: { att: ComplaintAttachment }) {
  return (
    <a
      href={att.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-xs text-gray-700 max-w-[220px]"
      title={att.name}
    >
      <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="truncate font-medium">{att.name}</span>
      {att.size !== null && (
        <span className="text-gray-400 whitespace-nowrap">{formatBytes(att.size)}</span>
      )}
    </a>
  );
}

// ─── Thumbnail tile ──────────────────────────────────────────────────────────

interface TileProps {
  attachment: ComplaintAttachment;
  onOpen: () => void;
}

export function AttachmentTile({ attachment, onOpen }: TileProps) {
  const { t } = useLang();
  const { src, failed, converting } = useAttachmentImageSrc(attachment);

  if (!isImageAttachment(attachment)) return <FileChip att={attachment} />;

  if (failed) {
    // Conversion/download failed — still give access to the original file.
    return <FileChip att={attachment} />;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:opacity-90 transition flex items-center justify-center"
      title={attachment.name}
    >
      {converting || !src ? (
        <span className="flex flex-col items-center gap-1 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[9px]">{t("HEIC", "HEIC")}</span>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={attachment.name} className="h-full w-full object-cover" />
      )}
    </button>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

interface LightboxProps {
  attachments: ComplaintAttachment[]; // images only
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function LightboxImage({ att }: { att: ComplaintAttachment }) {
  const { t } = useLang();
  const { src, failed, converting } = useAttachmentImageSrc(att);

  if (failed) {
    return (
      <div className="text-center text-white/80 text-sm space-y-3">
        <p>{t("Preview unavailable for this file.", "المعاينة غير متاحة لهذا الملف.")}</p>
        <a
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          <Download className="h-4 w-4" />
          {t("Download", "تنزيل")}
        </a>
      </div>
    );
  }
  if (converting || !src) {
    return (
      <div className="flex items-center gap-2 text-white/80 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("Preparing preview…", "جارٍ تجهيز المعاينة…")}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={att.name}
      className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
    />
  );
}

export function AttachmentLightbox({ attachments, index, onClose, onNavigate }: LightboxProps) {
  const att = attachments[index];
  const hasPrev = index > 0;
  const hasNext = index < attachments.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  if (!att || typeof document === "undefined") return null;

  // Portal to <body>: the Radix dialog content is CSS-transformed, which would
  // otherwise re-anchor this fixed overlay to the dialog box.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center"
      onClick={onClose}
      dir="ltr"
    >
      {/* Top bar */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 text-white/90"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm truncate max-w-[60vw]">
          {att.name}
          {attachments.length > 1 && (
            <span className="text-white/50 ms-2">
              {index + 1} / {attachments.length}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </a>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          className="absolute left-3 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <LightboxImage att={att} />
      </div>

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          className="absolute right-3 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>,
    document.body
  );
}
