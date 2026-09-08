import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl } from '../config/env';

function photoSrc(photo) {
  const raw = photo.url || photo.photoUrl || photo.filePath;
  return assetUrl(raw);
}

function photoAlt(photo, parkName) {
  return photo.caption || photo.altText || parkName;
}

function photoKey(photo, index) {
  return photo.id || photo.slug || photoSrc(photo) || index;
}

/**
 * Park photos — single image or slider when multiple shots exist.
 * Expects photos from GET /api/getpark/:id (normalized photo + park_photo join).
 */
export default function ParkPhotoGallery({ photos = [], parkName = 'Skatepark', compact = false }) {
  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) ||
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      ),
    [photos]
  );

  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const count = sorted.length;
  const current = sorted[index];
  const hasMultiple = count > 1;

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!hasMultiple) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasMultiple, goPrev, goNext]);

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null || !hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  if (!count) {
    return (
      <div
        className={
          compact
            ? 'rounded-xl border border-dashed border-slate-600/80 bg-slate-950/40 px-4 py-6 text-center'
            : 'flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 px-4 text-center sm:min-h-[220px] sm:px-6'
        }
      >
        <p className="font-medium text-slate-300">No photos yet</p>
        {!compact && (
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Add images under <code className="text-slate-400">skate_assets/</code> for this park.
          </p>
        )}
      </div>
    );
  }

  const frameClass = compact
    ? 'overflow-hidden rounded-lg border border-slate-700 bg-slate-950'
    : 'overflow-hidden rounded-2xl border border-slate-700 bg-slate-950';
  const imageClass = compact
    ? 'aspect-[16/9] max-h-36 w-full object-cover'
    : 'aspect-[16/9] w-full object-cover sm:aspect-[16/10]';

  if (!hasMultiple) {
    const src = photoSrc(current);
    return (
      <div className={frameClass}>
        <a href={src} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={src}
            alt={photoAlt(current, parkName)}
            className={`${imageClass} transition-opacity hover:opacity-95`}
            loading="lazy"
          />
        </a>
        {current.caption && (
          <p className="border-t border-slate-800 px-3 py-2 text-sm text-slate-400">
            {current.caption}
          </p>
        )}
      </div>
    );
  }

  const src = photoSrc(current);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div
        className={`group relative touch-pan-y ${frameClass}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label={`Open photo ${index + 1} of ${count}`}
        >
          <img
            key={photoKey(current, index)}
            src={src}
            alt={photoAlt(current, parkName)}
            className={`${imageClass} transition-opacity hover:opacity-95`}
            loading="lazy"
            draggable={false}
          />
        </a>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600/80 bg-black/70 text-slate-100 opacity-100 backdrop-blur-sm transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-amber-500/40 sm:left-2 sm:h-9 sm:w-9 sm:opacity-90"
          aria-label="Previous photo"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600/80 bg-black/70 text-slate-100 opacity-100 backdrop-blur-sm transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-amber-500/40 sm:right-2 sm:h-9 sm:w-9 sm:opacity-90"
          aria-label="Next photo"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-slate-200 backdrop-blur-sm">
          {index + 1} / {count}
        </span>
      </div>

      {current.caption && (
        <p className="text-sm text-slate-400">{current.caption}</p>
      )}

      <div
        className="scroll-x-touch flex items-center gap-2 px-0.5"
        role="tablist"
        aria-label="Photo thumbnails"
      >
        {sorted.map((photo, i) => {
          const thumbSrc = photoSrc(photo);
          const selected = i === index;
          return (
            <button
              key={photoKey(photo, i)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`shrink-0 overflow-hidden rounded-md border transition ${
                selected
                  ? 'border-amber-500/70 ring-2 ring-amber-500/30'
                  : 'border-slate-700 opacity-70 hover:opacity-100'
              } ${compact ? 'h-11 w-14' : 'h-12 w-16 sm:h-14 sm:w-20'}`}
            >
              <img
                src={thumbSrc}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
