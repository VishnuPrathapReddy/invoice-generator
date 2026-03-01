
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceDetails } from './billing.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateInvoicePdf(invoice: InvoiceDetails) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    let y = 18;

    // --- Header Section ---
    doc.setFontSize(18);
    doc.setTextColor(23, 54, 93); // Dark Blue matching top left text
    doc.setFont('helvetica', 'bold');
    doc.text('SRI TIRUMALA TRAVELS', margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80); // Dark grey
    doc.setFont('helvetica', 'normal');

    // Split text so we can calculate exact height to prevent overlapping
    const companyAddress = '2ND FLOOR, 1-8, SOUTH STREET, NEAR MAIN ROAD, ALURU VILLAGE, KARAVADI, PRAKASAM, ANDHRA PRADESH, INDIA-523182';
    const addressLinesHeader = doc.splitTextToSize(companyAddress, pageWidth - (margin * 2) - 50);
    doc.text(addressLinesHeader, margin, y);

    // Calculate new Y dynamically based on number of lines
    y += (addressLinesHeader.length * 4) + 2;

    doc.setFont('helvetica', 'normal');
    doc.text('Contact: reganreddy0@gmail.com, +91 8897218014 | GSTIN: 37BWKPG2725F2ZL', margin, y);
    y += 8;

    // Logo Placeholder on the Top Right
    if (invoice.companyLogo && invoice.companyLogo.trim() !== '') {
      // Trying to infer format based on common base64 or URL structure, defaults to PNG
      let format = 'PNG';
      if (invoice.companyLogo.includes('image/jpeg')) format = 'JPEG';
      if (invoice.companyLogo.includes('image/webp')) format = 'WEBP';

      try {
        doc.addImage(invoice.companyLogo, format, pageWidth - margin - 35, 12, 35, 20);
      } catch (e) {
        console.warn("Failed to load logo image to PDF:", e);
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(23, 54, 93);
      doc.setFont('helvetica', 'bold');
      doc.text('[ LOGO ]', pageWidth - margin - 20, 20);
    }

    // Thin Blue Separator Line
    doc.setDrawColor(86, 146, 203); // Light Blue line
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Title 'TAX INVOICE'
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246); // Light Blue Title
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // --- Two Boxes Section ---
    const startY = y;
    const boxMargin = 3;
    const colWidth = (pageWidth - (margin * 2) - 6) / 2; // Split page width in half with a 6px gap

    // Setup Box Borders
    doc.setDrawColor(210, 210, 210); // Light Grey Border
    doc.setLineWidth(0.1);

    // Left Box (Billed to)
    doc.setFillColor(243, 244, 246); // Very Light Grey background for header portion
    doc.rect(margin, y, colWidth, 36, 'S'); // Outline
    doc.rect(margin, y, colWidth, 8, 'F'); // Header Fill
    doc.rect(margin, y, colWidth, 8, 'S'); // Header Outline

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed to:', margin + 4, y + 5.5);

    let leftY = y + 14;
    doc.setFontSize(9);
    doc.text((invoice.billedTo?.name || '').toUpperCase(), margin + 4, leftY);
    leftY += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize((invoice.billedTo?.address || ''), colWidth - 8);
    doc.text(addressLines, margin + 4, leftY);
    leftY += (addressLines.length * 4) + 2;

    doc.text(`Contact: ${invoice.billedTo?.contact || ''}`, margin + 4, leftY);
    leftY += 4;
    doc.text(`GSTIN: ${invoice.billedTo?.gstin || ''}`, margin + 4, leftY);


    // Right Box (Invoice info)
    const rightColX = margin + colWidth + 6;
    doc.rect(rightColX, y, colWidth, 36, 'S'); // Outline

    let rightY = y + 7;
    const labelX = rightColX + 4;
    const valueX = rightColX + 32;

    const infoRows = [
      { label: 'Invoice No', value: `:  ${invoice.id || ''}` },
      { label: 'Date', value: `:  ${invoice.date || ''}` },
      { label: 'Place of Supply', value: `:  ${invoice.placeOfSupply || ''}` },
      { label: 'Payment Mode', value: `:  ${invoice.paymentMode || ''}` }
    ];

    infoRows.forEach((row, index) => {
      const rowY = rightY + (index * 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(row.label, labelX, rowY);
      doc.text(row.value, valueX, rowY);
    });

    y = startY + 42; // Move below the grid

    // --- Items Table ---
    autoTable(doc, {
      startY: y,
      head: [['#', 'Service Description', 'HSN /\nSAC', 'Quantity', 'Rate', 'Svc.\nCharge', 'GST%', 'GST\nAmt', 'Total']],
      body: (invoice.items || []).map((item: any, index: number) => [
        index + 1,
        item.description || '-',
        item.hsnSac || '-',
        item.quantity || 1,
        parseFloat(item.rate || 0).toFixed(2),
        parseFloat(item.serviceCharge || 0).toFixed(2),
        (item.gstPercent || 0) + '%',
        parseFloat(item.gstAmount || 0).toFixed(2),
        parseFloat(item.total || 0).toFixed(2)
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [240, 248, 255], // Light Blue header background matching image
        textColor: [23, 54, 93], // Dark Blue text matching image
        lineColor: [210, 210, 210], // Grey grid lines
        lineWidth: 0.1,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 8
      },
      styles: {
        lineColor: [210, 210, 210],
        lineWidth: 0.1,
        fontSize: 8, // Smaller text
        cellPadding: 3,
        valign: 'middle',
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 'auto', halign: 'left' }, // Service Description
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 14 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 16 },
        8: { halign: 'center', cellWidth: 14 }
      },
      // Override text alignment for body columns dynamically to avoid center on text body
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.halign = 'left';
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Page break logic for footer if needed
    if (finalY > pageHeight - 85) {
      doc.addPage();
      y = 20;
    } else {
      y = finalY;
    }

    // --- Footer Section ---
    const leftColWidth = pageWidth - margin - 80 - margin;
    const footerStartY = y;

    // Bank Details Title
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', margin, footerStartY);
    doc.text('Amount in Words:', margin + 65, footerStartY); // Parallel

    let footerLeftY = footerStartY + 5;
    const bankDetailsY = footerLeftY;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Name:', margin, footerLeftY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.bankDetails?.bankName || '-', margin + 18, footerLeftY);

    doc.setFont('helvetica', 'bold');
    doc.text('A/C No:', margin, footerLeftY + 4);
    doc.setFont('helvetica', 'normal');
    // Ensure account numbers render perfectly
    doc.text(String(invoice.bankDetails?.accountNo || '-'), margin + 18, footerLeftY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text('IFSC:', margin, footerLeftY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.bankDetails?.ifsc || '-', margin + 18, footerLeftY + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('UPI ID:', margin, footerLeftY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.bankDetails?.upiId || '-', margin + 18, footerLeftY + 12);

    // Prepare Totals Box Layout Boundaries First
    const totalsTableWidth = 80; // Safe width for numbers
    const totalsTableX = pageWidth - margin - totalsTableWidth;

    // Write amount in words
    const safeAmountWidth = totalsTableX - (margin + 65) - 5; // Dynamically fill space before the table begins
    const amountLines = doc.splitTextToSize(invoice.totals?.amountInWords || '', safeAmountWidth);
    doc.text(amountLines, margin + 65, footerLeftY);

    footerLeftY = footerLeftY + Math.max(18, amountLines.length * 4) + 6;

    // Declaration
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Declaration & Terms:', margin, footerLeftY);
    footerLeftY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const terms = [
      '• Processing/Convenience fee includes GST. In the event the customer is eligible for discounts, the processing/convenience fee will be accordingly calculated.',
      '• This is an electronically generated invoice and does not require a physical signature.'
    ];
    // Strictly limit terms width to prevent extending into the totals table
    const safeTermsWidth = totalsTableX - margin - 5;
    const termsLines = doc.splitTextToSize(terms.join('\n'), safeTermsWidth);
    doc.text(termsLines, margin, footerLeftY);

    autoTable(doc, {
      startY: footerStartY, // Start explicitly at the top of the footer cleanly
      margin: { left: totalsTableX, right: margin },
      tableWidth: totalsTableWidth,
      body: [
        ['Base Amount :', parseFloat(String(invoice.totals?.baseAmount || 0)).toFixed(2)],
        ['Service Charge :', parseFloat(String(invoice.totals?.serviceCharge || 0)).toFixed(2)],
        ['CGST :', parseFloat(String(invoice.totals?.cgst || 0)).toFixed(2)],
        ['SGST :', parseFloat(String(invoice.totals?.sgst || 0)).toFixed(2)],
        ['Round Off :', parseFloat(String(invoice.totals?.roundOff || 0)).toFixed(2)],
        ['Grand Total  ', 'Rs. ' + parseFloat(String(invoice.totals?.grandTotal || 0)).toFixed(2)]
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [210, 210, 210],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', halign: 'right' }, // Labels
        1: { cellWidth: 40, fontStyle: 'bold', halign: 'right' }  // Values
      },
      didParseCell: (data) => {
        if (data.row.index === 5) { // Grand Total highlights
          data.cell.styles.fillColor = [240, 248, 255];
          data.cell.styles.textColor = [23, 54, 93];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 9;
        }
      }
    });

    // --- Signature ---
    const signatureY = (doc as any).lastAutoTable.finalY + 20;

    if (invoice.companySignature && invoice.companySignature.trim() !== '') {
      let format = 'PNG';
      if (invoice.companySignature.includes('image/jpeg')) format = 'JPEG';
      if (invoice.companySignature.includes('image/webp')) format = 'WEBP';

      try {
        doc.addImage(invoice.companySignature, format, pageWidth - margin - 35, signatureY - 5, 35, 15);
      } catch (e) {
        console.warn("Failed to load signature image to PDF:", e);
      }
    } else {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Authorised Signatory', pageWidth - margin, signatureY + 15, { align: 'right' });
    }

    // Always draw signature label mapping
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('For SRI TIRUMALA TRAVELS', pageWidth - margin, signatureY + 20, { align: 'right' });

    doc.save(`Invoice_${invoice.id || 'Draft'}.pdf`);
  }
}
