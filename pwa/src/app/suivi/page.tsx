import { MarketingScaffold } from '@/components/MarketingScaffold';
import { TrackingPageClient } from '@/components/TrackingPageClient';

export default function TrackingPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je souhaite suivre ma commande.">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Suivi de commande</h1>
          <p className="mt-2 text-slate-600">Statuts: Reçue → Préparation → En route → Livrée</p>
        </div>
        <TrackingPageClient />
      </main>
    </MarketingScaffold>
  );
}
