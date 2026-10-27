import Link from 'next/link';
import { included, steps, faqs } from '@/config/content';
import { landingPrice, rub, services } from '@/config/pricing';
import { LeadForm } from '@/components/lead-form';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { MobileNavigation } from '@/components/mobile-navigation';
import { StudioHero } from '@/components/studio-hero';
export const dynamic = 'force-dynamic';

const niches = [
  {name:'Кофейня', desc:'Уют начинается с первого клика.', cls:'coffee', art:'coffee', label:'МЕНЮ / АТМОСФЕРА / БРОНЬ'},
  {name:'Цветочная студия', desc:'Для самых важных «просто так».', cls:'flowers', art:'flower', label:'БУКЕТЫ / ДОСТАВКА / КАТАЛОГ'},
  {name:'Барбершоп', desc:'Характер виден в деталях.', cls:'barber', art:'lines', label:'УСЛУГИ / МАСТЕРА / ЗАПИСЬ'},
  {name:'Пекарня', desc:'Свежий взгляд на любимое дело.', cls:'bakery', art:'bread', label:'АССОРТИМЕНТ / АДРЕС / ЗАКАЗ'},
];

function Flower({className = ''}:{className?:string}) {return <svg className={className} viewBox="0 0 200 200" fill="currentColor" aria-hidden="true"><path d="M100 0 115 52 150 13 148 67 187 50 165 93 200 100 160 117 187 150 138 146 150 187 112 160 100 200 85 151 50 187 53 137 13 150 37 110 0 100 43 83 13 50 65 55 50 13 87 41Z"/></svg>}
function Arrow() {return <span aria-hidden="true">↗</span>}
export default function Home() {
  const formReady = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID && process.env.PRIVACY_READY === 'true');
  return <>
    <a className="skip-link" href="#main">Перейти к содержимому</a>
    <header id="top" className="header wrap"><Link className="logo" href="/" aria-label="Milkshake Studio, начало">milkshake<span>.</span></Link><nav aria-label="Основная навигация"><a href="#services">Услуги</a><a href="#advantages">Подход</a><a href="#process">Процесс</a><a href="#pricing">Цены</a><a href="#faq">FAQ</a></nav><ThemeSwitcher/><a className="header-cta" href="#contact">Обсудить сайт <Arrow/></a><MobileNavigation/></header>
    <main id="main">
      <StudioHero/>
      <div className="ticker"><div><span>ИНДИВИДУАЛЬНЫЙ ДИЗАЙН</span><Flower/><span>ОПЛАТА ПОСЛЕ ДЕМО</span><Flower/><span>УДОБНО НА СМАРТФОНЕ</span><Flower/><span>ОТ ОДНОГО РАБОЧЕГО ДНЯ</span><Flower/></div></div>

      <section className="section wrap" id="services"><div className="section-label">01 / САЙТ ПОД ВАШ ХАРАКТЕР</div><div className="section-heading"><h2>Маленький бизнес.<br/><span>Большой характер.</span></h2><p>Вы вкладываете душу в своё дело.<br/>Мы поможем рассказать о нём в интернете — красиво, понятно и по делу.</p></div>
        <div className="niche-grid">{niches.map((n,i)=><article className={`niche ${n.cls}`} key={n.name}><div className="niche-top"><span>0{i+1} / ВОЗМОЖНОЕ НАПРАВЛЕНИЕ</span><Arrow/></div><div className={`niche-art ${n.art}`} aria-hidden="true">{n.art==='coffee'?<><div className="cup"/><div className="saucer"/></>:n.art==='flower'?<><Flower/><div className="stem"/></>:n.art==='lines'?<><b>Б</b><div className="barber-stripes"/></>:<><div className="loaf"><i/><i/><i/></div></>}</div><h3>{n.name}</h3><p>{n.desc}</p><div className="niche-label">{n.label}</div></article>)}</div>
        <div className="niche-foot"><p>Это примеры того, каким может быть сайт для вашего бизнеса, а не выполненные проекты.</p><span>А ещё: салоны красоты, кейтеринг, автосервисы,<br/>мастерские, частные специалисты и местные услуги.</span></div>
      </section>

      <section className="why-section" id="advantages"><div className="wrap why-layout"><div><div className="section-label">02 / ПОЧЕМУ MILKSHAKE</div><h2>Смешиваем{' '}<br/>красивое{' '}<br/>с полезным<span className="orange">.</span></h2><div className="mix-art" aria-hidden="true"><Flower/><div>дизайн<br/><b>+</b><br/>смысл</div></div></div><div className="benefit-list">{[
        ['Быстро, без бесконечных согласований','Согласуем задачу и материалы, затем покажем работающий сайт. Общаетесь напрямую с разработчиком.'],
        ['Ваш бизнес, ваш дизайн','Структура и визуальный характер под вашу задачу. Удобно посетителю, узнаваемо для вас.'],
        ['Тексты тоже поможем собрать','Не нужно приходить с готовым маркетинговым отделом. Поможем объяснить услуги и подобрать изображения.'],
        ['Понятно сегодня. Можно расширить завтра.','Прозрачный объём работ и стоимость. Начните с лендинга, а каталог, страницы или интеграции добавьте позже.'],
      ].map(([title,text],i)=><article key={title}><span className="benefit-index">0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

      <section className="section wrap" id="process"><div className="section-label">03 / ОТ ИДЕИ ДО ПЕРВОГО КЛИКА</div><div className="section-heading"><h2>Всё по-человечески.<br/><span>В пять шагов.</span></h2><p>Вы занимаетесь бизнесом.<br/>Мы занимаемся вашим сайтом.</p></div><ol className="process-list">{steps.map(([title,text],i)=><li key={title}><span className="step-number">0{i+1}</span><h3>{title}</h3><p>{text}</p><span className="step-arrow" aria-hidden="true">↗</span></li>)}</ol><p className="section-note">Один рабочий день — для стандартного лендинга после получения материалов и согласования старта. Сложные проекты рассчитываем отдельно.</p></section>

      <section className="pricing-section" id="pricing"><div className="wrap"><div className="section-label">04 / СТОИМОСТЬ БЕЗ СЮРПРИЗОВ</div><div className="pricing-main"><div className="pricing-title"><span className="pill">ХОРОШЕЕ НАЧАЛО</span><h2>Ваш сайт.{' '}<br/>Под ключ.</h2><p>Одна страница. Всё важное о бизнесе.<br/>И понятный путь к заявке.</p><Flower className="pricing-flower"/></div><div className="pricing-details"><div className="large-price">{rub(landingPrice)}</div><p className="pricing-subtitle">Лендинг с индивидуальным дизайном</p><ul className="included">{included.map(item=><li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul><a href="#contact" className="primary">Обсудить лендинг <Arrow/></a><p className="fine">Оплата после демонстрации, до публикации и передачи материалов.</p></div></div><p className="pricing-note">Домен, хостинг, платные сервисы и дополнительные функции оплачиваются отдельно. Поддержка не входит в стоимость разовой разработки.</p></div></section>

      <section className="section wrap" id="extras"><div className="section-label">05 / МЕСТО ДЛЯ РОСТА</div><div className="section-heading"><h2>Больше, чем<br/>одна страница<span className="orange">?</span></h2><p>От каталога до своего инструмента управления.<br/>Добавим то, что нужно именно вашему бизнесу.</p></div><div className="service-table">{services.map((service,i)=><div className="service-row" key={service.title}><span className="service-index">0{i+1}</span><div><h3>{service.title}</h3><p>{service.note}</p></div><div className="service-price">{service.price ? `от ${rub(service.price)}`:'После оценки'}<span>{service.unit}</span></div><a href="#contact" aria-label={`Обсудить: ${service.title}`} className="service-link"><Arrow/></a></div>)}</div><p className="section-note">Цены «от» — стартовые. Итоговая стоимость и сроки зависят от задачи и согласуются до начала работ. Поддержка не включает новые страницы, функции, редизайн и постоянное наполнение.</p>
      <div className="admin-demo"><div><span className="section-label">ВОЗМОЖНОСТЬ ДЛЯ ВАШЕГО САЙТА</span><h3>Обновляйте сайт.<br/>Без программиста.</h3><p>Добавляйте товары, меняйте фотографии, описания и цены в понятной панели управления.</p><span className="demo-note">Иллюстрация интерфейса, не работающая админка.</span></div><div className="admin-window" aria-label="Иллюстрация панели управления"><div className="window-bar"><i/><i/><i/><span>Ваш каталог</span></div><div className="admin-window-inner"><div className="flex justify-between items-center gap-3"><strong>Товары</strong><span className="mock-add">+ Добавить</span></div>{['Ваш товар', 'Ещё один товар', 'Новая коллекция'].map((name,i)=><div className="mock-row" key={name}><span className={`mock-thumb thumb-${i}`} aria-hidden="true"/><div>{name}<small>Опубликован</small></div><span className="mock-edit">Изменить · Удалить</span></div>)}</div></div></div>
      </section>

      <section className="start-small"><div className="wrap"><span className="section-label">НАЧНИТЕ С ГЛАВНОГО</span><h2>Сначала — сайт.<br/>Дальше — ваши планы.</h2><div className="start-bottom"><p>Представьте услуги, разместите меню или прайс, собирайте обращения и проверяйте интерес к предложению. Лендинг — удобная точка старта для местной аудитории и рекламы.</p><a href="#contact" className="round-link" aria-label="Перейти к заявке"><Arrow/></a></div><p className="start-note">Сайт помогает общаться с клиентами. Результаты рекламы и продажи зависят от многих факторов.</p></div></section>

      <section className="section wrap faq-section" id="faq"><div><div className="section-label">06 / ВОПРОСЫ БЕЗ СТЕСНЕНИЯ</div><h2>А если<span className="orange">…</span></h2><p className="muted">Всё, что полезно знать до старта.</p></div><div className="faq-list">{faqs.map(([question,answer])=><details key={question}><summary>{question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className="contact-section" id="contact"><div className="wrap contact-layout"><div><div className="section-label">07 / ДАВАЙТЕ ЗНАКОМИТЬСЯ</div><h2>Что будем<br/>создавать<span>?</span></h2><p>Расскажите о своём деле.<br/>Обсудим задачу, сроки и подходящий формат сайта.</p><Flower className="contact-flower"/><div className="contact-caption">ВАШ БИЗНЕС + НАШ ДИЗАЙН = <b>↗</b></div></div><LeadForm enabled={formReady}/></div></section>
    </main>
    <footer className="wrap footer"><Link className="logo" href="/">milkshake<span>.</span></Link><span>Сайты с характером. Сделано с вниманием.</span><Link href="/privacy">Персональные данные</Link><a href="#top" aria-label="Наверх">↑</a></footer>
  </>;
}
