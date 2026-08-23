import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, ImageRun,
  Header, Footer, TabStopPosition, TabStopType,
} from 'docx';

// Helper: create table cell with text
function cell(text: string, opts?: {
  width?: number; bold?: boolean; align?: AlignmentType;
  shading?: string; size?: number; rtl?: boolean; colspan?: number;
}) {
  const { width = 800, bold = false, align = AlignmentType.LEFT, shading, size = 18, rtl, colspan } = opts || {};
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: colspan,
    shading: shading ? { fill: shading, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: align,
      bidirectional: rtl || false,
      children: [new TextRun({ text, bold, size, rtl: rtl || false })],
    })],
  });
}

// Helper: Arabic cell (RTL)
function arCell(text: string, opts?: { width?: number; bold?: boolean; shading?: string }) {
  return cell(text, { ...opts, align: AlignmentType.RIGHT, rtl: true, size: 16 });
}

// Helper: English cell (LTR)
function enCell(text: string, opts?: { width?: number; bold?: boolean; align?: AlignmentType; shading?: string }) {
  return cell(text, { ...opts, align: opts?.align || AlignmentType.LEFT, rtl: false, size: 16 });
}

// Convert image URL to base64
async function fetchImageAsBase64(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  } catch { return null; }
}

export async function generateInvoiceDocx(data: {
  companyName: string;
  companyNameAr?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyVat?: string;
  companyCr?: string;
  companyEmail?: string;
  companyWebsite?: string;
  currency?: string;
  taxPercent?: string;
  customerName?: string;
  customerNameAr?: string;
  customerVat?: string;
  customerCr?: string;
  customerAddress?: string;
  customerAddressAr?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPo?: string;
  invoiceNo?: string;
  workedMonth?: string;
  paymentType?: string;
  cashier?: string;
  date?: string;
  time?: string;
  dueDate?: string;
  poNumber?: string;
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  dueInWords?: string;
  notes?: string;
  notesAr?: string;
  items: Array<{ no: number; name: string; nameAr?: string; unit?: string; totalHour?: number; rate: number; total: number }>;
  qrBase64?: string;
}) {
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const {
    companyName = 'YAFCO AL ARABIAH EST.', companyNameAr = 'مؤسسة يافكو العربية',
    companyLogo, companyAddress = 'Saudi Arabia - Yanbu Al Bahr - P.O.Box: 2326',
    companyPhone = '', companyVat = '300995897900003', companyCr = '4700012896',
    companyEmail = 'info@yafco.com.sa', companyWebsite = 'www.yafco.com.sa',
    currency = 'SAR', taxPercent = '15',
    customerName = 'Walk-in Customer', customerNameAr = '', customerVat = '',
    customerCr = '', customerAddress = '', customerAddressAr = '',
    customerEmail = '', customerPhone = '', customerPo = '',
    invoiceNo = '', workedMonth = '', paymentType = 'Credit',
    cashier = 'مدير النظام', date = '', time = '', dueDate = '', poNumber = '',
    subtotal = 0, vatTotal = 0, grandTotal = 0, dueInWords = '',
    notes, notesAr, items = [], qrBase64,
  } = data;

  // Fetch images as base64
  const [logoBuffer, qrBuffer] = await Promise.all([
    companyLogo ? fetchImageAsBase64(companyLogo) : Promise.resolve(null),
    qrBase64 ? fetchImageAsBase64(qrBase64) : fetchImageAsBase64(
      `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({
        seller: companyNameAr || companyName, vat: companyVat, total: grandTotal.toFixed(2),
        tax: vatTotal.toFixed(2), date: date || new Date().toISOString(),
      })))))}`
    ),
  ]);

  const totalHours = items.reduce((s, i) => s + (i.totalHour || 0), 0);

  // Cell widths for header table (total ~6000 DXA for 18cm width)
  const W = { logo: 1400, center: 3200, qr: 1400 };

  // ========== HEADER TABLE ==========
  const headerCells: any[] = [];

  // Logo cell
  headerCells.push(new TableCell({
    width: { size: W.logo, type: WidthType.DXA },
    shading: { fill: 'auto', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: 'center',
    children: logoBuffer ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: logoBuffer, transformation: { width: 90, height: 90 } })],
    })] : [new Paragraph({ children: [new TextRun({ text: '' })] })],
  }));

  // Company info center
  const companyParagraphs: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: companyName, bold: true, size: 36, color: 'A6272C' })],
    }),
  ];
  if (companyNameAr) {
    companyParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [new TextRun({ text: companyNameAr, bold: true, size: 28, color: '1e3a8a', rtl: true })],
    }));
  }
  companyParagraphs.push(
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: companyAddress || '', size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: companyEmail || '', size: 18, color: '0563C1', underline: {} })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `VAT No: ${companyVat}  |  CR No: ${companyCr}`, size: 16 })] }),
  );

  headerCells.push(new TableCell({
    width: { size: W.center, type: WidthType.DXA },
    shading: { fill: 'auto', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 100, bottom: 100, left: 150, right: 150 },
    verticalAlign: 'center',
    children: companyParagraphs,
  }));

  // QR cell
  headerCells.push(new TableCell({
    width: { size: W.qr, type: WidthType.DXA },
    shading: { fill: 'auto', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: 'center',
    children: qrBuffer ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: qrBuffer, transformation: { width: 110, height: 110 } })],
    })] : [new Paragraph({ children: [new TextRun({ text: '' })] })],
  }));

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [W.logo, W.center, W.qr],
    rows: [new TableRow({ children: headerCells })],
  });

  // ========== TITLE BAR ==========
  const titleBar = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [6000],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 6000, type: WidthType.DXA },
        shading: { fill: 'E7E7E7', type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 100, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'فاتورة ضريبية - TAX INVOICE', bold: true, size: 26, color: '000000' })],
        })],
      })],
    })],
  });

  // ========== META INFO BAR ==========
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1200, 1800, 1200, 1800],
    rows: [
      new TableRow({ children: [
        enCell('Worked Month:', { bold: true, width: 1200 }),
        enCell(workedMonth || '—', { width: 1800 }),
        enCell('Date:', { bold: true, width: 1200 }),
        enCell(date || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Invoice. No:', { bold: true, width: 1200 }),
        enCell(invoiceNo || '—', { width: 1800 }),
        enCell('Time:', { bold: true, width: 1200 }),
        enCell(time || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Payment:', { bold: true, width: 1200 }),
        enCell(paymentType || 'Credit', { width: 1800 }),
        enCell('Due Date:', { bold: true, width: 1200 }),
        enCell(dueDate || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Cashier:', { bold: true, width: 1200 }),
        enCell(cashier || 'مدير النظام', { width: 1800 }),
        enCell('PO No:', { bold: true, width: 1200 }),
        enCell(poNumber || '—', { width: 1800 }),
      ]}),
    ],
  });

  // ========== CUSTOMER DETAILS ==========
  const custTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1200, 1800, 1200, 1800],
    rows: [
      new TableRow({ children: [
        enCell('Customer Name', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(`${customerName}${customerNameAr ? ' / ' + customerNameAr : ''}`, { width: 1800 }),
        arCell('اسم العميل', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerNameAr || customerName || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Tax No (VAT)', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(customerVat || '—', { width: 1800 }),
        arCell('الرقم الضريبي', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerVat || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('CR No', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(customerCr || '—', { width: 1800 }),
        arCell('رقم السجل', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerCr || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Address', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(`${customerAddress}${customerAddressAr ? ' / ' + customerAddressAr : ''}`, { width: 1800 }),
        arCell('العنوان', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerAddressAr || customerAddress || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Email', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(customerEmail || '—', { width: 1800 }),
        arCell('البريد الإلكتروني', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerEmail || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('Phone', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(customerPhone || '—', { width: 1800 }),
        arCell('الجوال', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerPhone || '—', { width: 1800 }),
      ]}),
      new TableRow({ children: [
        enCell('PO No', { bold: true, width: 1200, shading: 'f9f9ff' }),
        enCell(customerPo || customerCr || '—', { width: 1800 }),
        arCell('رقم طلب الشراء', { bold: true, width: 1200, shading: 'f9f9ff' }),
        arCell(customerPo || customerCr || '—', { width: 1800 }),
      ]}),
    ],
  });

  // ========== LINE ITEMS TABLE ==========
  const itemColWidths = [400, 1500, 500, 900, 900, 900, 900, 900];

  const itemHeaderCells: any[] = [
    enCell('تسلسل\nSr. No.', { bold: true, align: AlignmentType.CENTER, width: 400, shading: 'E7E7E7' }),
    enCell('المسمى الوظيفي\nJob Description', { bold: true, align: AlignmentType.CENTER, width: 1500, shading: 'E7E7E7' }),
    enCell('الوحدة\nUnit', { bold: true, align: AlignmentType.CENTER, width: 500, shading: 'E7E7E7' }),
    enCell('مجموع الساعات\nTotal Hour', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'E7E7E7' }),
    enCell('سعر الساعة\nRate/Hour', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'E7E7E7' }),
    enCell('الإجمالي\nTotal', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'E7E7E7' }),
    enCell('ض القيمة المضافة 15%\nVAT 15%', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'E7E7E7' }),
    enCell('الاجمالي بالضريبة\nGrand Total', { bold: true, align: AlignmentType.CENTER, width: 900, shading: 'E7E7E7' }),
  ];

  const itemRows: any[] = [
    new TableRow({ tableHeader: true, children: itemHeaderCells }),
  ];

  items.forEach(i => {
    const vat = i.total * 0.15;
    const grand = i.total * 1.15;
    itemRows.push(new TableRow({
      children: [
        cell(String(i.no), { width: 400, align: AlignmentType.CENTER }),
        enCell(i.name || '', { width: 1500 }),
        enCell(i.unit || 'Hour', { width: 500, align: AlignmentType.CENTER }),
        cell(String(i.totalHour || 0), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(i.rate), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(i.total), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(vat), { width: 900, align: AlignmentType.CENTER }),
        cell(fmt(grand), { width: 900, align: AlignmentType.CENTER }),
      ],
    }));
  });

  // Totals row
  itemRows.push(new TableRow({
    children: [
      { ...enCell('Total', { bold: true, width: 2400, colspan: 3, shading: 'E7E7E7' }), columnSpan: 3 },
      cell(String(totalHours), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell('', { width: 900 }),
      cell(fmt(subtotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell(fmt(vatTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
      cell(fmt(grandTotal), { bold: true, width: 900, align: AlignmentType.CENTER }),
    ].filter(Boolean),
  }));

  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: itemColWidths,
    rows: itemRows,
  });

  // ========== TOTALS SUMMARY ==========
  const totalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4400, 1600],
    rows: [
      new TableRow({ children: [
        arCell('الاجمالي بدون الضریبة — Total', { bold: true, width: 4400 }),
        enCell(fmt(subtotal), { width: 1600 }),
      ]}),
      new TableRow({ children: [
        arCell(`ض. القیمة المضافة ${taxPercent}% — VAT ${taxPercent}%`, { bold: true, width: 4400 }),
        enCell(fmt(vatTotal), { width: 1600 }),
      ]}),
      new TableRow({ children: [
        arCell('إجمالي المبالغ المستحقة — Due', { bold: true, width: 4400 }),
        enCell(fmt(grandTotal), { bold: true, width: 1600 }),
      ]}),
    ],
  });

  // ========== FOOTER ==========
  const footer = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [6000],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 6000, type: WidthType.DXA },
        shading: { fill: 'E7E7E7', type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 100, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Website: ${companyWebsite || ''}`, size: 18, color: '000000' })],
        })],
      })],
    })],
  });

  // ========== BUILD DOCUMENT ==========
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri' }, paragraph: { spacing: { line: 240 } } },
        heading1: { run: { font: 'Calibri', size: 36, bold: true, color: 'A6272C' } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840, orientation: 'portrait' },
          margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
        },
      },
      children: [
        headerTable,
        new Paragraph({ spacing: { before: 200 } }),
        titleBar,
        new Paragraph({ spacing: { before: 200 } }),
        metaTable,
        new Paragraph({ spacing: { before: 200 } }),
        custTable,
        new Paragraph({ spacing: { before: 200 } }),
        itemsTable,
        new Paragraph({ spacing: { before: 200 } }),
        totalsTable,
        new Paragraph({ spacing: { before: 200 } }),
        ...(dueInWords ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Due: ${dueInWords} ${currency || 'SAR'}`, bold: true, size: 20 })],
        })] : []),
        new Paragraph({ spacing: { before: 200 } }),
        footer,
      ],
    }],
  });

  return doc;
}
