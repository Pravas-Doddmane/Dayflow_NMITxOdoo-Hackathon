/**
 * Format ISO date string into readable Date (e.g. "Aug 22, 2026")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Format ISO timestamp into readable Time (e.g. "09:30 AM")
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return timeStr;
  }
};

/**
 * Format Date & Time combined (e.g. "Aug 22, 2026, 09:30 AM")
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateTimeStr;
  }
};

/**
 * Format currency amount in Indian Rupees (e.g. "₹1,25,000.00")
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '—';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Get initials from a full name (e.g. "John Doe" -> "JD")
 */
export const getInitials = (name) => {
  if (!name) return 'DF';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Calculate difference in days between two dates
 */
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
