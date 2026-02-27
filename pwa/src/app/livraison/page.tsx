import { MarketingScaffold } from '@/components/MarketingScaffold';

export default function LivraisonPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, j’ai une question sur la livraison ou le retrait.">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16 text-center px-2">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">Livraison & Retrait</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Service logistique local rapide et flexible pour les commandes SAEG. Zones couvertes: Libreville, Akanda, Owendo.</p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary">
            <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl">local_shipping</span></div>
            <h2 className="text-2xl font-bold mb-4">Livraison à domicile</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">Livraison locale en créneau matin ou après-midi avec suivi de statut de commande.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Libreville : 1 500 FCFA</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Akanda : 2 000 FCFA</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Owendo : 2 500 FCFA</span></li>
            </ul>
            <a className="w-full inline-flex justify-center bg-primary text-white py-3 font-bold rounded hover:bg-primary/90 transition-colors" href="/catalogue">Commander maintenant</a>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-accent">
            <div className="bg-accent/20 w-16 h-16 rounded-lg flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary text-4xl">storefront</span></div>
            <h2 className="text-2xl font-bold mb-4">Retrait en point SAEG</h2>
            <div className="inline-block bg-accent text-primary px-3 py-1 text-xs font-black uppercase tracking-wider mb-4 rounded">SERVICE GRATUIT</div>
            <p className="text-slate-600 mb-6 leading-relaxed">Économisez les frais de livraison avec le Click & Collect. Disponible dès confirmation de préparation.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Retrait sécurisé au point SAEG</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Créneaux matin / après-midi</span></li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>0 FCFA</span></li>
            </ul>
            <a className="w-full inline-flex justify-center border-2 border-primary text-primary py-3 font-bold rounded hover:bg-primary/5 transition-colors" href="/checkout?mode=pickup">Choisir retrait</a>
          </div>
        </div>

        <section className="bg-primary/5 rounded-2xl p-8 md:p-12 mb-20 border border-primary/10 overflow-hidden relative mx-2">
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-primary mb-6">Zones desservies</h2>
              <p className="text-slate-700 mb-8 leading-relaxed">La livraison SAEG couvre actuellement les principales zones urbaines de l’Estuaire.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  ['Libreville', 'Tous arrondissements'],
                  ['Akanda', 'Angondjé, Avorbam, etc.'],
                  ['Owendo', 'Port et environs'],
                ].map(([title, text]) => (
                  <div key={title} className="bg-white p-6 rounded shadow-sm border-l-4 border-primary">
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full rounded-xl overflow-hidden shadow-2xl relative h-[250px] md:h-[400px] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="text-xs font-bold text-primary">ZONE DE COUVERTURE ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingScaffold>
  );
}
