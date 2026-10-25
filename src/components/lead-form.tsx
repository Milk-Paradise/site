'use client';

import { useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

declare global { interface Window { turnstile?: { render: (container: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void }; } }

export function LeadForm({ enabled, siteKey }: { enabled: boolean; siteKey: string }) {
  const [method, setMethod] = useState('telegram');
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const requestId = useRef<string | null>(null);

  function initCaptcha() {
    if (!widget.current || !window.turnstile || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(widget.current, {
      sitekey: siteKey, action: 'lead', theme: 'light', size: 'flexible',
      callback: (value: string) => setToken(value),
      'expired-callback': () => setToken(''),
      'error-callback': () => {setToken(''); setMessage('Проверка защиты не загрузилась. Обновите её или попробуйте позже.');},
    });
  }
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || status==='sending' || status==='success') return;
    if (!token) {setMessage('Пожалуйста, завершите проверку защиты.'); return;}
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    requestId.current ??= crypto.randomUUID();
    setStatus('sending'); setMessage('');
    try {
      const response = await fetch('/api/leads', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...fields, consent:fields.consent==='on', token, requestId:requestId.current}), signal:AbortSignal.timeout(25000)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      setStatus('success'); setMessage('Заявка доставлена. Спасибо! Свяжемся с вами выбранным способом.');
      form.reset(); requestId.current = null;
    } catch (error) {setStatus('error');setMessage(error instanceof Error ? error.message : 'Ошибка связи. Данные остались в форме.');}
    finally {setToken(''); if(widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);}
  }
  return <form className="lead-form" onSubmit={submit} aria-label="Заявка на сайт">
    {!enabled && <div className="form-notice" role="status"><strong>Форма готовится к запуску</strong><span>Пока можно посмотреть и заполнить поля. Отправка станет доступна после подключения Telegram, защиты от спама и политики обработки данных.</span></div>}
    <div className="form-grid"><label>Как вас зовут<input name="name" placeholder="Ваше имя" autoComplete="given-name" required minLength={2} maxLength={80}/></label><label>Как удобнее связаться<select name="method" value={method} onChange={e=>setMethod(e.target.value)}><option value="telegram">Telegram</option><option value="email">Email</option><option value="phone">Телефон</option></select></label></div>
    <label>{method==='telegram'?'Ваш Telegram':method==='email'?'Ваша почта':'Ваш телефон'}<input key={method} name="contact" type={method==='email'?'email':method==='phone'?'tel':'text'} placeholder={method==='telegram'?'@username':method==='email'?'you@example.com':'+7 999 123-45-67'} autoComplete={method==='email'?'email':method==='phone'?'tel':'off'} required maxLength={160} pattern={method==='telegram'?'@?[A-Za-z][A-Za-z0-9_]{4,31}':method==='phone'?'[+0-9() \u002D]{10,25}':undefined}/></label>
    <label>Какой сайт нужен<select name="project"><option value="landing">Лендинг</option><option value="multipage">Многостраничный сайт</option><option value="catalog">Каталог</option><option value="admin">Сайт с админкой</option><option value="other">Другое / пока не знаю</option></select></label>
    <label>Пара слов о задаче <span className="optional">необязательно</span><textarea name="description" placeholder="Чем занимаетесь и какой сайт представляете?" rows={3} maxLength={2000}/></label>
    <details className="form-more"><summary>Добавить подробности <span aria-hidden="true">+</span></summary><label>Название бизнеса<input name="business" maxLength={120} placeholder="Как называется ваше дело"/></label><label>Желаемые сроки<input name="deadline" maxLength={120} placeholder="Когда хотите запустить сайт"/></label><label>Дополнительные функции<input name="features" maxLength={500} placeholder="Каталог, запись, интеграции…"/></label></details>
    <div className="honeypot" aria-hidden="true"><label>Не заполняйте это поле<input name="website" tabIndex={-1} autoComplete="off" maxLength={200}/></label></div>
    {enabled && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={initCaptcha}/><div ref={widget} className="captcha"/></>}
    <label className="consent"><input name="consent" type="checkbox" required/><span>Согласен на обработку персональных данных для ответа на заявку. <Link href="/privacy">Условия обработки</Link></span></label>
    <button className="primary" disabled={!enabled || !token || status==='sending' || status==='success'} type="submit">{!enabled?'Отправка пока недоступна':status==='sending'?'Отправляем…':status==='success'?'Заявка доставлена':'Обсудить мой сайт'}<span aria-hidden="true">↗</span></button>
    <p className={`form-result ${status==='error'?'is-error':''}`} role="status" aria-live="polite">{message || 'Без обязательств. Сначала познакомимся и обсудим задачу.'}</p>
  </form>;
}
