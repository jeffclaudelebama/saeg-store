import { CartPageClient } from '@/components/CartPageClient';
import { MarketingScaffold } from '@/components/MarketingScaffold';

export default function CartPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, voici mon panier. Pouvez-vous m’aider à finaliser ?">
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <nav className="flex gap-2 text-sm text-slate-500 mb-4">
            <span>Accueil</span>
            <span>/</span>
            <span className="font-semibold text-primary">Mon Panier</span>
          </nav>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">Votre Panier d'Achats</h1>
        </div>
        <CartPageClient />
      </main>
    </MarketingScaffold>
  );
}
