'use client';

import { useRef } from 'react';

export function MobileNavigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  return <details className="mobile-menu" ref={menu}>
    <summary aria-label="Открыть навигацию"><span/><span/></summary>
    <nav aria-label="Мобильная навигация" onClick={(event) => {
      if ((event.target as HTMLElement).closest('a')) menu.current?.removeAttribute('open');
    }}>
      <a href="#services">Услуги</a><a href="#advantages">Преимущества</a><a href="#process">Процесс</a><a href="#pricing">Цены</a><a href="#faq">FAQ</a><a href="#contact">Заявка</a>
    </nav>
  </details>;
}
