export const formatCurrency = (value: number | string): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(typeof value === 'string' ? parseFloat(value) : value);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('pt-BR');
};

export const abbreviateNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const calculateDiscountedPrice = (price: number | string, discountPercent: number): number => {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  return priceNum * (1 - discountPercent / 100);
};