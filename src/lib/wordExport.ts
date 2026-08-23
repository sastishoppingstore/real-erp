// Word (.docx) Export Service - Pixel-perfect replica of YAFCA PDF invoice
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  Header,
  Footer,
  PageBreak,
  ImageRun,
  VerticalAlign,
  TabStopPosition,
  TabStopType,
  Underline,
} from 'docx';

// Helper to create a cell with text
function cell(text: string, opts?: { width?: number; bold?: boolean; align?: AlignmentType; shading?: string; rtl?: boolean; size?: number }) {
  const { width = 1000, bold = false, align = AlignmentType.LEFT, shading, rtl, size = 20 } = opts || {};
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { fill: shading, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: align,
      bidirectional: rtl || false,
      children: [new TextRun({ text, bold, size, rtl: rtl || false })],
    })],
  });
}

// Helper for Arabic text cell
function arCell(text: string, opts?: { width?: number; bold?: boolean; size?: number; shading?: string }) {
  return cell(text, { ...opts, align: AlignmentType.RIGHT, rtl: true, size: opts?.size || 18 });
}

// Helper for English text cell
function enCell(text: string, opts?: { width?: number; bold?: boolean; align?: AlignmentType; size?: number; shading?: string }) {
  return cell(text, { ...opts, align: opts?.align || AlignmentType.LEFT, rtl: false, size: opts?.size || 18 });
}

export async function generateInvoiceDocx(data: {
  companyName: string;
  companyNameAr: string;
  companyLogo?: string;
  companyAddress: string;
  companyAddressAr: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyVat: string;
  companyCr?: string;
  companyStamp?: string;
  customerName: string;
  customerNameAr?: string;
  customerVat?: string;
  customerCr?: string;
  customerAddress?: string;
  invoiceNo: string;
  workedMonth?: string;
  paymentType?: string;
  cashier?: string;
  date?: string;
  time?: string;
  dueDate?: string;
  poNumber?: string;
  items: Array<{ no: number; description?: string; descriptionAr?: string; unit?: string; totalHour?: number; rate?: number; total?: number; vat?: number; grandTotal?: number }>;
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  dueInWords?: string;
  vatPercent?: number;
}) {
  const {
    companyName, companyNameAr, companyLogo, companyAddress, companyAddressAr, companyPhone,
    companyEmail, companyWebsite, companyVat, companyCr, companyStamp,
    customerName, customerNameAr, customerVat, customerCr, customerAddress,
    invoiceNo, workedMonth, paymentType, cashier, date, time, dueDate, poNumber,
    items, subtotal, vatTotal, grandTotal, dueInWords, vatPercent = 15,
  } = data;

  const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
  const borders = { top: border, bottom: border, left: border, right: border };

  // Calculate total hours
  const totalHours = items.reduce((s, i) => s + (i.totalHour || 0), 0);

  // Format money
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // QR code URL
  const qrData = btoa(unescape(encodeURIComponent(JSON.stringify({
    seller: companyNameAr || companyName, vat: companyVat,
    total: grandTotal.toFixed(2), tax: vatTotal.toFixed(2), date: date || new Date().toISOString(),
  }))));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

  // Fetch logo and QR as base64
  const fetchImageAsBase64 = async (url: string): Promise<Buffer | null> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      return Buffer.from(buffer);
    } catch {
      return null;
    }
  };

  const [logoBuffer, qrBuffer, stampBuffer] = await Promise.all([
    companyLogo ? fetchImageAsBase64(companyLogo) : Promise.resolve(null),
    fetchImageAsBase64(qrUrl),
    companyStamp ? fetchImageAsBase64(companyStamp) : Promise.resolve(null),
  ]);

  const children: any[] = [];

  // ===== HEADER ZONE =====
  // Logo (left) | Company Name (center) | QR (right)
  const headerCells: any[] = [];

  // Logo cell
  if (logoBuffer) {
    headerCells.push(new TableCell({
      width: { size: 1200, type: WidthType.DXA },
      borders,
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 90, height: 90 } })],
      })],
    }));
  } else {
    headerCells.push(cell('', { width: 1200 }));
  }

  // Company name center
  headerCells.push(new TableCell({
    width: { size: 3800, type: WidthType.DXA },
    borders,
    margins: { top: 100, bottom: 100, left: 150, right: 150 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: companyNameAr, bold: true, size: 36, color: '8B1A1A', rtl: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: companyName, bold: true, size: 24, color: '1e3a8a' })],
      }),
    ],
  }));

  // QR code cell
  if (qrBuffer) {
    headerCells.push(new TableCell({
      width: { size: 1200, type: WidthType.DXA },
      borders,
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: qrBuffer, transformation: { width: 110, height: 110 } })],
      })],
    }));
  } else {
    headerCells.push(cell('', { width: 1200 }));
  }

  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1200, 3800, 1200],
    rows: [new TableRow({ children: headerCells })],
  }));

  // ===== TITLE BAR =====
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [6200],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        margins: { top: 100, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'فاتورة ضريبية', bold: true, size: 28, color: '000000', rtl: true }),
            new TextRun({ text: '  -  ', size: 28 }),
            new TextRun({ text: 'TAX INVOICE', bold: true, size: 28, color: '000000' }),
          ],
        })],
      })],
    })],
  }));

  // ===== META INFO BAR =====
  const metaRows: any[][] = [
    [
      enCell('Worked Month:', { bold: true, width: 1000 }),
      enCell(workedMonth || '—', { width: 2100 }),
      enCell('Date:', { bold: true, width: 1000 }),
      enCell(date || '—', { width: 2100 }),
    ],
    [
      enCell('Invoice. No:', { bold: true, width: 1000 }),
      enCell(invoiceNo, { width: 2100 }),
      enCell('Time:', { bold: true, width: 1000 }),
      enCell(time || '—', { width: 2100 }),
    ],
    [
      enCell('Payment:', { bold: true, width: 1000 }),
      enCell(paymentType || 'Credit', { width: 2100 }),
      enCell('Due Date:', { bold: true, width: 1000 }),
      enCell(dueDate || '—', { width: 2100 }),
    ],
    [
      enCell('Cashier:', { bold: true, width: 1000 }),
      enCell(cashier || 'مدير النظام', { width: 2100 }),
      enCell('PO No:', { bold: true, width: 1000 }),
      enCell(poNumber || '—', { width: 2100 }),
    ],
  ];

  const metaCells: any[] = metaRows.map(row => new TableRow({ children: row }));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1000, 2100, 1000, 2100],
    rows: metaRows.map((row) => new TableRow({ children: row })),
  }));

  // ===== COMPANY / CLIENT TWO-COLUMN BLOCK =====
  const companyClientRows: any[][] = [
    [
      enCell('Company:', { bold: true, width: 800 }),
      enCell(companyName, { bold: true, width: 1800 }),
      arCell('الشركة:', { bold: true, width: 500 }),
      arCell(companyNameAr, { bold: true, width: 2100 }),
      enCell('Client:', { bold: true, width: 700 }),
      enCell(`${customerName}${customerNameAr ? ' - ' + customerNameAr : ''}`, { width: 1800 }),
    ],
    [
      enCell('VAT No:', { bold: true, width: 800 }),
      enCell(companyVat, { width: 1800 }),
      arCell('الرقم الضريبي:', { bold: true, width: 500 }),
      arCell(companyVat, { width: 2100 }),
      enCell('Tax No:', { bold: true, width: 700 }),
      enCell(customerVat || '—', { width: 1800 }),
    ],
    [
      enCell('Address:', { bold: true, width: 800 }),
      enCell(companyAddress, { width: 1800 }),
      arCell('العنوان:', { bold: true, width: 500 }),
      arCell(companyAddressAr, { width: 2100 }),
      enCell('Address:', { bold: true, width: 700 }),
      enCell(customerAddress || '—', { width: 1800 }),
    ],
    [
      enCell('CR No:', { bold: true, width: 800 }),
      enCell(companyCr || '—', { width: 1800 }),
      arCell('رقم السجل:', { bold: true, width: 500 }),
      arCell(companyCr || '—', { width: 2100 }),
      enCell('CR:', { bold: true, width: 700 }),
      enCell(customerCr || '—', { width: 1800 }),
    ],
    [
      enCell('Email:', { bold: true, width: 800 }),
      enCell(companyEmail || '', { width: 1800 }),
      arCell('البريد:', { bold: true, width: 500 }),
      arCell(companyEmail || '', { width: 2100 }),
      enCell('Phone:', { bold: true, width: 700 }),
      enCell(companyPhone || '', { width: 1800 }),
    ],
  ];

  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [800, 1800, 500, 2100, 700, 1800],
    rows: companyClientRows.map((row) => new TableRow({ children: row })),
  }));

  // ===== LINE ITEMS TABLE =====
  const tblColWidths = [500, 1500, 500, 900, 900, 900, 900, 900];

  // Header row (bilingual stacked)
  const headerCells = [
    enCell('#', { bold: true, align: AlignmentType.CENTER, width: 500, shading: 'D9D9D9' }),
    arCell('تسلسل', { bold: true, align: AlignmentType.CENTER, width: 500, shading: 'D9D9D9' }),
    enCell('Job Description', { bold: true, align: AlignmentType.CENTER, width: 1500, shading: 'D9D9D9' }),
    arCell('المسمى الوظيفي', { bold: true, align: AlignmentType.CENTER, width: 1500, shading: 'D9D9D9' }),
    enCell('Unit', { bold: true, align: AlignmentType.CENTER, width: 500, shading: 'D9D9D9' }),
    arCell('الوحدة', { bold: true, align: AlignmentType.CENTER, width: 500, shading: 'D9D9D9' }),
    enCell('Total Hour', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    arCell('مجموع الساعات', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    enCell('Rate/Hour', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    arCell('سعر الساعة', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    enCell('Total', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    arCell('الإجمالي', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    enCell(`VAT ${vatPercent}%`, { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    arCell('ض القيمة المضافة', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    enCell('Grand Total', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
    arCell('الاجمالي بالضريبة', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'D9D9D9' }),
  ];

  const tblRows = [new TableRow({ children: headerCells })];

  // Data rows
  items.forEach((item) => {
    tblRows.push(new TableRow({
      children: [
        cell(String(item.no), { width: 500, align: AlignmentType.CENTER }),
        arCell(String(item.no), { width: 500, align: AlignmentType.CENTER }),
        enCell(item.description || '', { width: 1500 }),
        arCell(item.descriptionAr || '', { width: 1500 }),
        enCell(item.unit || 'Hour', { width: 500, align: AlignmentType.CENTER }),
        arCell('ساعة', { width: 500, align: AlignmentType.CENTER }),
        cell(String(item.totalHour || 0), { width: 900, align: AlignmentType.CENTER }),
        arCell(String(item.totalHour || 0), { width: 900, align: AlignmentType.CENTER }),
        cell(String(item.rate || 0), { width: 900, align: AlignmentType.CENTER }),
        arCell(String(item.rate || 0), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(item.total || 0), { width: 900, align: AlignmentType.CENTER }),
        arCell(fmt(item.total || 0), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(item.vat || 0), { width: 900, align: AlignmentType.CENTER }),
        arCell(fmt(item.vat || 0), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(item.grandTotal || 0), { width: 900, align: AlignmentType.CENTER }),
        arCell(fmt(item.grandTotal || 0), { width: 900, align: AlignmentType.CENTER }),
      ],
    }));
  });

  // Totals row
  tblRows.push(new TableRow({
    children: [
      cell('', { width: 500 }),
      arCell('', { width: 500 }),
      enCell('TOTAL', { bold: true, width: 1500 }),
      arCell('الإجمالي', { bold: true, width: 1500 }),
      cell('', { width: 500 }),
      arCell('', { width: 500 }),
      cell(String(totalHours), { bold: true, width: 900, align: AlignmentType.CENTER }),
      arCell(String(totalHours), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell('', { width: 900 }),
      arCell('', { width: 900 }),
      cell(fmt(subtotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      arCell(fmt(subtotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell(fmt(vatTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      arCell(fmt(vatTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell(fmt(grandTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      arCell(fmt(grandTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
    ],
  }));

  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [500, 500, 1500, 1500, 500, 500, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900],
    rows: tblRows,
  }));

  // ===== TOTALS SUMMARY BLOCK =====
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [5000, 1200],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [new TextRun({ text: 'الاجمالي بدون الضريبة — Total :', bold: true, size: 22, rtl: true })],
              }),
            ],
          }),
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: fmt(subtotal), bold: true, size: 22 })],
            })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: `ض. القيمة المضافة ${vatPercent}% — VAT ${vatPercent}% :`, bold: true, size: 22, rtl: true })],
            })],
          }),
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: fmt(vatTotal), bold: true, size: 22 })],
            })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: 'إجمالي المبالغ المستحقة — Due :', bold: true, size: 24, rtl: true })],
            })],
          }),
          new TableCell({
            borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: fmt(grandTotal), bold: true, size: 26 })],
            })],
          }),
        ],
      }),
    ],
  }));

  // ===== DUE IN WORDS =====
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3100, 3100],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ text: `Due: ${dueInWords || ''} SAR`, bold: true, size: 20 })],
          })],
        }),
        new TableCell({
          borders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            children: [new TextRun({ text: `إجمالي المبالغ المستحقة: ${dueInWords || ''} ريال`, bold: true, size: 20, rtl: true })],
          })],
        }),
      ],
    })],
  }));

  // ===== FOOTER ZONE =====
  // Gray band with website
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [6200],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, left: border, right: border },
        shading: { fill: '6B7280', type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 100, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Website: ${companyWebsite || ''}`, bold: true, size: 20, color: 'FFFFFF' })],
        })],
      })],
    })],
  }));

  // Stamp centered
  if (stampBuffer) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new ImageRun({ data: stampBuffer, transformation: { width: 130, height: 130 } })],
    }));
  }

  // Build document
  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial' } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // A4
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children,
    }],
  });

  return doc;
}
