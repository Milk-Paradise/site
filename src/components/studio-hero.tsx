import { landingPrice, rub } from '@/config/pricing';

export function StudioHero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-media" aria-hidden="true"/>
    <div className="hero-shade" aria-hidden="true"/>
    <div className="eyebrow"><span className="hero-status"/> MILKSHAKE STUDIO / DIGITAL CRAFT <span className="index">ДИЗАЙН. РАЗРАБОТКА. ВАШ ХАРАКТЕР.</span></div>
    <h1 id="hero-title"><span className="hero-opening">Твоему бизнесу<br/>нужен сайт<span className="pink-dot">.</span></span><span className="quiet">Не через месяц.</span><span className="tomorrow">Завтра<span className="period">.</span></span></h1>
    <div className="hero-art-caption" aria-hidden="true"><span>ФОРМА / СМЫСЛ / ХАРАКТЕР</span><span>01—02</span></div>
    <div className="intro"><p>Сайты с характером.<br/>Для бизнеса, который вы любите.</p><p className="description">Индивидуальный дизайн, тексты и адаптив.<br/>Лендинг за один рабочий день.<br/>Сложные проекты — под вашу задачу.</p><a className="text-link" href="#services">Посмотреть услуги <span aria-hidden="true">↗</span></a></div>
    <div className="offer"><div className="price-label">ЛЕНДИНГ ПОД КЛЮЧ</div><div className="price">{rub(landingPrice)}</div><a className="primary" href="#contact">Заказать сайт <span aria-hidden="true">↗</span></a><p className="fine">Сначала показываем. Потом — оплата.</p></div>
    <div className="hero-wordmark" aria-hidden="true">milkshake<span>.</span></div>
    <div className="hero-foot"><p className="hero-note">Один рабочий день — для простого лендинга после согласования задачи и получения материалов. Домен, хостинг и поддержка — отдельно.</p><span>САЙТЫ ДЛЯ МАЛОГО БИЗНЕСА <span aria-hidden="true">↓</span></span></div>
  </section>;
}
