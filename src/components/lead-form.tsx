'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { FormSelect } from './form-select';

const methods = [{value:'telegram',label:'Telegram'},{value:'email',label:'Email'},{value:'phone',label:'Телефон'}] as const;
const projects = [{value:'landing',label:'Лендинг'},{value:'multipage',label:'Многостраничный сайт'},{value:'catalog',label:'Каталог'},{value:'admin',label:'Сайт с админкой'},{value:'other',label:'Другое / пока не знаю'}] as const;

export function LeadForm({ enabled }: { enabled: boolean }) {
  const [method, setMethod] = useState('telegram');
  const [project, setProject] = useState('landing');
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');
  const requestId = useRef<string | null>(null);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || status==='sending' || status==='success') return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    requestId.current ??= crypto.randomUUID();
    setStatus('sending'); setMessage('');
    try {
      const response = await fetch('/api/leads', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...fields, consent:fields.consent==='on', requestId:requestId.current}), signal:AbortSignal.timeout(25000)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      setStatus('success'); setMessage('Заявка доставлена. Спасибо! Свяжемся с вами выбранным способом.');
      form.reset(); requestId.current = null;
    } catch (error) {setStatus('error');setMessage(error instanceof Error ? error.message : 'Ошибка связи. Данные остались в форме.');}
  }
  return <form className="lead-form" onSubmit={submit} aria-label="Заявка на сайт">
    {!enabled && <div className="form-notice" role="status"><strong>Форма готовится к запуску</strong><span>Отправка станет доступна после завершения настройки сайта.</span></div>}
    <div className="form-grid"><label>Как вас зовут<input name="name" placeholder="Ваше имя" autoComplete="given-name" required minLength={2} maxLength={80}/></label><FormSelect name="method" label="Как удобнее связаться" value={method} choices={methods} onChange={setMethod}/></div>
    <label>{method==='telegram'?'Ваш Telegram':method==='email'?'Ваша почта':'Ваш телефон'}<input key={method} name="contact" type={method==='email'?'email':method==='phone'?'tel':'text'} placeholder={method==='telegram'?'@username':method==='email'?'you@example.com':'+7 999 123-45-67'} autoComplete={method==='email'?'email':method==='phone'?'tel':'off'} required maxLength={160} pattern={method==='telegram'?'@?[A-Za-z][A-Za-z0-9_]{4,31}':method==='phone'?'[+0-9() \u002D]{10,25}':undefined}/></label>
    <FormSelect name="project" label="Какой сайт нужен" value={project} choices={projects} onChange={setProject}/>
    <label>Пара слов о задаче <span className="optional">необязательно</span><textarea name="description" placeholder="Чем занимаетесь и какой сайт представляете?" rows={3} maxLength={2000}/></label>
    <details className="form-more"><summary>Добавить подробности <span aria-hidden="true">+</span></summary><label>Название бизнеса<input name="business" maxLength={120} placeholder="Как называется ваше дело"/></label><label>Желаемые сроки<input name="deadline" maxLength={120} placeholder="Когда хотите запустить сайт"/></label><label>Дополнительные функции<input name="features" maxLength={500} placeholder="Каталог, запись, интеграции…"/></label></details>
    <div className="honeypot" aria-hidden="true"><label>Не заполняйте это поле<input name="website" tabIndex={-1} autoComplete="off" maxLength={200}/></label></div>
    <label className="consent"><input name="consent" type="checkbox" required/><span>Согласен на обработку указанных в заявке персональных данных для ответа на моё обращение, включая передачу заявки через Telegram. <Link href="/privacy">Политика обработки данных</Link></span></label>
    <button className="primary" disabled={!enabled || status==='sending' || status==='success'} type="submit">{!enabled?'Отправка пока недоступна':status==='sending'?'Отправляем…':status==='success'?'Заявка доставлена':'Обсудить мой сайт'}<span aria-hidden="true">↗</span></button>
    <p className={`form-result ${status==='error'?'is-error':''}`} role="status" aria-live="polite">{message || 'Без обязательств. Сначала познакомимся и обсудим задачу.'}</p>
  </form>;
}
