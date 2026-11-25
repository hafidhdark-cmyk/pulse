/**
 * Format an integer or float amount into standard Nigerian Naira display (e.g. ₦35,000 or ₦84,000.00)
 */
export function formatNaira(amount, includeDecimals = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(num).replace('NGN', '₦');
}

/**
 * Short relative or localized date display
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor((now - date) / (1000 * 60)));
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Return user avatar initials e.g. "Hafidh Dark" -> "HD"
 */
export function getInitials(name) {
  if (!name) return 'PL';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}
