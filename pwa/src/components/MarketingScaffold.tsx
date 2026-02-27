import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';

export function MarketingScaffold({ children, whatsappMessage }: { children: ReactNode; whatsappMessage?: string }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <FloatingWhatsAppButton message={whatsappMessage} />
    </>
  );
}
