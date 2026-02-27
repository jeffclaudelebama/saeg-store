import { MarketingScaffold } from '@/components/MarketingScaffold';
import { SAEG_PHONE } from '@/lib/constants';

export default function FaqPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, j’ai une question FAQ.">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tight">Foire Aux Questions</h1>
          <p className="text-slate-600 max-w-xl mx-auto">Tout ce que vous devez savoir sur les invendus SAEG, la vente au kilo et la livraison locale.</p>
        </div>

        <div className="flex flex-wrap justify-center mb-10 border-b border-primary/10 pb-6 gap-3" id="category-filters">
          <button className="px-6 py-2 bg-primary text-white font-bold rounded shadow-sm">Commandes</button>
          <button className="px-6 py-2 hover:bg-primary/10 text-primary font-medium rounded transition-colors">Paiement</button>
          <button className="px-6 py-2 hover:bg-primary/10 text-primary font-medium rounded transition-colors">Livraison</button>
          <button className="px-6 py-2 hover:bg-primary/10 text-primary font-medium rounded transition-colors">Produits</button>
        </div>

        <div className="space-y-4">
          {[
            ['Comment commander au kilo ?', 'Sur la fiche produit, choisissez le poids (pas de 0,25 kg), puis ajoutez au panier. Le total est recalculé en temps réel.'],
            ['Quels sont les jours de livraison ?', 'Préparation locale selon arrivage et créneau choisi (matin / après-midi), avec couverture Libreville, Akanda et Owendo.'],
            ['Puis-je modifier ma commande ?', 'Oui, contactez-nous rapidement via WhatsApp ou téléphone avant le passage de la commande en préparation.'],
            ['D’où proviennent vos produits ?', 'Des invendus des marchés éphémères SAEG et de producteurs partenaires locaux.'],
          ].map(([q, a], idx) => (
            <details key={q} className="group bg-white border border-primary/10 rounded-lg overflow-hidden transition-all shadow-sm" open={idx === 0}>
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-primary/5 transition-colors min-h-[64px]">
                <span className="font-semibold text-primary text-base">{q}</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-primary/5 pt-4 text-sm">{a}</div>
            </details>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-xl text-center px-6 py-8">
          <h3 className="font-bold text-primary mb-3 text-xl">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">Notre équipe est disponible pour vous aider via téléphone ou WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2" href="/contact">
              <span className="material-symbols-outlined">mail</span> Nous contacter
            </a>
            <a className="bg-white text-primary border border-primary/20 px-8 py-3 rounded-lg font-bold hover:bg-primary/5 transition-all flex items-center gap-2" href={`tel:${SAEG_PHONE}`}>
              <span className="material-symbols-outlined">call</span> {SAEG_PHONE}
            </a>
          </div>
        </div>
      </main>
    </MarketingScaffold>
  );
}
