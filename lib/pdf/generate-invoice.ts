/**
 * Client-side PDF invoice generator using jsPDF.
 * Produces a professional A4 invoice for LexiVocab payment transactions.
 */
import type { PaymentHistoryDto } from "@/lib/api/types";

export async function downloadInvoicePdf(tx: PaymentHistoryDto): Promise<void> {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const margin = 20;
    const contentW = W - margin * 2;

    // ── Brand header ──────────────────────────────────────────────────────────
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 0, W, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LexiVocab", margin, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Vocabulary Learning Platform", margin, 26);
    doc.text("support@lexivocab.com  ·  lexivocab.com", margin, 32);

    // ── Invoice title ─────────────────────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", margin, 56);

    // Invoice meta (right side)
    const metaX = W - margin;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    const invoiceDate = tx.paidAt
        ? new Date(tx.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : new Date(tx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    doc.text(`Invoice Date:`, metaX - 60, 50, { align: "left" });
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceDate, metaX, 50, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #:`, metaX - 60, 56, { align: "left" });
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(tx.id.slice(0, 8).toUpperCase(), metaX, 56, { align: "right" });

    // ── Divider ───────────────────────────────────────────────────────────────
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.4);
    doc.line(margin, 62, W - margin, 62);

    // ── Transaction details table ─────────────────────────────────────────────
    let y = 72;

    // Table header
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin, y - 5, contentW, 10, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 100);
    doc.text("DESCRIPTION", margin + 4, y + 1);
    doc.text("DETAILS", W - margin - 4, y + 1, { align: "right" });

    y += 12;

    // Table rows
    const rows: [string, string][] = [
        ["Transaction ID", tx.externalOrderId],
        ["Payment Provider", tx.provider],
        ["Payment Status", tx.status],
        ["Created At", new Date(tx.createdAt).toLocaleString("en-US")],
        ["Paid At", tx.paidAt ? new Date(tx.paidAt).toLocaleString("en-US") : "—"],
        ["Currency", tx.currency],
    ];

    doc.setFont("helvetica", "normal");
    rows.forEach(([label, value], i) => {
        const rowY = y + i * 10;
        if (i % 2 === 0) {
            doc.setFillColor(252, 252, 255);
            doc.rect(margin, rowY - 4, contentW, 10, "F");
        }
        doc.setTextColor(90, 90, 110);
        doc.setFontSize(9);
        doc.text(label, margin + 4, rowY + 1);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text(value, W - margin - 4, rowY + 1, { align: "right" });
        doc.setFont("helvetica", "normal");
    });

    y += rows.length * 10 + 8;

    // ── Total amount box ──────────────────────────────────────────────────────
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT PAID", margin + 6, y + 7);

    doc.setFontSize(14);
    doc.text(
        `${tx.currency} ${tx.amount.toFixed(2)}`,
        W - margin - 6,
        y + 7,
        { align: "right" }
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Subscription — LexiVocab", margin + 6, y + 13);

    y += 28;

    // ── Status badge ──────────────────────────────────────────────────────────
    const statusColor: Record<string, [number, number, number]> = {
        Completed: [16, 185, 129],
        Pending: [245, 158, 11],
        Failed: [239, 68, 68],
        Refunded: [59, 130, 246],
    };
    const [r, g, b] = statusColor[tx.status] ?? [100, 100, 100];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, 36, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(tx.status.toUpperCase(), margin + 18, y + 5.5, { align: "center" });

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = 272;
    doc.setDrawColor(220, 220, 230);
    doc.line(margin, footerY, W - margin, footerY);

    doc.setTextColor(150, 150, 160);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your subscription to LexiVocab Premium.", W / 2, footerY + 6, { align: "center" });
    doc.text("This is an automatically generated invoice. For support: support@lexivocab.com", W / 2, footerY + 11, { align: "center" });
    doc.text(`Generated on ${new Date().toLocaleString("en-US")}`, W / 2, footerY + 16, { align: "center" });

    // ── Save ──────────────────────────────────────────────────────────────────
    const fileName = `lexivocab-invoice-${tx.externalOrderId.slice(0, 12)}.pdf`;
    doc.save(fileName);
}
