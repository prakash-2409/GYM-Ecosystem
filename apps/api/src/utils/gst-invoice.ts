import PDFDocument from 'pdfkit';

interface InvoiceData {
  invoiceNumber: string;
  gym: { name: string; address: string; gstin: string };
  member: { name: string; phone: string; memberCode: string };
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paidAt: Date;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(data.gym.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(data.gym.address, { align: 'center' });
    if (data.gym.gstin) {
      doc.text(`GSTIN: ${data.gym.gstin}`, { align: 'center' });
    }

    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown(0.5);

    // Invoice details
    doc.fontSize(10).font('Helvetica');
    const y = doc.y;
    doc.text(`Invoice No: ${data.invoiceNumber}`, 50, y);
    doc.text(`Date: ${data.paidAt.toLocaleDateString('en-IN')}`, 350, y);

    doc.moveDown(1);
    doc.text(`Bill To: ${data.member.name}`);
    doc.text(`Phone: ${data.member.phone}`);
    doc.text(`Member ID: ${data.member.memberCode}`);

    doc.moveDown(1);

    // Line separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Table header
    const tableY = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableY, { width: 200 });
    doc.text('Amount', 350, tableY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Table row
    doc.font('Helvetica');
    const rowY = doc.y;
    doc.text('Gym Membership Fee', 50, rowY, { width: 200 });
    doc.text(`₹${data.baseAmount.toFixed(2)}`, 350, rowY, { width: 100, align: 'right' });

    doc.moveDown(0.5);

    // GST
    const gstY = doc.y;
    doc.text('GST (18%)', 50, gstY, { width: 200 });
    doc.text(`₹${data.gstAmount.toFixed(2)}`, 350, gstY, { width: 100, align: 'right' });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Total
    const totalY = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Total', 50, totalY, { width: 200 });
    doc.text(`₹${data.totalAmount.toFixed(2)}`, 350, totalY, { width: 100, align: 'right' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Payment info
    doc.font('Helvetica').fontSize(9);
    doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`);
    doc.text(`Payment Status: PAID`);

    doc.moveDown(2);
    doc.fontSize(8).text('This is a computer-generated invoice and does not require a signature.', { align: 'center' });

    doc.end();
  });
}
