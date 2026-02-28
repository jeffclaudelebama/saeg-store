import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountLookupClient } from '@/components/AccountLookupClient';

export default function AccountPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, je veux accéder à mon compte client.">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Compte client</h1>
          <p className="mt-2 text-slate-600">Accès rapide à vos commandes SAEG via téléphone.</p>
        </div>
        <AccountLookupClient />
      </main>
    </MarketingScaffold>
  );
}
