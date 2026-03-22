import { toast } from "sonner";
import { ApiErrorResponse } from "./api/types";

export const getErrorMessage = (res: any, tErrors: any, defaultMsg: string): string => {
    if (typeof res === "string") return res;
    if (res && typeof res === "object") {
        if (res.errorCode && tErrors) {
            try {
                const i18nStr = tErrors(res.errorCode);
                if (i18nStr && i18nStr !== res.errorCode && !i18nStr.includes("errors.")) {
                    return i18nStr;
                }
            } catch {
                // If translation key is missing, next-intl may throw 
            }
        }
        if (res.error) return res.error;
    }
    return defaultMsg;
};

export const getLocalizedApiError = (
    res: unknown,
    tErrors: any,
    defaultMsg: string
): string => {
    return getErrorMessage(res, tErrors, defaultMsg);
};

export const showErrorToast = (
    res: ApiErrorResponse | { error?: string, traceId?: string, errorCode?: string } | string | unknown,
    defaultMsg: string,
    tErrors?: any
) => {
    let message = defaultMsg;
    let traceId: string | undefined = undefined;

    if (tErrors) {
        message = getErrorMessage(res, tErrors, defaultMsg);
    } else {
        if (typeof res === "string") {
            message = res;
        } else if (res && typeof res === "object") {
            const errorObj = res as { error?: string, traceId?: string };
            if (errorObj.error) {
                message = errorObj.error;
            }
        }
    }

    if (res && typeof res === "object") {
        const errorObj = res as { traceId?: string };
        if (errorObj.traceId) {
            traceId = errorObj.traceId;
        }
    }

    if (traceId) {
        toast.error(message, {
            description: `Trace ID: ${traceId}`,
            duration: 8000,
        });
    } else {
        toast.error(message);
    }
};
