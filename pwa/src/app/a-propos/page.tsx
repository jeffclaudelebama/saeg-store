import { MarketingScaffold } from '@/components/MarketingScaffold';
import { SAEG_EMAIL, SAEG_PHONE, SAEG_WHATSAPP_INTL } from '@/lib/constants';

export default function AboutPage() {
  const whatsappUrl = `https://wa.me/${SAEG_WHATSAPP_INTL}?text=${encodeURIComponent('Bonjour SAEG, je souhaite des informations.')}`;

  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, je souhaite en savoir plus sur la boutique.">
      <main>
        <section className="relative py-20 bg-slate-50 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight uppercase">À propos de SAEG | La Boutique</h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              La Boutique SAEG valorise les invendus des marchés éphémères en proposant des produits frais, accessibles et vendus au juste poids.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-primary mb-4">Notre mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Réduire le gaspillage alimentaire, soutenir les producteurs et rendre disponibles des produits de qualité à prix juste pour les ménages de Libreville, Akanda et Owendo.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Vente majoritairement au kilo avec pas décimal (0,25 kg)</span></li>
                <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Livraison locale et Click & Collect</span></li>
                <li className="flex gap-3"><span className="material-symbols-outlined text-primary">check_circle</span><span>Packs anti-gaspillage selon arrivage du jour</span></li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                ['balance', 'Vente au kilo', 'Calcul transparent du prix selon le poids sélectionné.'],
                ['local_shipping', 'Logistique locale', 'Créneaux matin / après-midi adaptés aux communes couvertes.'],
                ['eco', 'Anti-gaspillage', 'Valorisation des invendus de marchés éphémères SAEG.'],
                ['support_agent', 'Support humain', 'WhatsApp et téléphone pour un accompagnement rapide.'],
              ].map(([icon, title, text]) => (
                <div key={title} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-primary mb-4">Contacts officiels SAEG</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a href={`tel:${SAEG_PHONE}`} className="btn btn-ghost">Appeler SAEG</a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp SAEG</a>
              <a href={`mailto:${SAEG_EMAIL}`} className="btn btn-ghost">Email SAEG</a>
            </div>
          </div>
        </section>
      </main>
    </MarketingScaffold>
  );
}
