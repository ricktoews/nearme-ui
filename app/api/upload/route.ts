export const runtime = 'nodejs'; // needed for file streaming
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const backendUrl = process.env.BACKEND_UPLOAD_URL || 'https://nearme.toews-api.com/upload';
    const res = await fetch(backendUrl, { method: 'POST', body: form }); // streams through
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' }});
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || 'Upload failed' }), { status: 500 });
  }
}
