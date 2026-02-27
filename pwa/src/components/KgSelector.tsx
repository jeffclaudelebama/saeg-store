'use client';

import { useEffect, useState } from 'react';
import { clampDecimal } from '@/lib/format';

export function KgSelector({
  unitType,
  value,
  minKg,
  stepKg,
  maxKg,
  onChange,
}: {
  unitType: 'kg' | 'unit';
  value: number;
  minKg: number;
  stepKg: number;
  maxKg?: number | null;
  onChange: (next: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const step = unitType === 'kg' ? stepKg : 1;
  const min = unitType === 'kg' ? minKg : 1;

  const increment = (delta: number) => {
    const next = clampDecimal(Math.max(min, value + delta), 2);
    if (typeof maxKg === 'number' && unitType === 'kg') {
      onChange(Math.min(maxKg, next));
      return;
    }
    onChange(next);
  };

  return (
    <div className="kg-selector">
      <button type="button" className="icon-btn" onClick={() => increment(-step)} aria-label="Réduire">
        −
      </button>
      <label className="kg-selector__field">
        <span>{unitType === 'kg' ? 'Poids' : 'Quantité'}</span>
        <input
          type="number"
          inputMode={unitType === 'kg' ? 'decimal' : 'numeric'}
          min={min}
          step={step}
          max={typeof maxKg === 'number' && unitType === 'kg' ? maxKg : undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const parsed = Number(String(draft).replace(',', '.'));
            if (Number.isFinite(parsed)) {
              let next = clampDecimal(parsed, 2);
              if (next < min) next = min;
              if (typeof maxKg === 'number' && unitType === 'kg') next = Math.min(maxKg, next);
              onChange(next);
            } else {
              setDraft(String(value));
            }
          }}
        />
      </label>
      <button type="button" className="icon-btn" onClick={() => increment(step)} aria-label="Augmenter">
        +
      </button>
    </div>
  );
}
