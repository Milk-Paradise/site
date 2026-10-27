import type { Metadata } from 'next';
import '@/styles/base.css';
import '@/styles/pop.css';
import '@/styles/dark.css';
import '@/styles/polish.css';
import { themeBootScript } from '@/config/theme';
export const metadata: Metadata = {
  title: 'Milkshake Studio — сайты с характером',
  description: 'Лендинг с индивидуальным дизайном за 1 рабочий день — 15 000 ₽. Оплата после демо. Более сложные сайты — под вашу задачу.',
  robots: { index: false, follow: false },
  other: { 'format-detection': 'telephone=no' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" data-theme="pop" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootScript }}/></head><body>{children}</body></html>;
}
