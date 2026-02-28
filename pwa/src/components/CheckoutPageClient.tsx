'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BeginCheckoutTracker } from '@/components/EventTrackers';
import { ErrorState, EmptyState } from '@/components/UiStates';
import { getDeliveryFee } from '@/lib/delivery';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/providers/CartProvider';
import type { SaegCheckoutForm, SaegCommune, SaegDeliveryMode, SaegDeliverySlot, SaegPaymentMethod } from '@/types/saeg';

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart, hydrated } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [mobileMoneySeed] = useState(() => Math.random().toString(36).slice(-4).toUpperCase());

  const [form, setForm] = useState<SaegCheckoutForm>({
    nom: '',
    telephone: '',
    commune: (searchParams.get('commune') as SaegCommune) || 'Libreville',
    adresse: '',
    modeLivraison: (searchParams.get('mode') as SaegDeliveryMode) || 'delivery',
    creneau: 'matin',
    paiement: 'cash',
    note: '',
    mobileMoneyPayerNumber: '',
  });

  useEffect(() => {
    if (form.modeLivraison === 'pickup') {
      setForm((prev) => ({ ...prev }));
    }
  }, [form.modeLivraison]);

  const shipping = getDeliveryFee(form.commune, form.modeLivraison);
  const total = subtotal + shipping;

  const canSubmit = useMemo(() => {
    const hasMainFields = items.length > 0 && form.nom.trim() && form.telephone.trim() && form.adresse.trim();
    if (!hasMainFields) {
      return false;
    }
    if (form.paiement !== 'mobile_money') {
      return true;
    }
    return Boolean(form.mobileMoneyPayerNumber?.trim()) && Boolean(paymentProofFile);
  }, [items.length, form, paymentProofFile]);

  async function submitOrder() {
    setError(null);
    if (!canSubmit) {
      setError('Veuillez compléter les informations obligatoires.');
      return;
    }

    startTransition(async () => {
      try {
        const payload = new FormData();
        payload.append('items', JSON.stringify(items));
        payload.append('form', JSON.stringify(form));
        if (paymentProofFile) {
          payload.append('payment_proof', paymentProofFile);
        }

        const res = await fetch('/api/checkout/create-order', {
          method: 'POST',
          body: payload,
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Échec de la commande');
        }

        const order = data.order;
        clearCart();
        router.push(
          `/confirmation?orderNumber=${encodeURIComponent(String(order.number || order.id))}&total=${encodeURIComponent(String(data.validation?.total ?? total))}&payment=${encodeURIComponent(form.paiement)}&paymentRef=${encodeURIComponent(String(data.paymentReference || ''))}`
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de confirmation');
      }
    });
  }

  if (!hydrated) {
    return <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">Chargement du checkout…</div>;
  }

  if (items.length === 0) {
    return <EmptyState title="Panier vide" description="Ajoutez des produits avant de passer au checkout." />;
  }

  return (
    <>
      <BeginCheckoutTracker total={total} items={items.length} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white p-5 md:p-8 rounded shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              1. Détails de Facturation & Livraison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom complet *</label>
                <input className="w-full rounded border-slate-200" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone *</label>
                <input className="w-full rounded border-slate-200" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="077 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Commune *</label>
                <select className="w-full rounded border-slate-200" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value as SaegCommune })}>
                  <option value="Libreville">Libreville</option>
                  <option value="Akanda">Akanda</option>
                  <option value="Owendo">Owendo</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse *</label>
                <textarea className="w-full rounded border-slate-200" rows={3} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="Quartier, repères, numéro de maison..." />
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              2. Livraison / Retrait
            </h2>
            <div className="grid gap-4">
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${form.modeLivraison === 'delivery' ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                <input className="w-4 h-4 text-primary" type="radio" name="mode" checked={form.modeLivraison === 'delivery'} onChange={() => setForm({ ...form, modeLivraison: 'delivery' })} />
                <div className="ml-4 flex items-center justify-between w-full">
                  <div>
                    <p className="font-bold">Livraison locale</p>
                    <p className="text-xs text-slate-500">Libreville / Akanda / Owendo</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatCurrency(getDeliveryFee(form.commune, 'delivery'), 'XAF')}</span>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${form.modeLivraison === 'pickup' ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                <input className="w-4 h-4 text-primary" type="radio" name="mode" checked={form.modeLivraison === 'pickup'} onChange={() => setForm({ ...form, modeLivraison: 'pickup' })} />
                <div className="ml-4 flex items-center justify-between w-full">
                  <div>
                    <p className="font-bold">Click & Collect</p>
                    <p className="text-xs text-slate-500">Retrait gratuit au point SAEG</p>
                  </div>
                  <span className="text-sm font-bold text-primary">0 FCFA</span>
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Créneau</span>
                  <select className="w-full rounded border-slate-200" value={form.creneau} onChange={(e) => setForm({ ...form, creneau: e.target.value as SaegDeliverySlot })}>
                    <option value="matin">Matin</option>
                    <option value="apres-midi">Après-midi</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Note (optionnel)</span>
                  <input className="w-full rounded border-slate-200" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ex: appeler en arrivant" />
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              3. Paiement
            </h2>
            <div className="space-y-4">
              <PaymentChoice
                selected={form.paiement === 'cash'}
                title="Cash à la livraison"
                description="Paiement à la livraison / au retrait"
                onSelect={() => setForm({ ...form, paiement: 'cash' })}
              />
              <PaymentChoice
                selected={form.paiement === 'mobile_money'}
                title="Mobile Money"
                description="Paiement manuel après validation de commande"
                onSelect={() => setForm({ ...form, paiement: 'mobile_money' })}
              />
              {form.paiement === 'mobile_money' ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-bold text-primary">Paiement Mobile Money</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                    Référence: SAEG-{'{orderId}'}-{mobileMoneySeed}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">Airtel Money — Code agent : SAEG</p>
                  <p className="mt-1 text-xs text-slate-500">Moov Money — Code agent : SAEG (bientôt disponible)</p>
                  <p className="mt-3 text-xs text-slate-600">Effectuez le paiement, puis ajoutez la preuve.</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Numéro Airtel/Moov du payeur *</span>
                      <input
                        className="w-full rounded border-slate-200"
                        value={form.mobileMoneyPayerNumber || ''}
                        onChange={(e) => setForm({ ...form, mobileMoneyPayerNumber: e.target.value })}
                        placeholder="Ex: 077 00 00 00"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Preuve de paiement (image/pdf) *</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded border-slate-200 bg-white text-sm file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary"
                      />
                      {paymentProofFile ? (
                        <p className="text-xs text-slate-500">Fichier: {paymentProofFile.name}</p>
                      ) : null}
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {error ? <ErrorState title="Erreur checkout" description={error} /> : null}
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <section className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden p-5 md:p-8">
              <div className="bg-primary/5 p-4 border-b border-primary/10 -m-5 md:-m-8 mb-6 md:mb-8 md:mx-[-2rem] md:mt-[-2rem]">
                <h2 className="font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">shopping_basket</span>
                  Votre commande
                </h2>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-slate-500">{item.unitType === 'kg' ? `${item.quantity.toFixed(2).replace('.', ',')} kg` : `${item.quantity} unité(s)`}</p>
                    </div>
                    <p className="font-bold text-primary">{formatCurrency(item.unitPrice * item.quantity, item.currency)}</p>
                  </div>
                ))}
                <hr className="border-slate-100" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Sous-total</span><span>{formatCurrency(subtotal, 'XAF')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Livraison</span><span>{formatCurrency(shipping, 'XAF')}</span></div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100"><span>Total</span><span className="text-secondary">{formatCurrency(total, 'XAF')}</span></div>
                </div>
                <button disabled={isPending} onClick={submitOrder} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">verified_user</span>
                  {isPending ? 'CONFIRMATION...' : 'CONFIRMER LA COMMANDE'}
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest leading-relaxed">
                  En confirmant, vous acceptez les conditions générales de vente et de livraison.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function PaymentChoice({ selected, title, description, onSelect }: { selected: boolean; title: string; description: string; onSelect: () => void }) {
  return (
    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary/30 transition-all ${selected ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
      <input checked={selected} onChange={onSelect} className="w-4 h-4 text-primary border-slate-300" name="payment" type="radio" />
      <div className="ml-4 flex items-center justify-between w-full">
        <div>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <span className="material-symbols-outlined text-slate-400">payments</span>
      </div>
    </label>
  );
}
