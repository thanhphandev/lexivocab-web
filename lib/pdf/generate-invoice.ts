/**
 * Client-side PDF invoice generator using jsPDF.
 * Đồng bộ thiết kế với Email Template LexiVocab (2026).
 */
import type { PaymentHistoryDto } from "@/lib/api/types";

export async function downloadInvoicePdf(tx: PaymentHistoryDto): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const margin = 20;
  const contentW = W - margin * 2;

  // Palette màu từ Email
  const primary = [17, 24, 39];    // #111827 (Gray 900)
  const secondary = [75, 85, 99];  // #4b5563 (Gray 600)
  const accent = [235, 103, 37];   // #eb6725 (LexiVocab Orange)
  const muted = [156, 163, 175];   // #9ca3af (Gray 400)
  const lightBg = [249, 250, 251]; // #f9fafb (Gray 50)
  const border = [229, 231, 235];  // #e5e7eb (Gray 200)

  // ── Header & Brand ────────────────────────────────────────────────────
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LexiVocab", margin, 25);

  // Dấu chấm cam đặc trưng
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.setFontSize(22);
  doc.text(".", margin + 38, 25);

  // Invoice Label
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", W - margin, 25, { align: "right" });

  // ── Info Grid ──────────────────────────────────────────────────────────
  let y = 45;

  // Thông tin khách hàng & Giao dịch
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Billed to:", margin, y);
  doc.text("Date:", W - margin - 40, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("Valued Customer", margin, y); // Có thể thay bằng tx.userFullName nếu có
  doc.text(
    new Date(tx.paidAt || tx.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    }),
    W - margin, y, { align: "right" }
  );

  y += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Payment Method:", margin, y);
  doc.text("Receipt #:", W - margin - 40, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(tx.provider.toUpperCase(), margin, y);
  doc.text(tx.id.slice(0, 12).toUpperCase(), W - margin, y, { align: "right" });

  // ── Order Summary Table (Giống Email) ──────────────────────────────────
  y += 20;

  // Header Table
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y, contentW, 10, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("ORDER SUMMARY", margin + 5, y + 6.5);

  // Table Content
  y += 10;
  doc.rect(margin, y, contentW, 45, "D"); // Khung nội dung

  const row = (label: string, value: string, posY: number, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(isBold ? primary[0] : secondary[0], isBold ? primary[1] : secondary[1], isBold ? primary[2] : secondary[2]);
    doc.text(label, margin + 8, posY);
    doc.text(value, W - margin - 8, posY, { align: "right" });
  };

  row("Plan Name", "LexiVocab Premium", y + 12);
  row("Amount", `${tx.currency} ${tx.amount.toFixed(2)}`, y + 20);

  // Status với màu Emerald nếu thành công
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text("Status", margin + 8, y + 28);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.setFont("helvetica", "bold");
  doc.text("Paid", W - margin - 8, y + 28, { align: "right" });

  row("Reference ID", tx.externalOrderId || tx.id, y + 36);

  // ── Total Section ──────────────────────────────────────────────────────
  y += 45;
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.line(margin, y + 10, W - margin, y + 10);

  y += 20;
  doc.setFontSize(12);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Total Paid", margin + 8, y);

  // Box giá tiền nổi bật
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.roundedRect(W - margin - 50, y - 6, 50, 10, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(`${tx.currency} ${tx.amount.toFixed(2)}`, W - margin - 5, y + 1, { align: "right" });

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerY = H - 35;
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, W - margin, footerY);

  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const currentYear = new Date().getFullYear();
  doc.text(`© ${currentYear} LexiVocab Inc. All rights reserved.`, margin, footerY + 10);
  doc.text("Questions? Contact support@lexivocab.store", margin, footerY + 15);

  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text("lexivocab.store", W - margin, footerY + 10, { align: "right" });

  // Xuất file
  const fileName = `LexiVocab_Invoice_${tx.id.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(fileName);
}