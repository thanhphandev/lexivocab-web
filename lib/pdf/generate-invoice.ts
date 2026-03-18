/**
 * Client-side PDF invoice generator using jsPDF.
 * Produces a professional, elegant A4 invoice for LexiVocab.
 */
import type { PaymentHistoryDto } from "@/lib/api/types";

export async function downloadInvoicePdf(tx: PaymentHistoryDto): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const margin = 20;
  const contentW = W - margin * 2;

  // Colors
  const primary = [17, 24, 39]; // Gray 900
  const secondary = [107, 114, 128]; // Gray 500
  const accent = [37, 99, 235]; // Blue 600
  const lightGray = [243, 244, 246]; // Gray 100
  const border = [229, 231, 235]; // Gray 200

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LexiVocab", margin, 25);
  doc.setFontSize(8);
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text(".", margin + 41.5, 25); // Minimalist dot accent

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("LexiVocab Platform", margin, 31);

  // ── Invoice Title & Meta ───────────────────────────────────────────────
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", W - margin, 25, { align: "right" });

  const invoiceDate = tx.paidAt
    ? new Date(tx.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date(tx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Date:", W - margin - 35, 33);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceDate, W - margin, 33, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Invoice #:", W - margin - 35, 38);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text(tx.id.slice(0, 8).toUpperCase(), W - margin, 38, { align: "right" });

  // ── Divider ────────────────────────────────────────────────────────────
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, 48, W - margin, 48);

  // ── Info Grid ──────────────────────────────────────────────────────────
  let y = 62;
  
  // Left: Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("BILL TO", margin, y);
  
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("LexiVocab Customer", margin, y + 6);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Online Subscription Service", margin, y + 11);

  // Right: Provider Info
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT METHOD", W - margin - 50, y);
  doc.setFontSize(9);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(tx.provider.toUpperCase(), W - margin, y + 6, { align: "right" });
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.setFont("helvetica", "normal");
  doc.text(tx.externalOrderId, W - margin, y + 11, { align: "right" });

  // ── Table ──────────────────────────────────────────────────────────────
  y = 90;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, y, contentW, 10, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("DESCRIPTION", margin + 5, y + 6.5);
  doc.text("AMOUNT", W - margin - 5, y + 6.5, { align: "right" });

  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("LexiVocab Premium Subscription", margin + 5, y);
  doc.text(`${tx.currency} ${tx.amount.toFixed(2)}`, W - margin - 5, y, { align: "right" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Full access to all premium features and vocabulary tools.", margin + 5, y + 5);

  // Divider
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.line(margin, y + 12, W - margin, y + 12);

  // ── Summary ────────────────────────────────────────────────────────────
  y += 25;
  const summaryX = W - margin - 60;
  
  doc.setFontSize(9);
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Subtotal:", summaryX, y);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(`${tx.currency} ${tx.amount.toFixed(2)}`, W - margin, y, { align: "right" });

  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Tax (0%):", summaryX, y + 6);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(`${tx.currency} 0.00`, W - margin, y + 6, { align: "right" });

  // Total
  y += 12;
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(summaryX - 5, y - 6, 65 + 5, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL PAID", summaryX, y + 1.5);
  doc.setFontSize(12);
  doc.text(`${tx.currency} ${tx.amount.toFixed(2)}`, W - margin - 2, y + 1.5, { align: "right" });

  // ── Status Stamp ───────────────────────────────────────────────────────
  if (tx.status === "Completed") {
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setLineWidth(1);
    doc.roundedRect(margin, y - 5, 30, 10, 1, 1, "D");
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(10);
    doc.text("PAID", margin + 15, y + 1.5, { align: "center" });
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerY = H - 30;
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.line(margin, footerY, W - margin, footerY);

  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("LexiVocab Inc.", margin, footerY + 8);
  doc.text("support@lexivocab.com  ·  lexivocab.com", margin, footerY + 12);
  
  doc.text("Thank you for your business!", W - margin, footerY + 8, { align: "right" });
  doc.text(`Generated on ${new Date().toLocaleString()}`, W - margin, footerY + 12, { align: "right" });

  // Save
  const fileName = `lexivocab-invoice-${tx.id.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(fileName);
}

