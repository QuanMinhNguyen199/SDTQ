import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/manrope';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '../src/styles.css';

export const metadata: Metadata = { title:'Sơ đồ tổ chức · THEHEGEO', description:'Khám phá cơ cấu tổ chức đa cấp qua sơ đồ và Journey mode.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>;
}
