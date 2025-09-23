'use client';
import { useEffect, useState } from "react";

const sampleData = {
    "location": "Grand Place, Brussels",
    "description": "The Grand Place is the central square of Brussels, surrounded by opulent guildhalls and the Town Hall, characterized by its stunning Gothic architecture.",
    "places": [
        {
            "name": "Public Toilet by Grand Place",
            "walking_time": "5 minutes",
            "directions": "Head south on Rue de l'Étuve towards the Square de la Bourse. The public restroom is near the Square."
        },
        {
            "name": "McDonald's",
            "walking_time": "6 minutes",
            "directions": "Exit Grand Place and head towards Rue de la Bourse. McDonald's is located on the corner."
        },
        {
            "name": "Café de la Presse",
            "walking_time": "7 minutes",
            "directions": "Walk north-east from Grand Place along Rue des Chapeliers. The café includes restroom access."
        }
    ]
};

const samplePicture = 'blob:http://localhost:3000/5ea4fdab-f928-4029-be92-e378aa0089cf';

type Place = {
  name: string;
  approximate_walking_time?: string;
  walking_time?: string;
  directions?: string;
};

type LocateResponse = {
  location: string;
  description?: string;
  places?: Place[];
};

function minutesFromText(t?: string): number | undefined {
  if (!t) return;
  const m = t.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : undefined;
}

function mapsUrl(placeName: string, overallLocation?: string) {
  const q = overallLocation ? `${placeName}, ${overallLocation}` : placeName;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// 1) Keep parsed JSON as unknown
let data: unknown;

// 2) Type guard / helper
function getErrorMessage(d: unknown, r: Response): string {
  if (typeof d === 'object' && d !== null && 'error' in d) {
    const maybe = d as { error?: unknown };
    if (typeof maybe.error === 'string') return maybe.error;
  }
  return `HTTP ${r.status} ${r.statusText}`;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<LocateResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErr(null);
    setResp(null);

    const fd = new FormData();
    fd.append("photo", file);
    fd.append("preferences", prefs);

    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd }); // or your direct API URL
      const ct = r.headers.get("content-type") ?? "";
      let data: unknown;

      if (ct.includes("application/json")) {
        data = await r.json();
      } else {
        const raw = await r.text();
        try { data = JSON.parse(raw); } catch { data = { raw }; }
      }

      // 3) Use it instead of `(data as any)?.error`
      if (!r.ok) {
        throw new Error(getErrorMessage(data, r));
      }

      setResp(data as LocateResponse);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="min-h-dvh bg-black text-white p-4 grid gap-4 max-w-md mx-auto">
    {!resp ? (
      <>
        <header className="grid gap-1">
          <h1 className="text-xl font-semibold">NearMe</h1>
          <p className="text-sm opacity-70">
            Snap a photo and tell us what you want nearby—coffee, art, restrooms, and more.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-2">
            <span className="font-medium">Photo</span>

            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const f = e.currentTarget.files?.[0] ?? null;
                setFile(f);
                if (f) setPreview(URL.createObjectURL(f));
                else setPreview(null);
              }}
              className="sr-only"
            />

            <label
              htmlFor="photo"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (document.getElementById("photo") as HTMLInputElement)?.click();
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-4 py-3 font-semibold shadow
                         hover:bg-blue-600 active:translate-y-px cursor-pointer
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Choose Photo
            </label>

            <div className="text-sm opacity-70">
              {file ? `${file.name} • ${Math.ceil(file.size / 1024)} KB` : "No file selected"}
            </div>

            {preview && (
              <img
                src={preview}
                alt="Selected photo preview"
                className="mt-2 max-h-64 w-auto rounded-xl border border-white/10"
              />
            )}
          </label>

          <label className="grid gap-2">
            <span className="font-medium">What are you looking for?</span>
            <textarea
              value={prefs}
              onChange={(e) => setPrefs(e.currentTarget.value)}
              placeholder="e.g., Public restrooms within a 10–15 minute walk."
              className="min-h-28 rounded-lg border border-white/20 p-3 bg-transparent"
            />
          </label>

          <button
            disabled={loading || !file}
            className="rounded-xl bg-blue-500 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Uploading…" : "Find"}
          </button>

          {err && <div className="text-red-400 text-sm">Error: {err}</div>}
        </form>
      </>
    ) : (
// RESPONSE VIEW 
<section className="grid gap-4">
  {/* Top row: photo + “Found near” side by side */}
  <div className="grid grid-cols-[128px,1fr] gap-2 items-center min-w-0">
    <img
      src={preview ?? samplePicture}
      alt="Uploaded"
      className="w-32 h-32 rounded-xl object-cover border border-white/10 bg-white/5"
    />
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-xs uppercase tracking-wide opacity-70">Found near</div>
      <h2 className="text-lg font-semibold">{resp.location}</h2>
      {resp.description && (
        <p className="text-sm opacity-90 mt-1">{resp.description}</p>
      )}
    </div>
  </div>

  {/* User query (small) */}
  {prefs && (
    <p className="text-xs opacity-70">
      You asked for: <span className="opacity-100">{prefs}</span>
    </p>
  )}

  {/* Matches list */}
  {Array.isArray(resp.places) && resp.places.length > 0 && (
    <ul className="grid gap-2">
      {resp.places.map((p, i) => {
        const minutes =
          minutesFromText(p.approximate_walking_time) ??
          minutesFromText(p.walking_time);
        const timeText =
          minutes !== undefined
            ? `${minutes} min walk`
            : (p.approximate_walking_time || p.walking_time || "");
        const url = mapsUrl(p.name, resp.location);

        return (
          <li
  key={i}
  className="grid grid-cols-[1fr,4.5rem,4.5rem] items-start gap-3 rounded-xl border border-white/10 odd:bg-white/5 even:bg-white/10 p-2"
>
  {/* Left: place info */}
  <div>
    <div className="text-base font-medium">{p.name}</div>
    {timeText && (
      <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full border border-white/15">
        {timeText}
      </span>
    )}
    {p.directions && (
      <p className="text-sm opacity-90 mt-2">{p.directions}</p>
    )}
  </div>

  {/* Middle: Open in Maps — fixed width + right aligned */}
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="justify-self-end w-16 text-center rounded-lg px-1 py-2 text-xs font-semibold bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
    aria-label={`Open ${p.name} in Google Maps`}
  >
    Map
  </a>

  {/* Right: Share/Copy — fixed width + right aligned */}
  <button
    type="button"
    onClick={async () => {
      const txt = `${p.name}\n${p.directions ?? ""}\n${url}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: p.name, text: p.directions, url });
        } else {
          await navigator.clipboard.writeText(txt);
          alert("Copied to clipboard");
        }
      } catch {
        /* user dismissed; ignore */
      }
    }}
    className="justify-self-end w-16 rounded-lg px-1 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-center whitespace-nowrap"
  >
    Share
  </button>
</li>
        );
      })}
    </ul>
  )}

  {/* Action row */}
  <div className="pt-2">
    <button
      type="button"
      onClick={() => {
        setResp(null);
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        // keep prefs so the user can tweak; clear if you prefer:
        // setPrefs("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="text-sm opacity-80 underline cursor-pointer"
    >
      Try another photo
    </button>
  </div>
</section>

    )}

      <footer className="text-xs opacity-60 mt-2">
        © {new Date().getFullYear()} NearMe
      </footer>
    </main>
  );

}

