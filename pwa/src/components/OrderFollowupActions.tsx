'use client';

import { useMemo, useState } from 'react';
import { urlBase64ToUint8Array } from '@/lib/push';

type Props = {
  orderId: string;
  orderNumber: string;
  phone: string;
  payment: string;
  paymentRef: string;
  payerPhone: string;
};

export function OrderFollowupActions({ orderId, orderNumber, phone, payment, paymentRef, payerPhone }: Props) {
  const isMobileMoney = payment === 'mobile_money';
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const normalizedPayerPhone = useMemo(() => payerPhone.trim(), [payerPhone]);

  async function uploadProof() {
    if (!proofFile) {
      setProofError('Choisissez une image ou un PDF.');
      return;
    }

    setProofLoading(true);
    setProofError(null);
    setProofMessage(null);

    try {
      const payload = new FormData();
      payload.append('orderId', orderId);
      payload.append('orderNumber', orderNumber);
      payload.append('phone', phone);
      payload.append('paymentReference', paymentRef);
      payload.append('payerNumber', normalizedPayerPhone);
      payload.append('proof', proofFile);

      const response = await fetch('/api/orders/payment-proof', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Impossible d’envoyer la preuve.');
      }

      setProofMessage('Preuve reçue. L’équipe AGROPAG peut maintenant vérifier votre paiement.');
      setProofFile(null);
    } catch (error) {
      setProofError(error instanceof Error ? error.message : 'Erreur pendant l’envoi de la preuve.');
    } finally {
      setProofLoading(false);
    }
  }

  async function subscribeToPush() {
    setPushLoading(true);
    setPushError(null);
    setPushMessage(null);

    try {
      if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Les notifications push ne sont pas disponibles sur cet appareil.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('L’autorisation de notification a été refusée.');
      }

      const keyResponse = await fetch('/api/push/public-key', { cache: 'no-store' });
      const keyData = await keyResponse.json();
      if (!keyResponse.ok || !keyData?.publicKey) {
        throw new Error(keyData?.error || 'Clé de notification introuvable.');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(String(keyData.publicKey)),
        }));

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          phone,
          subscription,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Impossible d’activer les notifications.');
      }

      setPushMessage('Notifications activées. Vous recevrez les changements de statut de cette commande sur ce téléphone.');
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Impossible d’activer les notifications.');
    } finally {
      setPushLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {isMobileMoney ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
          <p className="text-sm font-bold text-primary">Ajouter la preuve de paiement</p>
          <p className="mt-2 text-xs text-slate-600">
            Le choix retenu est unique: la commande est validée d’abord, puis vous chargez la preuve ici.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
              className="w-full rounded border-slate-200 bg-white text-sm file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary"
            />
            <button type="button" className="btn btn-primary" disabled={proofLoading} onClick={uploadProof}>
              {proofLoading ? 'Envoi...' : 'Envoyer la preuve'}
            </button>
          </div>
          {proofFile ? <p className="mt-2 text-xs text-slate-500">Fichier sélectionné: {proofFile.name}</p> : null}
          {proofMessage ? <p className="mt-3 text-sm font-semibold text-primary">{proofMessage}</p> : null}
          {proofError ? <p className="mt-3 text-sm font-semibold text-red-600">{proofError}</p> : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <p className="text-sm font-bold text-slate-900">Notifications de statut</p>
        <p className="mt-2 text-xs text-slate-600">
          Activez les notifications push pour recevoir sur ce téléphone les changements de statut de la commande #{orderNumber}.
        </p>
        <button type="button" className="btn btn-ghost mt-4" disabled={pushLoading} onClick={subscribeToPush}>
          {pushLoading ? 'Activation...' : 'Activer les notifications'}
        </button>
        {pushMessage ? <p className="mt-3 text-sm font-semibold text-primary">{pushMessage}</p> : null}
        {pushError ? <p className="mt-3 text-sm font-semibold text-red-600">{pushError}</p> : null}
      </div>
    </div>
  );
}
