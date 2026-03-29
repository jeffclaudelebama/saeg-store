type MetaEntry = {
  key?: string;
  value?: unknown;
};

export type SaegOrderTimelineStep = {
  code: string;
  label: string;
  done: boolean;
  active?: boolean;
};

export type SaegOrderStatusView = {
  code: string;
  label: string;
  timeline: SaegOrderTimelineStep[];
};

function getMetaValue(meta: MetaEntry[] | undefined, key: string): string {
  const entry = (meta || []).find((item) => item?.key === key);
  return typeof entry?.value === 'string' ? entry.value : '';
}

function buildFlowTimeline(activeCode: string, steps: Array<{ code: string; label: string }>): SaegOrderTimelineStep[] {
  const activeIndex = steps.findIndex((step) => step.code === activeCode);
  return steps.map((step, index) => ({
    code: step.code,
    label: step.label,
    done: activeIndex >= 0 ? index <= activeIndex : false,
    active: step.code === activeCode,
  }));
}

export function getOrderStatusView(input: {
  status?: string | null;
  paymentMethod?: string | null;
  mobileMoneyStatus?: string | null;
}): SaegOrderStatusView {
  const status = String(input.status || 'pending').trim().toLowerCase();
  const paymentMethod = String(input.paymentMethod || '').trim().toLowerCase();
  const mobileMoneyStatus = String(input.mobileMoneyStatus || '').trim().toLowerCase();
  const isMobileMoney = paymentMethod === 'mobile_money';

  const flow = [
    { code: 'recue', label: 'Commande reçue' },
    ...(isMobileMoney ? [{ code: 'verification_paiement', label: mobileMoneyStatus === 'paid' ? 'Paiement validé' : 'Paiement à vérifier' }] : []),
    { code: 'preparation', label: 'Préparation' },
    { code: 'en_route', label: 'En route' },
    { code: 'livree', label: 'Livrée' },
  ];

  switch (status) {
    case 'completed':
      return {
        code: 'livree',
        label: 'Livrée',
        timeline: buildFlowTimeline('livree', flow),
      };
    case 'saeg_en_route':
    case 'en-route':
      return {
        code: 'en_route',
        label: 'En route',
        timeline: buildFlowTimeline('en_route', flow),
      };
    case 'processing':
      return {
        code: 'preparation',
        label: 'Préparation',
        timeline: buildFlowTimeline('preparation', flow),
      };
    case 'on-hold':
      if (isMobileMoney) {
        return {
          code: 'verification_paiement',
          label: mobileMoneyStatus === 'paid' ? 'Paiement validé' : 'Paiement à vérifier',
          timeline: buildFlowTimeline('verification_paiement', flow),
        };
      }
      return {
        code: 'recue',
        label: 'En attente de confirmation',
        timeline: buildFlowTimeline('recue', flow),
      };
    case 'pending':
      return {
        code: 'recue',
        label: 'Commande reçue',
        timeline: buildFlowTimeline('recue', flow),
      };
    case 'cancelled':
      return {
        code: 'annulee',
        label: 'Commande annulée',
        timeline: [
          { code: 'recue', label: 'Commande reçue', done: true },
          { code: 'annulee', label: 'Commande annulée', done: true, active: true },
        ],
      };
    case 'failed':
      return {
        code: 'echec',
        label: 'Paiement échoué',
        timeline: [
          { code: 'recue', label: 'Commande reçue', done: true },
          { code: 'echec', label: 'Paiement échoué', done: true, active: true },
        ],
      };
    case 'refunded':
      return {
        code: 'remboursee',
        label: 'Commande remboursée',
        timeline: [
          { code: 'recue', label: 'Commande reçue', done: true },
          { code: 'remboursee', label: 'Commande remboursée', done: true, active: true },
        ],
      };
    default:
      return {
        code: status || 'recue',
        label: 'Commande reçue',
        timeline: buildFlowTimeline('recue', flow),
      };
  }
}

export function getOrderMetaSummary(meta: MetaEntry[] | undefined) {
  const paymentMethod = getMetaValue(meta, 'saeg_paiement');
  const paymentReference = getMetaValue(meta, 'saeg_mobile_money_reference');
  const mobileMoneyStatus = getMetaValue(meta, 'saeg_mobile_money_status');
  const paymentProofId = getMetaValue(meta, 'saeg_mobile_money_proof_id');

  return {
    paymentMethod,
    paymentReference,
    mobileMoneyStatus,
    paymentProofUploaded: paymentProofId !== '' && paymentProofId !== '0',
  };
}
