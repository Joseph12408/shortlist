/**
 * Cross-platform file download.
 *
 * The previous implementation created an object URL, clicked a synthetic anchor,
 * then revoked the URL on the very next line. That is unreliable everywhere and
 * broken on iOS specifically:
 *
 *   1. Revoking synchronously can cancel the transfer before the browser has
 *      started reading the blob.
 *   2. iOS Safari ignores the `download` attribute for blob: URLs. It renders
 *      the file in place instead, so the anchor click appears to do nothing.
 *
 * With most traffic on phones, that made PDF and DOCX export look broken for the
 * majority of users. This opens the blob in a new tab on iOS, where the user can
 * then use the share sheet to save, and keeps the anchor path everywhere else.
 */

/** iOS, including iPadOS which reports as a Mac with touch support. */
export function isIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return (
        /iPad|iPhone|iPod/.test(ua) ||
        (ua.includes("Macintosh") && typeof document !== "undefined" && "ontouchend" in document)
    );
}

export interface DownloadResult {
    /** True when the file opened in a tab rather than downloading outright. */
    openedInNewTab: boolean;
    /** True when a popup blocker prevented the iOS fallback. */
    blocked: boolean;
}

export function downloadBlob(blob: Blob, filename: string): DownloadResult {
    const url = URL.createObjectURL(blob);

    // Give the browser time to start reading before releasing the URL. Revoking
    // immediately is the classic cause of silently truncated downloads.
    const release = () => setTimeout(() => URL.revokeObjectURL(url), 60_000);

    if (isIOS()) {
        // `download` is ignored here, so hand the file to a new tab and let the
        // user save it via the share sheet.
        const tab = window.open(url, "_blank");
        release();

        if (!tab) {
            return { openedInNewTab: false, blocked: true };
        }
        return { openedInNewTab: true, blocked: false };
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    release();

    return { openedInNewTab: false, blocked: false };
}
