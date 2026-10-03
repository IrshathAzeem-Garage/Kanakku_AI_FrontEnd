/**
 * Formats a numeric amount to Indian Rupee standard format (e.g. ₹1,25,000)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const val = Number(amount);
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const parts = absVal.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const res = decPart === '00' ? `₹${formattedInt}` : `₹${formattedInt}.${decPart}`;
  return isNegative ? `-${res}` : res;
}

/**
 * Formats ISO date string or Date object to readable "DD MMM YYYY"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : new Date(dateInput);
  if (isNaN(dateObj.getTime())) return dateInput;

  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns today's ISO date string YYYY-MM-DD
 */
export function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
