import { localStorageData } from "./cache";

export const formatCurrency = (value: number, locale = 'en-US') => {
  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // if the value has more than 2 decimal places, remove the extra decimal places
  const [integerPart, decimalPart] = formattedValue.split('.');
  if (decimalPart && decimalPart.length > 2) {
    const roundedDecimalPart = Number(`0.${decimalPart}`).toFixed(2).slice(2);
    return `${integerPart}.${roundedDecimalPart}`;
  }

  return formattedValue;
};

export const formattedDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-GB', options);
};

export function formatDateDMY(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const viewAvatar = (avatar?: string) => {
  const avatarUrl = avatar?.startsWith('http')
    ? avatar
    : `${process.env.BASE_URL}/api/files/_pb_users_auth_/${localStorageData('customer_id').getLocalStrage()}/${avatar}?token=${localStorageData('token').getLocalStrage()}`;
  return avatarUrl;
};

export const cleanedDescription = (description: string, maxLines = 5) => {
  const cleaned = description
    ?.replace(/\r\n/g, '<div style="height: 7px"></div>')
    ?.replace(/<h1>/g, '<h1 style="font-weight: bold;">')
    ?.replace(/<\/h1>/g, '</h1>')
    ?.replace(/<h2>/g, '<h1 style="font-weight: bold;">');

  // Create a temporary DOM element to parse the HTML and extract text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleaned || '';
  const textContent = tempDiv.textContent || '';

  const lines = textContent.split('\n').slice(0, maxLines).join('\n');
  return `<div style="display: -webkit-box; -webkit-line-clamp: ${maxLines}; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; padding: 0; margin: 0;">${lines}</div>`;
};
