/**
 * Champ / ESC/POS Thermal Receipt Printing Utility
 * Optimized for Champ 58mm & 80mm Cafe Thermal Receipt Printers
 */

// Helper to format a single line with exact column width (default 34 chars for 58mm/80mm POS paper)
export function formatReceiptLine(leftText, rightText, width = 34) {
  const left = String(leftText || '');
  const right = String(rightText || '');
  const availableSpace = width - right.length;
  
  if (left.length >= availableSpace) {
    const trimmedLeft = left.slice(0, availableSpace - 1);
    return trimmedLeft + ' ' + right;
  }
  
  const spaces = width - left.length - right.length;
  return left + ' '.repeat(Math.max(1, spaces)) + right;
}

// Generate Raw Plaintext Receipt for Champ Thermal Printer
export function generateThermalReceiptText(order) {
  const width = 34; // Fits 58mm & 80mm Champ paper rolls cleanly without text wrapping
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString();
  const systemId = localStorage.getItem('pizza_house_system_id') || 'System-1';

  let text = '';
  
  // Header
  text += '==================================\n';
  text += '         PIZZA HOUSE POS          \n';
  text += '       Contact: 7559752165        \n';
  text += '==================================\n';

  text += formatReceiptLine(`Order #: ${order.orderNumber}`, `Type: ${order.customer?.orderType || 'Dine-In'}`, width) + '\n';
  text += formatReceiptLine(`Date: ${dateStr.slice(0, 16)}`, `Dev: ${systemId}`, width) + '\n';
  text += '----------------------------------\n';
  text += formatReceiptLine(`Cust: ${order.customer?.name || 'Walk-in'}`, `Loc: ${order.customer?.tableOrAddress || 'Table'}`, width) + '\n';
  text += formatReceiptLine(`Phone: ${order.customer?.phone || 'N/A'}`, `Pay: ${order.paymentStatus || 'Cash'}`, width) + '\n';
  text += '----------------------------------\n';

  text += formatReceiptLine('QTY ITEM [SIZE]', 'AMOUNT', width) + '\n';
  text += '----------------------------------\n';

  let totalQty = 0;
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const qty = item.quantity || 1;
      totalQty += qty;
      const itemTitle = `${qty}x ${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''}`;
      const itemPrice = `Rs.${item.totalItemPrice || (item.unitPrice * qty)}`;
      text += formatReceiptLine(itemTitle, itemPrice, width) + '\n';
      if (item.extraToppings && item.extraToppings.length > 0) {
        text += ` + Top: ${item.extraToppings.join(', ')}\n`;
      }
    });
  }

  text += '----------------------------------\n';
  text += formatReceiptLine('TOTAL ITEMS:', `${totalQty}`, width) + '\n';
  text += '==================================\n';
  text += formatReceiptLine('TOTAL COST:', `Rs.${order.totalAmount}`, width) + '\n';
  text += '==================================\n';
  text += '     Thank You! Visit Again!      \n';
  text += '==================================\n\n\n\n';

  return text;
}

// Browser Thermal Print trigger using strict POS paper styling
export function printThermalReceipt(order) {
  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) {
    window.print();
    return;
  }

  const receiptContent = generateThermalReceiptText(order);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${order.orderNumber}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            font-weight: 900;
            line-height: 1.25;
            width: 54mm;
            margin: 0 auto;
            padding: 4px 1px;
            white-space: pre;
            word-break: break-all;
          }
        </style>
      </head>
      <body>${receiptContent}</body>
      <script>
        window.onload = function() {
          window.focus();
          window.print();
          setTimeout(function() { window.close(); }, 600);
        };
      </script>
    </html>
  `);
  printWindow.document.close();
}
