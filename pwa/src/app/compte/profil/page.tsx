import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountProfileClient } from '@/components/AccountProfileClient';

export default function AccountProfilePage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je veux mettre à jour mon profil client.">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Mon compte</h1>
          <p className="mt-2 text-slate-600">Mettez à jour vos informations pour accélérer vos prochaines commandes.</p>
        </div>
        <AccountProfileClient />
      </main>
    </MarketingScaffold>
  );
}
