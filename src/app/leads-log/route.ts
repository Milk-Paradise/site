import { createHash, timingSafeEqual } from 'node:crypto';
import { readLeadLog } from '@/lib/lead-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const securityHeaders = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
};

function matches(left: string, right: string) {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(left), digest(right));
}

export async function GET(request: Request) {
  const password = process.env.LEAD_LOG_PASSWORD;
  if (!password || (process.env.NODE_ENV === 'production' && password.length < 12)) {
    return new Response('Просмотр журнала не настроен. Для публичного сайта задайте пароль не короче 12 символов.', {status:503,headers:securityHeaders});
  }
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Basic ') ? authorization.slice(6) : '';
  let credentials = '';
  try { credentials = Buffer.from(token, 'base64').toString('utf8'); } catch { /* Invalid credentials. */ }
  const separator = credentials.indexOf(':');
  const username = separator >= 0 ? credentials.slice(0, separator) : '';
  const supplied = separator >= 0 ? credentials.slice(separator + 1) : '';
  if (!matches(username, 'admin') || !matches(supplied, password)) {
    return new Response('Для просмотра журнала требуется пароль.', {status:401,headers:{...securityHeaders, 'WWW-Authenticate':'Basic realm="Milkshake", charset="UTF-8"'}});
  }
  try {
    const text = await readLeadLog();
    const escaped = text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
    return new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Журнал заявок — Milkshake</title><style>body{margin:0;background:#faf9f6;color:#2c1b0e;font:16px/1.6 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:40px 24px}h1{font-size:clamp(28px,5vw,44px);line-height:1.15}p{color:#62554b}pre{padding:20px;background:#fff;border:1px solid #e5d9cd;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 ui-monospace,monospace}</style><main><h1>Журнал заявок</h1><p>Каждая строка — одна сохранённая заявка. Время указано в UTC.</p><pre>${escaped || 'Заявок пока нет.'}</pre></main></html>`,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8'}});
  } catch {
    return new Response('Не удалось прочитать журнал.',{status:503,headers:securityHeaders});
  }
}
