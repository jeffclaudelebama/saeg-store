import Link from 'next/link';
import { SAEG_COPYRIGHT, SAEG_EMAIL, SAEG_PHONE, SAEG_WHATSAPP_INTL } from '@/lib/constants';

export function SiteFooter() {
  const whatsappUrl = `https://wa.me/${SAEG_WHATSAPP_INTL}?text=${encodeURIComponent('Bonjour SAEG, j’ai besoin d’assistance.')}`;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 lg:px-20 mt-20 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 text-white mb-6">
            <span className="material-symbols-outlined text-3xl text-primary">eco</span>
            <h2 className="text-xl font-black tracking-tight">SAEG | La Boutique</h2>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Vente des invendus des marchés éphémères SAEG. Produits frais, circuits courts et livraison locale à Libreville,
            Akanda et Owendo.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Navigation</h4>
          <ul className="space-y-4 text-sm">
            <li><Link className="hover:text-primary transition-colors" href="/">Accueil</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/catalogue">Boutique</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/livraison">Livraison & Retrait</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/a-propos">À propos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Informations</h4>
          <ul className="space-y-4 text-sm">
            <li><Link className="hover:text-primary transition-colors" href="/cgv">Conditions Générales</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/confidentialite">Confidentialité</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/suivi">Suivi de commande</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3"><span className="material-symbols-outlined text-primary">location_on</span><span>Libreville, Gabon</span></li>
            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">call</span><span>{SAEG_PHONE}</span></li>
            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">mail</span><span>{SAEG_EMAIL}</span></li>
          </ul>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a className="hover:text-primary transition-colors" href={`tel:${SAEG_PHONE}`}>Appeler SAEG</a>
            <a className="hover:text-primary transition-colors" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp SAEG</a>
            <a className="hover:text-primary transition-colors" href={`mailto:${SAEG_EMAIL}`}>Email SAEG</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>{SAEG_COPYRIGHT}</p>
        <div className="flex gap-6">
          <Link className="hover:text-white" href="/cgv">Mentions légales</Link>
          <Link className="hover:text-white" href="/confidentialite">Confidentialité</Link>
          <Link className="hover:text-white" href="/cgv#livraison">Livraison</Link>
        </div>
      </div>
    </footer>
  );
}
