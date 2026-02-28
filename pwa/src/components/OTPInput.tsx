'use client';

import { useEffect, useRef } from 'react';

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
};

export function OTPInput({ value, onChange, length = 6, autoFocus = true }: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const first = inputRefs.current[0];
    first?.focus();
  }, [autoFocus]);

  const normalized = value.replace(/\D/g, '').slice(0, length);
  const digits = Array.from({ length }, (_, index) => normalized[index] || '');

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const nextDigits = digits.slice();
    nextDigits[index] = digit;
    const nextValue = nextDigits.join('');
    onChange(nextValue);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(Math.max(pasted.length - 1, 0), length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          className="h-12 w-11 rounded-lg border border-slate-200 text-center text-lg font-black text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          aria-label={`Chiffre ${index + 1} du code`}
        />
      ))}
    </div>
  );
}
