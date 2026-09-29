/**
 * Utility for printing receipts, bills and kitchen tickets to local computer printers
 * (Supports Thermal Bill K80, K58, A4/A5 desktop printers, Canon, Xprinter, Epson, Bixolon...)
 */

export interface PrintOptions {
  title?: string;
  width?: '80mm' | '58mm' | 'auto';
  autoClose?: boolean;
}

/**
 * Generates standalone, self-contained HTML for receipt printing with embedded styles.
 */
export const generatePrintableHtml = (
  contentHtml: string,
  title = 'Phiếu Thanh Toán - Hòn Cau Quán',
  width: '80mm' | '58mm' | 'auto' = '80mm'
): string => {
  const printWidth = width === '58mm' ? '58mm' : width === '80mm' ? '80mm' : '100%';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${width === 'auto' ? 'auto' : `${printWidth} auto`};
      margin: 2mm 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 6px 8px;
      width: ${printWidth};
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3, h4 {
      font-weight: 700;
      color: #000;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace, Courier, monospace; }
    .border-b { border-bottom: 1px dashed #777; }
    .border-t { border-top: 1px dashed #777; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .my-2 { margin-top: 8px; margin-bottom: 8px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .grid { display: grid; }
    .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
    .col-span-6 { grid-column: span 6; }
    .col-span-2 { grid-column: span 2; }
    .col-span-4 { grid-column: span 4; }
    img { max-width: 100%; height: auto; }
    
    /* Clean look on paper */
    @media print {
      body {
        width: 100%;
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  ${contentHtml}
  <script>
    window.onload = function() {
      // Small timeout to allow images (like QR code) to fully render
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
};

/**
 * Primary printing function:
 * 1. Creates a hidden iframe to communicate directly with OS printer dialog.
 * 2. If blocked by iframe sandbox, provides a clean direct window popup trigger.
 */
export const printElement = async (
  elementId: string,
  options: PrintOptions = {}
): Promise<boolean> => {
  const { title = 'Phiếu In Hòn Cau Quán', width = '80mm' } = options;
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Không tìm thấy phần tử có id: ${elementId}`);
    // Fallback to window.print()
    window.print();
    return false;
  }

  const contentHtml = element.innerHTML;
  const fullHtml = generatePrintableHtml(contentHtml, title, width);

  try {
    // Attempt method 1: Hidden iframe print
    let printIframe = document.getElementById('pos-print-iframe') as HTMLIFrameElement | null;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'pos-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();

      // Trigger print after iframe renders
      setTimeout(() => {
        try {
          printIframe?.contentWindow?.focus();
          printIframe?.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print restricted, using fallback window:', iframeErr);
          openPrintWindow(fullHtml, title);
        }
      }, 350);

      return true;
    }
  } catch (err) {
    console.warn('Cannot write to hidden iframe, attempting popup print window:', err);
  }

  // Method 2: Open standalone print window if iframe method fails
  return openPrintWindow(fullHtml, title);
};

/**
 * Method 2: Opens a dedicated print popup window.
 * 100% reliable across all browsers, bypasses iframe sandboxes.
 */
export const openPrintWindow = (fullHtml: string, title = 'In Hóa Đơn'): boolean => {
  try {
    const printWindow = window.open('', '_blank', 'width=450,height=700,menubar=no,toolbar=no,location=no,status=no');
    if (!printWindow) {
      // Popup blocked, fallback to standard window.print
      window.print();
      return false;
    }

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.focus();
    return true;
  } catch (err) {
    console.error('Error opening print window:', err);
    window.print();
    return false;
  }
};
