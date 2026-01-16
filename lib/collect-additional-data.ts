/** Collect user environment metadata for debugging */
export const collectMetadata = (extVersion: string | null, locale: string): Record<string, string> => {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/')) browser = 'Safari';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';

    return {
        browser,
        os,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        extVersion: extVersion || 'N/A',
        locale,
    };
}