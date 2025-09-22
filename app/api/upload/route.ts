export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  try {
    const form = await req.formData();
    const backendUrl =
      process.env.BACKEND_UPLOAD_URL ?? 'https://nearme.toews-api.com/upload';

    const res = await fetch(backendUrl, { method: 'POST', body: form });
    const contentType = res.headers.get('content-type') ?? 'application/json';
    const bodyText = await res.text();

    return new Response(bodyText, {
      status: res.status,
      headers: { 'content-type': contentType },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

