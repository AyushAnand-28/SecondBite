export const formatPrice = (amount: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export const discountPercent = (original: number, discounted: number): number =>
  Math.round(((original - discounted) / original) * 100);

export const isExpiringSoon = (date: Date | string, days = 3): boolean => {
  const expiry = new Date(date).getTime();
  const threshold = days * 24 * 60 * 60 * 1000;
  return expiry - Date.now() <= threshold && expiry > Date.now();
};
