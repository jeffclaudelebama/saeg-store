import { CheckoutPageClient } from '@/components/CheckoutPageClient';
import { MarketingScaffold } from '@/components/MarketingScaffold';

export default function CheckoutPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, j’ai une question sur mon checkout.">
      <main className="max-w-7xl mx-auto px-4 pb-12 lg:pb-20">
        <nav className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <ol className="flex items-center w-full text-sm font-medium text-center text-slate-500 sm:text-base">
            <li className="flex items-center text-primary after:w-12 after:h-1 after:border-b after:border-slate-200 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10">
              <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-slate-200"><span className="material-symbols-outlined mr-2">check_circle</span>Panier</span>
            </li>
            <li className="flex items-center text-primary after:w-12 after:h-1 after:border-b after:border-slate-200 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10">
              <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-slate-200"><span className="mr-2">2.</span>Livraison & Paiement</span>
            </li>
            <li className="flex items-center"><span className="mr-2">3.</span>Confirmation</li>
          </ol>
        </nav>
        <CheckoutPageClient />
      </main>
    </MarketingScaffold>
  );
}
