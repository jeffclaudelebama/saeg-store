import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountHomeClient } from '@/components/AccountHomeClient';

export default function AccountPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je veux accéder à mon compte client.">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Compte client</h1>
          <p className="mt-2 text-slate-600">Connexion sécurisée par OTP et accès persistant à votre profil et vos commandes.</p>
        </div>
        <AccountHomeClient />
      </main>
    </MarketingScaffold>
  );
}
