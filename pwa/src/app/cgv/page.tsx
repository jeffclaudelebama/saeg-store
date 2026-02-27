import type { ReactNode } from 'react';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { SAEG_EMAIL } from '@/lib/constants';

export default function CgvPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, j’ai une question sur vos conditions et politiques.">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-1/4 w-full">
            <div className="sticky top-24 space-y-2 bg-background-light z-40 py-4 overflow-x-auto flex lg:flex-col no-scrollbar">
              {[
                ['mentions', 'Mentions Légales', 'gavel'],
                ['cgv', 'CGV', 'description'],
                ['confidentialite', 'Confidentialité', 'lock'],
                ['livraison', 'Livraison & Retours', 'local_shipping'],
              ].map(([id, label, icon], i) => (
                <a key={id} href={`#${id}`} className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap text-sm font-semibold shrink-0 ${i === 0 ? 'bg-primary text-white' : 'text-slate-600 hover:bg-primary/5'}`}>
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </aside>
          <div className="lg:w-3/4 space-y-16">
            <section>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Centre de <span className="text-primary underline decoration-primary/20">Politiques Légales</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">Dernière mise à jour: 26 février 2026. SAEG s’engage à la transparence sur ses services de vente au kilo, livraison et protection des données.</p>
            </section>

            <SectionBlock id="mentions" title="1. Mentions Légales">
              <p className="mb-4">Ce site est édité par <strong>SAEG (Société d’Agriculture et d’Élevage du Gabon)</strong>.</p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex gap-4"><span className="material-symbols-outlined text-primary">location_on</span><div><strong className="block">Siège</strong> Libreville, Gabon.</div></li>
                <li className="flex gap-4"><span className="material-symbols-outlined text-primary">mail</span><div><strong className="block">Email</strong> {SAEG_EMAIL}</div></li>
                <li className="flex gap-4"><span className="material-symbols-outlined text-primary">dns</span><div><strong className="block">Hébergement</strong> Infrastructure sécurisée (Node/WordPress reverse proxy).</div></li>
              </ul>
            </SectionBlock>

            <SectionBlock id="cgv" title="2. Conditions Générales de Vente">
              <div className="space-y-6 text-slate-700 leading-relaxed">
                <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                  <h3 className="text-xl font-bold text-primary mb-3">Spécificités des produits au poids</h3>
                  <p>Les fruits, légumes et viandes sont majoritairement vendus au kilogramme (kg) avec pas de 0,25 kg.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-slate-200 rounded-xl"><h4 className="font-bold mb-2">Incréments de poids</h4><p className="text-sm">Sélection par tranches de 0,25 kg. Le prix final = poids × prix/kg.</p></div>
                  <div className="p-6 border border-slate-200 rounded-xl"><h4 className="font-bold mb-2">Stock limité</h4><p className="text-sm">Les invendus du jour sont soumis à disponibilité. Le panier est revalidé avant commande.</p></div>
                </div>
                <p>Modes de paiement disponibles: cash et structure Mobile Money (Airtel/Moov) selon activation.</p>
              </div>
            </SectionBlock>

            <SectionBlock id="confidentialite" title="3. Politique de Confidentialité">
              <div className="bg-slate-50 p-8 rounded-2xl space-y-5">
                <div><h4 className="font-bold text-primary mb-2">Collecte</h4><p className="text-sm">Nom, téléphone, adresse, commune et données nécessaires au traitement de la commande.</p></div>
                <div><h4 className="font-bold text-primary mb-2">Usage</h4><p className="text-sm">Logistique de livraison/retrait, suivi de commande et service client. Aucune revente de données.</p></div>
                <div><h4 className="font-bold text-primary mb-2">Droits</h4><p className="text-sm">Demande d’accès, rectification ou suppression via {SAEG_EMAIL}.</p></div>
              </div>
            </SectionBlock>

            <SectionBlock id="livraison" title="4. Politique de Livraison et de Retour">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Libreville', 'Akanda', 'Owendo'].map((zone) => (
                    <div key={zone} className="p-6 bg-white border-2 border-primary/20 rounded-xl text-center">
                      <span className="material-symbols-outlined text-primary text-4xl mb-2">location_city</span>
                      <h4 className="font-bold text-slate-900">{zone}</h4>
                    </div>
                  ))}
                </div>
                <div className="prose prose-slate max-w-none">
                  <h3>Délais et frais</h3>
                  <p>Les frais de livraison sont calculés selon la commune. Le Click & Collect est gratuit.</p>
                  <h3>Produits frais et retours</h3>
                  <ul>
                    <li>Vérification des produits à réception recommandée</li>
                    <li>Réclamation rapide via téléphone ou WhatsApp</li>
                    <li>Solution: remplacement, avoir ou remboursement selon cas validé</li>
                  </ul>
                </div>
              </div>
            </SectionBlock>
          </div>
        </div>
      </main>
    </MarketingScaffold>
  );
}

function SectionBlock({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-32" id={id}>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-1 bg-primary rounded-full"></div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">{children}</div>
    </section>
  );
}
