/**
 * Obtain a short-lived Google OAuth2 access token via Refresh Token flow.
 */
export async function getGoogleAccessToken(scopes?: string[]): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth environment variables (Client ID, Secret, or Refresh Token)');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google OAuth refresh error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}
