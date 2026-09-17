import { useRef, useState } from 'react';
import axios from 'axios';
import { apiUrl, apiRoutes } from '../config/env';

/**
 * Upload control for park detail — saves into skate_assets/{parkFolder}/ via API.
 */
export default function ParkPhotoUpload({ parkId, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!parkId || !files.length) return;

    setUploading(true);
    setMessage(null);

    const body = new FormData();
    for (const file of files) {
      body.append('photos', file);
    }

    try {
      const response = await axios.post(apiUrl(`${apiRoutes.uploadParkPhotos}${parkId}/photos`), body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (status) => status >= 200 && status < 300,
      });
      const count = response.data?.uploaded?.length || files.length;
      setMessage({
        type: 'success',
        text: count === 1 ? 'Photo added' : `${count} photos added`,
      });
      onUploaded?.(response.data);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      const text =
        err.response?.data?.message || err.message || 'Could not upload photos';
      setMessage({ type: 'error', text });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        disabled={uploading || !parkId}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={uploading || !parkId}
        onClick={() => inputRef.current?.click()}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition-colors hover:border-amber-400/60 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {uploading ? 'Uploading…' : 'Add photos'}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}
      <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF · up to 12MB each</p>
    </div>
  );
}
