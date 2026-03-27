import Link from 'next/link';
import { WhatsAppNewsletterForm } from '@/components/WhatsAppNewsletterForm';
import { AGROPAG_COPYRIGHT } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 lg:px-20 mt-20 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="mb-6">
            <img
              src="/img/agropag-logo-white.png"
              alt="AGROPAG logo"
              className="h-10 sm:h-12 w-auto object-contain"
              width={180}
              height={48}
            />
          </div>
          <p className="text-sm leading-relaxed mb-6">
            SOCIETE AGROPASTORALE DU GABON<br />
            Société d’État avec Conseil d’Administration<br />
            Au capital de 100 000 000 FCFA<br />
            Tout sur la AGROPAG en un clic : https://linktr.ee/agropagga
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
          <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Newsletter</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3"><span className="material-symbols-outlined text-primary">location_on</span><span>Libreville, Gabon</span></li>
          </ul>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Recevoir les invendus sur WhatsApp</p>
            <WhatsAppNewsletterForm />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>{AGROPAG_COPYRIGHT}</p>
        <div className="flex gap-6">
          <Link className="hover:text-white" href="/cgv">Mentions légales</Link>
          <Link className="hover:text-white" href="/confidentialite">Confidentialité</Link>
          <Link className="hover:text-white" href="/cgv#livraison">Livraison</Link>
        </div>
      </div>
    </footer>
  );
}
