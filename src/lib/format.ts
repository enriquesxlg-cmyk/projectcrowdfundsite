export function formatMoney(amount: number, locale = 'en-US', currency = 'USD') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch (e) {
    // Fallback: simple formatting
    const fixed = amount.toFixed(2);
    return `$${Number(fixed).toLocaleString('en-US')}`;
  }
}

export function formatDateShort(dateInput: string | Date) {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  } catch (e) {
    // Fallback to ISO date
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toISOString().split('T')[0];
  }
}

export function formatDateTime(dateInput: string | Date) {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  } catch (e) {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toISOString();
  }
}
