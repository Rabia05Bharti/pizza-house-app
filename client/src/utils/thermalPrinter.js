/**
 * Champ / ESC/POS Thermal Receipt Printing Utility
 * Supports 80mm & 58mm POS receipt paper rolls, Kitchen Order Tickets (KOT),
 * and direct browser thermal printing for Champ, TVS, Epson & Xprinter devices.
 */

// Helper to format string with exact column width for 80mm (48 chars) / 58mm (32 chars)
export function formatReceiptLine(leftText, rightText, width = 42) {
  const left = String(leftText || '');
  const right = String(rightText || '');
  const spaces = width - left.length - right.length;
  if (spaces <= 0) {
    return left.slice(0, width - right.length - 1) + ' ' + right;
  }
  return left + ' '.repeat(spaces) + right;
}

// Generate Raw Plaintext Receipt for Champ Thermal Printer
export function generateThermalReceiptText(order, type = 'BILL') {
  const isKOT = type === 'KOT';
  const width = 42; // standard 80mm thermal receipt line length
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString();
  const systemId = localStorage.getItem('pizza_house_system_id') || 'System-1';

  let text = '';
  
  // Header
  text += '==========================================\n';
  text += isKOT ? '          KITCHEN ORDER TICKET (KOT)      \n' : '               PIZZA HOUSE POS            \n';
  text += '         Contact: 7559752165 | WYSWYP      \n';
  text += '==========================================\n';

  text += formatReceiptLine(`Order #: ${order.orderNumber}`, `Type: ${order.customer?.orderType || 'Dine-In'}`) + '\n';
  text += formatReceiptLine(`Date: ${dateStr.slice(0, 16)}`, `Device: ${systemId}`) + '\n';
  text += '------------------------------------------\n';
  text += formatReceiptLine(`Cust: ${order.customer?.name || 'Walk-in'}`, `Loc: ${order.customer?.tableOrAddress || 'Table'}`) + '\n';
  text += formatReceiptLine(`Phone: ${order.customer?.phone || 'N/A'}`, `Pay: ${order.paymentStatus || 'Cash'}`) + '\n';
  text += '------------------------------------------\n';

  text += formatReceiptLine('QTY ITEM [SIZE]', 'AMOUNT') + '\n';
  text += '------------------------------------------\n';

  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const itemTitle = `${item.quantity}x ${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''}`;
      const itemPrice = `Rs.${item.totalItemPrice || (item.unitPrice * item.quantity)}`;
      text += formatReceiptLine(itemTitle, itemPrice) + '\n';
      if (item.extraToppings && item.extraToppings.length > 0) {
        text += `   + Toppings: ${item.extraToppings.join(', ')}\n`;
      }
    });
  }

  text += '------------------------------------------\n';
  if (!isKOT) {
    text += formatReceiptLine('SUBTOTAL:', `Rs.${order.totalAmount}`) + '\n';
    text += formatReceiptLine('TAX & GST (WYSWYP):', 'Rs.0 (Included)') + '\n';
    text += '==========================================\n';
    text += formatReceiptLine('TOTAL PAYABLE:', `Rs.${order.totalAmount}`) + '\n';
    text += '==========================================\n';
    text += '        Thank you! Visit Us Again!        \n';
  } else {
    text += '        KITCHEN COPY - PREPARE FRESH      \n';
    text += '==========================================\n';
  }

  text += '\n\n\n'; // Feed paper
  return text;
}

// Browser Thermal Print trigger using strict 80mm monochrome POS paper styling
export function printThermalReceipt(order, type = 'BILL') {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    // Fallback to window.print if popup blocked
    window.print();
    return;
  }

  const receiptContent = generateThermalReceiptText(order, type);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Champ Thermal Print - Order #${order.orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            font-weight: bold;
            line-height: 1.2;
            width: 76mm;
            margin: 0 auto;
            padding: 5px 2px;
            color: #000;
            background: #fff;
            white-space: pre-wrap;
            word-break: break-all;
          }
          .receipt-container {
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">${receiptContent}</div>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
