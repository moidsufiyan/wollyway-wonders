/**
 * Formats an integer amount (in paisa) to an INR formatted string.
 * Ensures `/100` division logic is centralized.
 * 
 * @example
 * formatMoney(249900) // returns "₹2,499.00"
 */
export const formatMoney = (amountInPaisa: number): string => {
  if (amountInPaisa == null || isNaN(amountInPaisa)) return "₹0.00";
  
  const amountInRupees = amountInPaisa / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInRupees);
};

/**
 * Returns the raw rupee value (number) from paisa.
 * Use this only when a raw number is strictly required (e.g. some third-party components).
 */
export const getRupeesFromPaisa = (amountInPaisa: number): number => {
  if (amountInPaisa == null || isNaN(amountInPaisa)) return 0;
  return amountInPaisa / 100;
};
