import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/lead-schema';
import { deliverLead } from '@/lib/delivery';
import { appendLead } from '@/lib/lead-log';
export const runtime = 'nodejs';
const fail = (error:string,status:number) => NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request: NextRequest) {
  const configured = ['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'].every(key=>Boolean(process.env[key]));
  if (!configured || process.env.PRIVACY_READY!=='true') return fail('Приём заявок ещё не настроен. Пожалуйста, попробуйте позже.',503);
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || '';
  // Next.js may normalize 127.0.0.1 to localhost internally in development.
  const localOrigin = process.env.NODE_ENV === 'development' && /^(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/.test(host) && origin === `http://${host}`;
  if (origin!==request.nextUrl.origin && origin!==process.env.SITE_URL && !localOrigin) return fail('Недопустимый источник запроса.',403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail('Ожидается JSON.',415);
  if (Number(request.headers.get('content-length') || 0)>16384) return fail('Слишком большой запрос.',413);
  try {
    // Bound streamed bodies even if Content-Length is absent or misleading.
    const reader=request.body?.getReader();
    if (!reader) return fail('Пустой запрос.',400);
    const chunks: Uint8Array[]=[];let bytes=0;
    for (;;) {const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16384){await reader.cancel();return fail('Слишком большой запрос.',413);}chunks.push(value);}
    const raw=Buffer.concat(chunks).toString('utf8');
    let json:unknown;try {json=JSON.parse(raw);}catch{return fail('Некорректный JSON.',400);}
    const parsed=leadSchema.safeParse(json);
    if (!parsed.success) return fail('Проверьте обязательные поля, контакт и согласие.',400);
    const lead=parsed.data;
    if (lead.website) return fail('Проверка защиты не пройдена.',400);
    try { await appendLead(lead); }
    catch { console.error('Lead log could not be saved'); return fail('Сервис временно недоступен. Данные остались в форме. Попробуйте позже.',503); }
    try {
      await deliverLead(lead);
    } catch {
      console.error('Lead delivery was not confirmed');
      return fail('Доставка не подтверждена. Данные остались в форме. Заявка могла быть доставлена; повторная отправка может создать дубликат.',502);
    }
    return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  } catch {
    console.error('Lead request could not be processed');
    return fail('Сервис временно недоступен. Данные остались в форме. Попробуйте позже.',503);
  }
}
