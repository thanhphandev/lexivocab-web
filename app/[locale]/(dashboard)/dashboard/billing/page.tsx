"use client";

import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

export default function BillingPage() {
  const locale = useLocale();
  const perms = usePermissions();
  const t = useTranslations("Billing");
  const tPricing = useTranslations("Pricing");
  const tErrors = useTranslations("errors");

  const { billing, setBilling, history, isLoading, pendingTransaction, setPendingTransaction } =
    useBillingData();

  // Auto-refresh permissions when quota update events occur
  useEffect(() => {
    const handleQuotaUpdate = () => {
      perms.refreshPermissions();
    };

    window.addEventListener("quota-updated", handleQuotaUpdate);
    
    return () => {
      window.removeEventListener("quota-updated", handleQuotaUpdate);
    };
  }, [perms]);

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
      <motion.div 
        className="flex justify-center items-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.6, repeat: Infinity }
          }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-10 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {/* Pending Transaction Banner */}
      <AnimatePresence mode="wait">
        {pendingTransaction && (
          <motion.div
            key="pending-banner"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <PendingTransactionBanner
              transaction={pendingTransaction}
              onResume={handleResumePending}
              onCancel={() => setConfirmCancelPendingOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Plan & CTA */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Current Plan Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
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
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ y: -4 }}
            style={{ transition: "transform 0.2s ease-out" }}
          >
            <UpgradeCTACard
              locale={locale}
              tPricing={tPricing}
              isPremium={perms.isPremium}
              displayOrder={perms.displayOrder}
            />
          </motion.div>
        </motion.div>

        {/* Right Column - Stats */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {/* Permissions Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <PermissionsCard
              t={t}
              canExport={perms.canExport}
              canUseAi={perms.canUseAi}
              canBatchImport={perms.canBatchImport}
            />
          </motion.div>
          
          {/* Quota Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{ transition: "transform 0.2s ease-out" }}
          >
            <QuotaCard
              t={t}
              quotaUsed={perms.quotaUsed}
              quotaMax={perms.quotaMax}
              aiUsed={perms.aiUsed}
              aiMax={perms.aiMax}
              transUsed={perms.transUsed}
              transMax={perms.transMax}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Payment History - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <PaymentHistoryCard
          t={t}
          history={history}
          totalTransactions={billing?.totalTransactions}
          downloadingId={downloadingId}
          onDownloadInvoice={handleDownloadInvoice}
        />
      </motion.div>

      {/* Dialogs */}
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
    </motion.div>
  );
}
