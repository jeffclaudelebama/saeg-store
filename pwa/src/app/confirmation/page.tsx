import Link from 'next/link';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { OrderFollowupActions } from '@/components/OrderFollowupActions';
import { PurchaseTracker } from '@/components/EventTrackers';
import { formatCurrency } from '@/lib/format';
import { AGROPAG_EMAIL, AGROPAG_PHONE, AGROPAG_WHATSAPP_INTL } from '@/lib/constants';

export default function ConfirmationPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const orderId = typeof searchParams?.orderId === 'string' ? searchParams.orderId : '';
  const orderNumber = typeof searchParams?.orderNumber === 'string' ? searchParams.orderNumber : '';
  const total = Number(typeof searchParams?.total === 'string' ? searchParams.total : '0') || 0;
  const payment = typeof searchParams?.payment === 'string' ? searchParams.payment : 'cash';
  const paymentRef = typeof searchParams?.paymentRef === 'string' ? searchParams.paymentRef : '';
  const phone = typeof searchParams?.phone === 'string' ? searchParams.phone : '';
  const payerPhone = typeof searchParams?.payerPhone === 'string' ? searchParams.payerPhone : '';
  const isMobileMoney = payment === 'mobile_money';
  const whatsappLink = `https://wa.me/${AGROPAG_WHATSAPP_INTL}?text=${encodeURIComponent(`Bonjour AGROPAG, je confirme la commande #${orderNumber || '...'}.`)}`;

  return (
    <MarketingScaffold whatsappMessage={`Bonjour AGROPAG, je viens de passer la commande #${orderNumber || '...'}.`}>
      <PurchaseTracker orderNumber={orderNumber} total={total} />
      <main className="min-h-[60vh] max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary/70">Commande confirmée</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Merci pour votre commande</h1>
          <p className="mt-3 text-slate-600">Votre demande a bien été enregistrée. Nous vous contacterons pour la préparation/livraison.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Numéro</p>
              <p className="text-xl font-black text-primary">#{orderNumber || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Montant estimé</p>
              <p className="text-xl font-black text-primary">{formatCurrency(total, 'XAF')}</p>
            </div>
          </div>
          {isMobileMoney ? (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
              <p className="text-sm font-bold text-primary">Paiement Mobile Money</p>
              {paymentRef ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                  Référence: {paymentRef}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-slate-700">Airtel Money — Code agent : AGROPAG</p>
              <p className="mt-1 text-xs text-slate-500">Moov Money — Code agent : AGROPAG (bientôt disponible)</p>
              <p className="mt-3 text-xs text-slate-600">
                Après validation de la commande, effectuez le paiement Airtel Money avec le code agent AGROPAG puis chargez la preuve juste en dessous.
              </p>
            </div>
          ) : null}
          {orderId && orderNumber && phone ? (
            <OrderFollowupActions
              orderId={orderId}
              orderNumber={orderNumber}
              phone={phone}
              payment={payment}
              paymentRef={paymentRef}
              payerPhone={payerPhone}
            />
          ) : null}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href={`tel:${AGROPAG_PHONE}`} className="btn btn-ghost">Appeler AGROPAG</a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp AGROPAG</a>
            <a href={`mailto:${AGROPAG_EMAIL}`} className="btn btn-ghost">Email AGROPAG</a>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/suivi" className="btn btn-primary">Suivre ma commande</Link>
            <Link href="/catalogue" className="btn btn-ghost">Continuer mes achats</Link>
          </div>
        </div>
      </main>
    </MarketingScaffold>
  );
}
