import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountOrderDetailClient } from '@/components/AccountOrderDetailClient';

export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, je consulte le détail de ma commande.">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <AccountOrderDetailClient orderId={params.id} />
      </main>
    </MarketingScaffold>
  );
}
