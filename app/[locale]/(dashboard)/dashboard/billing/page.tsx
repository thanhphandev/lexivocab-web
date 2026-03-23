"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PendingTransactionBanner } from "@/components/billing/pending-transaction-banner";
import { SepayQRDialog } from "@/components/billing/sepay-qr-dialog";
import { CurrentPlanCard } from "./_components/current-plan-card";
import { PermissionsCard } from "./_components/permissions-card";
import { QuotaCard } from "./_components/quota-card";
import { UpgradeCTACard } from "./_components/upgrade-cta-card";
import { PaymentHistoryCard } from "./_components/payment-history-card";
import { useBillingData } from "./_hooks/use-billing-data";
import { usePaymentActions } from "./_hooks/use-payment-actions";
import { useSepayPolling } from "./_hooks/use-sepay-polling";

export default function BillingPage() {
  const locale = useLocale();
  const perms = usePermissions();
  const t = useTranslations("Billing");
  const tPricing = useTranslations("Pricing");
  const tErrors = useTranslations("errors");

  const { billing, setBilling, history, isLoading, pendingTransaction, setPendingTransaction } =
    useBillingData();

  const {
    confirmCancelOpen,
    setConfirmCancelOpen,
    isCancelling,
    confirmCancelPendingOpen,
    setConfirmCancelPendingOpen,
    downloadingId,
    handleCancelSubscription,
    handleCancelPending,
    handleDownloadInvoice,
  } = usePaymentActions({ t, tPricing, tErrors });

  const [qrData, setQrData] = useState<{
    url: string;
    ref: string;
    expiresAt?: string | null;
  } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useSepayPolling({
    isPolling,
    qrRef: qrData?.ref || null,
    locale,
    onComplete: () => setIsPolling(false),
    onFailed: () => {
      setIsPolling(false);
      setQrData(null);
      setPendingTransaction(null);
    },
  });

  const handleResumePending = () => {
    if (!pendingTransaction || !pendingTransaction.approvalUrl) return;

    setQrData({
      url: pendingTransaction.approvalUrl,
      ref: pendingTransaction.externalOrderId,
      expiresAt: pendingTransaction.expiresAt ?? null,
    });
    setIsPolling(true);
  };

  const handleCancelPendingWrapper = () => {
    if (!pendingTransaction) return;
    handleCancelPending(pendingTransaction.externalOrderId, () => {
      setPendingTransaction(null);
      setQrData(null);
      setIsPolling(false);
    });
  };

  const handleCancelSubscriptionWrapper = () => {
    handleCancelSubscription((status) => {
      setBilling((prev) =>
        prev
          ? {
              ...prev,
              activeSubscription: prev.activeSubscription
                ? { ...prev.activeSubscription, status }
                : null,
            }
          : null
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {pendingTransaction && (
        <PendingTransactionBanner
          transaction={pendingTransaction}
          onResume={handleResumePending}
          onCancel={() => setConfirmCancelPendingOpen(true)}
          className="mb-8"
        />
      )}

      <CurrentPlanCard
        t={t}
        tPricing={tPricing}
        locale={locale}
        billing={billing}
        isPremium={perms.isPremium}
        quotaMax={perms.quotaMax}
        onCancelSubscription={() => setConfirmCancelOpen(true)}
        isCancelling={isCancelling}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <PermissionsCard
          t={t}
          canExport={perms.canExport}
          canUseAi={perms.canUseAi}
          canBatchImport={perms.canBatchImport}
        />
        <QuotaCard
          t={t}
          quotaUsed={perms.quotaUsed}
          quotaMax={perms.quotaMax}
          aiUsed={perms.aiUsed}
          aiMax={perms.aiMax}
          transUsed={perms.transUsed}
          transMax={perms.transMax}
        />
      </div>

      <UpgradeCTACard
        locale={locale}
        tPricing={tPricing}
        isPremium={perms.isPremium}
        displayOrder={perms.displayOrder}
      />

      <PaymentHistoryCard
        t={t}
        history={history}
        totalTransactions={billing?.totalTransactions}
        downloadingId={downloadingId}
        onDownloadInvoice={handleDownloadInvoice}
      />

      <SepayQRDialog qrData={qrData} onOpenChange={(open) => !open && setQrData(null)} />

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title={t("subscription_details.cancel_title")}
        description={t("subscription_details.cancel_desc")}
        onConfirm={handleCancelSubscriptionWrapper}
        confirmText={
          isCancelling
            ? t("subscription_details.cancelling")
            : t("subscription_details.cancel_confirm")
        }
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmCancelPendingOpen}
        onOpenChange={setConfirmCancelPendingOpen}
        title={tPricing("pending_transaction.cancel_confirm_title")}
        description={tPricing("pending_transaction.cancel_confirm_desc")}
        onConfirm={handleCancelPendingWrapper}
        confirmText={
          isCancelling
            ? tPricing("processing")
            : tPricing("pending_transaction.cancel_confirm_btn")
        }
        variant="destructive"
      />
    </div>
  );
}
