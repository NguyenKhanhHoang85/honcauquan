export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateOnly = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const generateVietQRUrl = (
  amount: number,
  orderCode: string,
  bankId: string = 'MB',
  accountNo: string = '0903888666',
  accountName: string = 'HON CAU QUAN'
): string => {
  const encodedName = encodeURIComponent(accountName);
  const cleanCode = orderCode.replace('#', '').replace('-', '');
  const encodedInfo = encodeURIComponent(`THANH TOAN ${cleanCode}`);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
};

/**
 * Converts Google Drive sharing link (or open/uc link) to a direct preview image URL.
 * If not a Google Drive link, returns the original link as-is.
 */
export const convertDriveUrlToDirect = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Check if it's a Google Drive link
  if (trimmed.includes('drive.google.com')) {
    // Case 1: https://drive.google.com/file/d/{FILE_ID}/view...
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }

    // Case 2: https://drive.google.com/open?id={FILE_ID} or uc?id={FILE_ID}
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }

  return trimmed;
};

