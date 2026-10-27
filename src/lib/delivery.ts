import type { Lead } from './lead-schema';
import { projectLabels } from './lead-schema';

export async function deliverLead(lead: Lead) {
  // No parse_mode: user input is transmitted as plain text, never Telegram markup.
  const lines = ['Новая заявка — Milkshake Studio',`Имя: ${lead.name}`,`Тип сайта: ${projectLabels[lead.project]}`,`Бизнес: ${lead.business || '—'}`,`Способ связи: ${lead.method}`,`Контакт: ${lead.contact}`,`Описание задачи: ${lead.description || '—'}`,`Дополнительные функции: ${lead.features || '—'}`,`Желаемый срок: ${lead.deadline || '—'}`,`Время: ${new Date().toISOString()}`,`ID: ${lead.requestId}`];
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text:lines.join('\n'),link_preview_options:{is_disabled:true}}),
    signal:AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('DELIVERY_FAILED');
  const result = await response.json();
  if (result.ok!==true || !result.result?.message_id) throw new Error('DELIVERY_UNCONFIRMED');
}
