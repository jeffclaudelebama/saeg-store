import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountOrdersClient } from '@/components/AccountOrdersClient';

export default function AccountOrdersPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, je souhaite voir mes commandes.">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Mes commandes</h1>
          <p className="mt-2 text-slate-600">Historique et statut de vos commandes récentes.</p>
        </div>
        <AccountOrdersClient />
      </main>
    </MarketingScaffold>
  );
}
