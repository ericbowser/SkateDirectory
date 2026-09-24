import { useRef, useState } from 'react';
import axios from 'axios';
import { apiUrl, apiRoutes } from '../config/env';
import { getAdminApiKey, setAdminApiKey } from '../services/http';

/**
 * Upload control for park detail — saves into skate_assets/{parkFolder}/ via API.
 * Server requires x-admin-key when ADMIN_API_KEY is set (and ALLOW_OPEN_ADMIN is off).
 */
export default function ParkPhotoUpload({ parkId, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showKey, setShowKey] = useState(() => !getAdminApiKey());
  const [adminKey, setAdminKey] = useState(() => getAdminApiKey());

  const handleFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!parkId || !files.length) return;

    const key = String(adminKey || '').trim();
    if (key) setAdminApiKey(key);

    setUploading(true);
    setMessage(null);

    const body = new FormData();
    for (const file of files) {
      body.append('photos', file);
    }

    try {
      // Do not set Content-Type manually — browser must add multipart boundary.
      const response = await axios.post(apiUrl(`${apiRoutes.uploadParkPhotos}${parkId}/photos`), body, {
        headers: key ? { 'x-admin-key': key } : {},
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
      const status = err.response?.status;
      const text =
        err.response?.data?.message || err.message || 'Could not upload photos';
      if (status === 403) {
        setShowKey(true);
        setMessage({
          type: 'error',
          text:
            text.includes('set ADMIN_API_KEY')
              ? 'Server has no ADMIN_API_KEY yet — add it to the server .env and restart the API, then use the same value here.'
              : 'Admin key rejected — paste the exact ADMIN_API_KEY from the server .env, then try again.',
        });
      } else {
        setMessage({ type: 'error', text });
      }
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
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
        >
          {showKey ? 'Hide key' : 'Admin key'}
        </button>
      </div>
      {showKey && (
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">
            Must match <code className="text-slate-300">ADMIN_API_KEY</code> on the server
          </span>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => {
              setAdminKey(e.target.value);
              setAdminApiKey(e.target.value);
            }}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            placeholder="Paste server ADMIN_API_KEY"
          />
        </label>
      )}
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
