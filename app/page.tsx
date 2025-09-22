'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File|null>(null);
  const [prefs, setPrefs] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string| null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setErr(null); setResp(null);
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('preferences', prefs);
    try {
      const r = await fetch('/api/upload', { method:'POST', body: fd });
      const text = await r.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setResp(data);
    } catch (e:any) {
      setErr(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-black text-white p-4 grid gap-4 max-w-md mx-auto">
      <header className="grid gap-1">
        <h1 className="text-xl font-semibold">NearMe</h1>
        <p className="text-sm opacity-70">Snap a photo and tell us what you want nearby—coffee, art, restrooms, and more.</p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-2">
          <span className="font-medium">Photo</span>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e)=> setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-white/20 p-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-medium">What are you looking for?</span>
          <textarea
            value={prefs}
            onChange={(e)=> setPrefs(e.target.value)}
            placeholder="e.g., Quiet coffee shops within a 10–15 minute walk. Clean public restrooms. Small art museums."
            className="min-h-28 rounded-lg border border-white/20 p-3 bg-transparent"
          />
        </label>

        <button
          disabled={loading || !file}
          className="rounded-xl bg-blue-500 py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {err && <div className="text-red-400 text-sm">Error: {err}</div>}
      {resp && (
        <section className="grid gap-2">
          <h2 className="font-semibold">Response</h2>
          <pre className="text-xs whitespace-pre-wrap rounded-lg border border-white/15 p-3 bg-white/5">
            {JSON.stringify(resp, null, 2)}
          </pre>
        </section>
      )}

      <footer className="text-xs opacity-60 mt-2">© {new Date().getFullYear()} NearMe</footer>
    </main>
  );
}

