import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided.' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/auth/google/callback';

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to exchange code', details: data });
    }

    if (!data.refresh_token) {
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; padding: 2rem;">
            <h2>Google didn't provide a refresh token!</h2>
            <p>This usually happens if you've already granted permission before.</p>
            <p>Go to <a href="https://myaccount.google.com/permissions" target="_blank">Google Permissions</a>, remove the app, and try logging in again to force a new refresh token.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem; line-height: 1.6;">
          <h2 style="color: green;">Success!</h2>
          <p>Here is your permanent Refresh Token. Copy this and paste it into your <code>.env.local</code> file:</p>
          <div style="background: #f4f4f4; padding: 1rem; border-radius: 8px; font-family: monospace; word-break: break-all; margin-bottom: 2rem;">
            GOOGLE_REFRESH_TOKEN=${data.refresh_token}
          </div>
          <p>You can now close this tab, restart your <code>npm run dev</code> server, and test creating a class!</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
