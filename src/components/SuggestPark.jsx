import React, { useState } from 'react';
import { PostData } from '../services/http';
import { apiUrl, apiRoutes } from '../config/env';

const initialForm = {
  parkName: '',
  address: '',
  website: '',
  description: '',
  contactEmail: '',
};

export default function SuggestPark() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await PostData(apiUrl(apiRoutes.suggestPark), form);
      setMessage({
        type: 'success',
        text: 'Thanks — your suggestion was received. We review new parks before adding them to the map.',
      });
      setForm(initialForm);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Could not send suggestion.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">Suggest a skatepark</h1>
        <p className="mt-2 text-slate-400">
          Know a spot that&apos;s missing from the directory? Send details and we&apos;ll verify before
          publishing — parks aren&apos;t added directly from the public site.
        </p>
      </header>

      {message && (
        <div
          role="alert"
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
              : 'border-rose-700/60 bg-rose-950/40 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="parkName" className="mb-1 block text-sm font-medium text-slate-300">
            Park name *
          </label>
          <input
            id="parkName"
            name="parkName"
            required
            value={form.parkName}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500/60"
            placeholder="Fairmont Skatepark"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-300">
            Address or city *
          </label>
          <input
            id="address"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500/60"
            placeholder="1040 E Sugarmont Dr, Salt Lake City, UT"
          />
        </div>

        <div>
          <label htmlFor="website" className="mb-1 block text-sm font-medium text-slate-300">
            Website (optional)
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500/60"
            placeholder="https://"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-300">
            What makes it worth a visit? *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500/60"
            placeholder="Bowl, street section, lighting, vibe…"
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-slate-300">
            Your email (optional)
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500/60"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Submit suggestion'}
        </button>
      </form>
    </div>
  );
}
