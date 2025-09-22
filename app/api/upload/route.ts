/*
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const backendUrl =
    process.env.BACKEND_UPLOAD_URL ?? 'https://nearme.toews-api.com/upload';
  console.log('====> route.ts backendUrl', backendUrl);
  const res = await fetch(backendUrl, { method: 'POST', body: form });
  const contentType = res.headers.get('content-type') ?? 'application/json';
  const bodyText = await res.text();

  return new Response(bodyText, {
    status: res.status,
    headers: { 'content-type': contentType },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    headers: { 'content-type': 'application/json' },
  });
}

*/