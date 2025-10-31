// Currency utility functions
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NZD': 'NZ$', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'ZAR': 'R', 'NGN': '₦', 'EGP': 'E£', 'KES': 'KSh', 'GHS': '₵', 'TZS': 'TSh', 'UGX': 'USh', 'ETB': 'Br', 'MAD': 'MAD', 'TND': 'DT', 'DZD': 'DA', 'KRW': '₩', 'THB': '฿'
  };
  return symbols[currencyCode] || '$';
};

export const getCurrencyName = (currencyCode: string): string => {
  const names: { [key: string]: string } = {
    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound', 'CAD': 'Canadian Dollar', 'AUD': 'Australian Dollar', 'JPY': 'Japanese Yen', 'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'INR': 'Indian Rupee', 'BRL': 'Brazilian Real', 'MXN': 'Mexican Peso', 'SGD': 'Singapore Dollar', 'HKD': 'Hong Kong Dollar', 'NZD': 'New Zealand Dollar', 'SEK': 'Swedish Krona', 'NOK': 'Norwegian Krone', 'DKK': 'Danish Krone', 'ZAR': 'South African Rand', 'NGN': 'Nigerian Naira', 'EGP': 'Egyptian Pound', 'KES': 'Kenyan Shilling', 'GHS': 'Ghanaian Cedi', 'TZS': 'Tanzanian Shilling', 'UGX': 'Ugandan Shilling', 'ETB': 'Ethiopian Birr', 'MAD': 'Moroccan Dirham', 'TND': 'Tunisian Dinar', 'DZD': 'Algerian Dinar', 'KRW': 'South Korean Won', 'THB': 'Thai Baht'
  };
  return names[currencyCode] || 'US Dollar';
};

// Get the current user's currency setting
export const getCurrentCurrency = (): string => {
  return localStorage.getItem('crm-currency') || 'USD';
};

// Format currency amount with user's selected currency
export const formatCurrency = (amount: number | null | undefined, currencyCode?: string): string => {
  // Handle null, undefined, or NaN
  if (amount == null || isNaN(amount as number)) {
    amount = 0;
  }
  
  const currency = currencyCode || getCurrentCurrency();
  const symbol = getCurrencySymbol(currency);
  
  // For currencies that don't use standard decimal places
  if (['JPY', 'KRW'].includes(currency)) {
    return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  
  // For other currencies, use 2 decimal places
  return `${symbol}${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Format currency for display in tables and cards
export const formatCurrencyCompact = (amount: number | null | undefined, currencyCode?: string): string => {
  // Handle null, undefined, or NaN
  if (amount == null || isNaN(amount as number)) {
    amount = 0;
  }
  
  const currency = currencyCode || getCurrentCurrency();
  const symbol = getCurrencySymbol(currency);
  
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount, currency);
  }
};
