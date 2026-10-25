import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/lead-schema';
import { checkCaptcha, deliverLead } from '@/lib/delivery';
import { getRedis, hash, rateLimit } from '@/lib/security';
export const runtime = 'nodejs';
const fail = (error:string,status:number) => NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request: NextRequest) {
  const configured = ['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','TURNSTILE_SECRET_KEY','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_HOSTNAMES','REDIS_URL'].every(key=>Boolean(process.env[key]));
  if (!configured || process.env.PRIVACY_READY!=='true') return fail('Приём заявок ещё не настроен. Пожалуйста, попробуйте позже.',503);
  if (process.env.NODE_ENV==='production' && [process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,process.env.TURNSTILE_SECRET_KEY].some(key=>/^[123]x0{8,}/.test(key || ''))) return fail('Проверка защиты не настроена.',503);
  if (request.headers.get('origin')!==request.nextUrl.origin && request.headers.get('origin')!==process.env.SITE_URL) return fail('Недопустимый источник запроса.',403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return fail('Ожидается JSON.',415);
  if (Number(request.headers.get('content-length') || 0)>16384) return fail('Слишком большой запрос.',413);
  try {
    // Global durable cap also applies when the direct client IP is unavailable.
    if (!await rateLimit('global',100,60)) return fail('Слишком много обращений. Попробуйте через минуту.',429);
    if (process.env.TRUST_PROXY==='true') {
      const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      if (!await rateLimit(hash(ip),5,600)) return fail('Слишком много попыток. Попробуйте через 10 минут.',429);
    }
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
    const redis=await getRedis();
    const idKey=`milkshake:lead:${lead.requestId}`;
    const prior=await redis.get(idKey);
    if (prior==='sent') return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
    if (prior) return fail('Предыдущая попытка обрабатывается или её доставка не подтверждена. Повторите позже.',409);
    if (!await checkCaptcha(lead.token)) return fail('Проверка защиты истекла или не пройдена. Повторите её.',400);
    if (!await redis.set(`milkshake:token:${hash(lead.token)}`,'used',{NX:true,EX:600})) return fail('Повторите проверку защиты.',400);
    if (!await redis.set(idKey,'pending',{NX:true,EX:86400})) return fail('Эта заявка уже обрабатывается.',409);
    try {
      await deliverLead(lead);
      await redis.set(idKey,'sent',{EX:86400});
    } catch {
      // Delivery can be ambiguous after a timeout: keep the lock to avoid duplicates.
      console.error('Lead delivery was not confirmed');
      return fail('Доставка не подтверждена. Данные сохранены в форме. Повторная отправка временно заблокирована, чтобы не создать дубликат.',502);
    }
    return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  } catch {
    console.error('Lead request could not be processed');
    return fail('Сервис временно недоступен. Данные остались в форме. Попробуйте позже.',503);
  }
}
