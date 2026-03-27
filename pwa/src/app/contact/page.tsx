import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AGROPAG_INFO_EMAIL, AGROPAG_PHONE } from '@/lib/constants';

export default function ContactPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je souhaite vous contacter.">
      <main>
        <section className="relative py-20 bg-slate-50 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight uppercase">Contactez-nous</h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Notre équipe est à votre écoute pour toute question sur les produits, la livraison ou votre commande.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ['location_on', 'Adresse', 'Libreville, Gabon'],
              ['call', 'Téléphone', AGROPAG_PHONE],
              ['mail', 'Email', AGROPAG_INFO_EMAIL],
              ['schedule', 'Horaires', 'Lun - Sam: 08h00 - 18h00'],
            ].map(([icon, title, text]) => (
              <div key={title} className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:border-accent transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-primary">{icon}</span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-normal whitespace-pre-line">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100">
              <h2 className="text-3xl font-black text-primary mb-8 tracking-tight">Envoyez-nous un message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Nom complet" placeholder="Votre nom" />
                  <Field label="Téléphone" placeholder="+241 ..." />
                </div>
                <Field label="Objet" placeholder="Sujet de votre message" />
                <label className="block space-y-2">
                  <span className="block text-sm font-bold text-primary uppercase tracking-wider">Message</span>
                  <textarea className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-4 text-base" placeholder="Comment pouvons-nous vous aider ?" rows={5}></textarea>
                </label>
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 group" type="button">
                  Envoyer le message <span className="material-symbols-outlined text-accent group-hover:translate-x-1 transition-transform">send</span>
                </button>
              </form>
            </div>
            <div className="h-full min-h-[500px] w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner relative group border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20"></div>
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative flex items-center justify-center mb-4">
                    <div className="absolute w-12 h-12 bg-primary/30 rounded-full animate-ping"></div>
                    <div className="relative w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xs">location_on</span>
                    </div>
                  </div>
                  <p className="text-primary font-black">Libreville • Gabon</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl">
                <p className="text-primary font-bold text-sm uppercase mb-1">Notre emplacement</p>
                <p className="text-slate-600 text-xs">Zone d’activité AGROPAG, Libreville. Nous servons aussi Akanda et Owendo.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingScaffold>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-bold text-primary uppercase tracking-wider">{label}</span>
      <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-4 text-base" placeholder={placeholder} type="text" />
    </label>
  );
}
