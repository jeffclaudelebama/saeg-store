import { MarketingScaffold } from '@/components/MarketingScaffold';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiStates';

export default function StatesPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, j’ai un problème sur l’application.">
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-black text-primary">États UI (loading / empty / error)</h1>
        <LoadingState label="Chargement des offres du jour..." />
        <EmptyState title="Aucun produit aujourd’hui" description="Revenez plus tard pour les nouveaux invendus du marché éphémère." />
        <ErrorState title="Erreur réseau" description="Impossible de récupérer les produits. Vérifiez votre connexion ou réessayez." />
      </main>
    </MarketingScaffold>
  );
}
