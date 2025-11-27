/**
 * Formats a number as a currency string (e.g., $12.34).
 * @param amount The number to format.
 * @param currency The currency code (default: 'USD').
 * @param locale The locale (default: 'en-US').
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
