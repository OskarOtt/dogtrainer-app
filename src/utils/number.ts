import { getLocaleTag } from '@/i18n';

export function formatDecimal(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat(getLocaleTag(), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat(getLocaleTag(), {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(ratio);
}
