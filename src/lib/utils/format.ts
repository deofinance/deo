// Formatting utilities

/**
 * Format number with decimals
 */
export function formatNumber(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(decimals);
}

/**
 * Format currency (USDC)
 */
export function formatCurrency(value: number | string, symbol: string = '$'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format wallet address (shortened)
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Parse amount string to wei/smallest unit
 */
export function parseAmount(amount: string, decimals: number = 6): string {
  const num = parseFloat(amount);
  const wei = Math.floor(num * Math.pow(10, decimals));
  return wei.toString();
}

/**
 * Format wei to human readable
 */
export function formatWei(wei: string | bigint, decimals: number = 6): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : wei;
  const divisor = BigInt(Math.pow(10, decimals));
  const whole = weiNum / divisor;
  const remainder = weiNum % divisor;
  return `${whole}.${remainder.toString().padStart(decimals, '0')}`;
}
