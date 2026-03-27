'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BeginCheckoutTracker } from '@/components/EventTrackers';
import { ErrorState, EmptyState } from '@/components/UiStates';
import { loadAccountProfile, saveAccountProfile } from '@/lib/account-profile';
import { getDeliveryFee } from '@/lib/delivery';
import { formatCurrency } from '@/lib/format';
import { normalizeGabonPhone } from '@/lib/phone';
import { useCart } from '@/providers/CartProvider';
import type { SaegCartValidationError, SaegCheckoutForm, SaegCommune, SaegDeliveryMode, SaegDeliverySlot } from '@/types/saeg';

const CHECKOUT_STORAGE_KEY = 'saeg_checkout_form_v2';
const CHECKOUT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_FALLBACK = 'commande@agropag.ga';
const PICKUP_ADDRESS = 'Retrait Marché AGROPAG';

type CheckoutField =
  | 'first_name'
  | 'last_name'
  | 'telephone'
  | 'email'
  | 'commune'
  | 'address_1'
  | 'address_2'
  | 'modeLivraison'
  | 'creneau'
  | 'paiement'
  | 'mobileMoneyPayerNumber'
  | 'note';

type FormErrors = Partial<Record<CheckoutField, string>>;

function isSaegCommune(value: string | null): value is SaegCommune {
  return value === 'Libreville' || value === 'Akanda' || value === 'Owendo';
}

function isSaegDeliveryMode(value: string | null): value is SaegDeliveryMode {
  return value === 'delivery' || value === 'pickup';
}

function isValidEmail(value: string): boolean {
  if (!value.trim()) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function trimForm(form: SaegCheckoutForm): SaegCheckoutForm {
  return {
    ...form,
    first_name: form.first_name.trim(),
    last_name: (form.last_name || '').trim(),
    telephone: form.telephone.trim(),
    email: (form.email || '').trim(),
    address_1: form.address_1.trim(),
    address_2: (form.address_2 || '').trim(),
    mobileMoneyPayerNumber: (form.mobileMoneyPayerNumber || '').trim(),
    note: (form.note || '').trim(),
  };
}

function validateCheckoutForm(form: SaegCheckoutForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.first_name.trim()) {
    errors.first_name = 'Le prénom est obligatoire.';
  }
  if (!form.telephone.trim()) {
    errors.telephone = 'Le téléphone est obligatoire.';
  } else if (!normalizeGabonPhone(form.telephone)) {
    errors.telephone = 'Numéro invalide. Format accepté: 077..., 06..., 241..., +241...';
  }
  if ((form.email || '').trim() && !isValidEmail(form.email || '')) {
    errors.email = 'Adresse email invalide.';
  }
  if (!form.commune) {
    errors.commune = 'La commune est obligatoire.';
  }
  if (form.modeLivraison === 'delivery' && !form.address_1.trim()) {
    errors.address_1 = 'Le quartier / adresse est obligatoire pour la livraison.';
  }
  return errors;
}

function getItemQuantity(item: { unitType?: 'kg' | 'unit'; quantity: number; weight_kg?: number }): number {
  if ((item.unitType || 'unit') === 'kg') {
    return Number(item.weight_kg ?? item.quantity);
  }
  return Number(item.quantity);
}

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart, hydrated, hydrateWarnings, clearHydrateWarnings } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [cartValidationErrors, setCartValidationErrors] = useState<SaegCartValidationError[]>([]);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [mobileMoneySeed] = useState(() => Math.random().toString(36).slice(-4).toUpperCase());

  const queryCommune = searchParams.get('commune');
  const queryMode = searchParams.get('mode');
  const initialCommune: SaegCommune = isSaegCommune(queryCommune) ? queryCommune : 'Libreville';
  const initialMode: SaegDeliveryMode = isSaegDeliveryMode(queryMode) ? queryMode : 'delivery';

  const [form, setForm] = useState<SaegCheckoutForm>({
    first_name: '',
    last_name: '',
    telephone: '',
    email: '',
    commune: initialCommune,
    address_1: '',
    address_2: '',
    country: 'GA',
    modeLivraison: initialMode,
    creneau: 'matin',
    paiement: 'cash',
    note: '',
    mobileMoneyPayerNumber: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { updatedAt?: number; form?: Partial<SaegCheckoutForm> };
      if (!parsed?.updatedAt || Date.now() - parsed.updatedAt > CHECKOUT_STORAGE_TTL_MS || !parsed.form) {
        window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        return;
      }
      setForm((prev) => ({
        ...prev,
        ...parsed.form,
        commune: initialCommune,
        modeLivraison: initialMode,
        country: 'GA',
      }));
    } catch {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }
  }, [initialCommune, initialMode]);

  useEffect(() => {
    const profile = loadAccountProfile();
    if (!profile) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      first_name: prev.first_name || profile.first_name || '',
      last_name: prev.last_name || profile.last_name || '',
      telephone: prev.telephone || profile.phone || '',
      email: prev.email || profile.email || '',
      commune: prev.commune || profile.city || 'Libreville',
      address_1: prev.address_1 || profile.address_1 || '',
      address_2: prev.address_2 || profile.address_2 || '',
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = {
      updatedAt: Date.now(),
      form: {
        first_name: form.first_name,
        last_name: form.last_name || '',
        telephone: form.telephone,
        email: form.email || '',
        commune: form.commune,
        address_1: form.address_1,
        address_2: form.address_2 || '',
        country: 'GA',
        modeLivraison: form.modeLivraison,
        creneau: form.creneau,
        paiement: form.paiement,
        note: form.note || '',
        mobileMoneyPayerNumber: form.mobileMoneyPayerNumber || '',
      },
    };
    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
  }, [form]);

  useEffect(() => {
    const normalizedPhone = normalizeGabonPhone(form.telephone);
    if (!normalizedPhone) {
      return;
    }
    saveAccountProfile({
      phone: normalizedPhone,
      first_name: form.first_name || '',
      last_name: form.last_name || '',
      email: form.email || '',
      address_1: form.address_1 || '',
      address_2: form.address_2 || '',
      city: form.commune,
    });
  }, [form.telephone, form.first_name, form.last_name, form.email, form.address_1, form.address_2, form.commune]);

  const shipping = getDeliveryFee(form.commune, form.modeLivraison);
  const total = subtotal + shipping;

  const canSubmit = useMemo(() => {
    if (items.length === 0) {
      return false;
    }
    const next = trimForm(form);
    const validationErrors = validateCheckoutForm(next);
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    if (form.paiement !== 'mobile_money') {
      return true;
    }
    const payer = normalizeGabonPhone(form.mobileMoneyPayerNumber || '');
    return Boolean(payer) && Boolean(paymentProofFile);
  }, [items.length, form, paymentProofFile]);

  async function submitOrder() {
    setError(null);
    setFieldErrors({});
    setCartValidationErrors([]);

    const next = trimForm(form);
    const validationErrors = validateCheckoutForm(next);
    const normalizedPhone = normalizeGabonPhone(next.telephone);
    if (Object.keys(validationErrors).length > 0 || !normalizedPhone) {
      setFieldErrors(validationErrors);
      setError('Veuillez corriger les champs obligatoires.');
      return;
    }
    if (next.paiement === 'mobile_money') {
      const normalizedPayer = normalizeGabonPhone(next.mobileMoneyPayerNumber || '');
      if (!normalizedPayer) {
        setFieldErrors((prev) => ({ ...prev, mobileMoneyPayerNumber: 'Numéro payeur invalide.' }));
        setError('Le numéro Airtel/Moov du payeur est obligatoire.');
        return;
      }
      if (!paymentProofFile) {
        setError('La preuve de paiement est obligatoire pour Mobile Money.');
        return;
      }
      next.mobileMoneyPayerNumber = normalizedPayer;
    }

    next.telephone = normalizedPhone;
    next.email = next.email || EMAIL_FALLBACK;
    if (next.modeLivraison === 'pickup' && !next.address_1) {
      next.address_1 = PICKUP_ADDRESS;
    }
    next.country = 'GA';

    startTransition(async () => {
      try {
        const cartSnapshot = {
          items,
          commune: next.commune,
          modeLivraison: next.modeLivraison,
        };
        const validateRes = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartSnapshot),
        });
        const validateData = await validateRes.json();
        if (process.env.NODE_ENV !== 'production') {
          console.info('[AGROPAG][checkout] cart snapshot', cartSnapshot);
          console.info('[AGROPAG][checkout] validateCart result', validateData);
        }
        if (!validateData?.ok) {
          const errors = Array.isArray(validateData?.errors) ? (validateData.errors as SaegCartValidationError[]) : [];
          setCartValidationErrors(errors);
          setError('Panier invalide');
          return;
        }

        const payload = new FormData();
        payload.append('items', JSON.stringify(items));
        payload.append('form', JSON.stringify(next));
        if (paymentProofFile) {
          payload.append('payment_proof', paymentProofFile);
        }

        const res = await fetch('/api/checkout/create-order', {
          method: 'POST',
          body: payload,
        });
        const data = await res.json();

        if (!res.ok) {
          if (Array.isArray(data?.validation?.errors)) {
            setCartValidationErrors(data.validation.errors as SaegCartValidationError[]);
          }
          const message = data?.error || 'Échec de la commande';
          const details = data?.body ? `\n${String(data.body)}` : '';
          throw new Error(`${message}${details}`);
        }

        const order = data.order;
        clearCart();
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        }
        router.push(
          `/confirmation?orderNumber=${encodeURIComponent(String(order.number || order.id))}&total=${encodeURIComponent(String(data.validation?.total ?? total))}&payment=${encodeURIComponent(next.paiement)}&paymentRef=${encodeURIComponent(String(data.paymentReference || ''))}`
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom *</label>
                <input className="w-full rounded border-slate-200" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Ex: Jean" />
                {fieldErrors.first_name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.first_name}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                <input className="w-full rounded border-slate-200" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Ex: Dupont" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone *</label>
                <input className="w-full rounded border-slate-200" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="077 00 00 00" />
                {fieldErrors.telephone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.telephone}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input className="w-full rounded border-slate-200" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@email.com" />
                {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Commune *</label>
                <select className="w-full rounded border-slate-200" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value as SaegCommune })}>
                  <option value="Libreville">Libreville</option>
                  <option value="Akanda">Akanda</option>
                  <option value="Owendo">Owendo</option>
                </select>
                {fieldErrors.commune ? <p className="mt-1 text-xs text-red-600">{fieldErrors.commune}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pays *</label>
                <input className="w-full rounded border-slate-200 bg-slate-50" value="Gabon (GA)" readOnly />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quartier / Adresse {form.modeLivraison === 'delivery' ? '*' : '(optionnel)'}
                </label>
                <textarea className="w-full rounded border-slate-200" rows={3} value={form.address_1} onChange={(e) => setForm({ ...form, address_1: e.target.value })} placeholder="Quartier, repères, numéro de maison..." />
                {fieldErrors.address_1 ? <p className="mt-1 text-xs text-red-600">{fieldErrors.address_1}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Complément adresse</label>
                <input className="w-full rounded border-slate-200" value={form.address_2 || ''} onChange={(e) => setForm({ ...form, address_2: e.target.value })} placeholder="Immeuble, étage, point de repère..." />
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
                    <p className="text-xs text-slate-500">Retrait gratuit au point AGROPAG</p>
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
                    Référence: AGROPAG-{'{orderId}'}-{mobileMoneySeed}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">Airtel Money — Code agent : AGROPAG</p>
                  <p className="mt-1 text-xs text-slate-500">Moov Money — Code agent : AGROPAG (bientôt disponible)</p>
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
                      {fieldErrors.mobileMoneyPayerNumber ? <p className="mt-1 text-xs text-red-600">{fieldErrors.mobileMoneyPayerNumber}</p> : null}
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

          {hydrateWarnings.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-amber-800">Ajustements panier</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {hydrateWarnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>• {warning}</li>
                    ))}
                  </ul>
                </div>
                <button type="button" onClick={clearHydrateWarnings} className="text-amber-700 hover:text-amber-900">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          ) : null}

          {cartValidationErrors.length > 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">Panier invalide</p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {cartValidationErrors.map((entry) => (
                  <li key={`${entry.itemKey}-${entry.reason}`}>
                    • {entry.name} : {entry.reason}
                    {entry.details ? ` (${entry.details})` : ''}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 btn btn-ghost"
                onClick={() => router.push(`/panier?invalid=${encodeURIComponent(cartValidationErrors.map((entry) => entry.itemKey).join(','))}`)}
              >
                Corriger mon panier
              </button>
            </div>
          ) : null}

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
                      <p className="text-slate-500">{item.unitType === 'kg' ? `${getItemQuantity(item).toFixed(2).replace('.', ',')} kg` : `${item.quantity} unité(s)`}</p>
                    </div>
                    <p className="font-bold text-primary">{formatCurrency(item.unitPrice * getItemQuantity(item), item.currency)}</p>
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
