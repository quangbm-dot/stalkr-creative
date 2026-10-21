const storeUrl = {
    Android: "https://play.google.com/store/apps/details?id=com.stalkr.mobile.detective",
    IOS: "https://apps.apple.com/us/app/id6798600853"
}

// Có đang chạy trong webview/iframe của 1 mạng quảng cáo thật hay không (bất
// kỳ SDK nào trong danh sách openLinkApp() nhận ra, hoặc đang bị nhúng
// iframe) — dùng để quyết định có cần chừa khoảng trống cho nút Skip/Close
// do mạng quảng cáo tự vẽ đè lên hay không (xem PhoneFrame.tsx). Test trực
// tiếp bằng tab trình duyệt thường thì không khớp cái nào, trả về false.
// Báo event cho AppLovin Playable Analytics (window.ALPlayableAnalytics) —
// no-op im lặng trên mọi mạng khác/khi test bằng tab trình duyệt thường,
// vì chỉ mạng AppLovin mới tiêm biến này vào.
export function trackPlayableEvent(event: string) {
    try {
        if (typeof (window as any).ALPlayableAnalytics !== "undefined") {
            (window as any).ALPlayableAnalytics.trackEvent(event);
        }
    } catch (e) {}
}

export function hasAdSdkBridge() {
    try { if ((window as any).openAppStore) return true; } catch (e) {}
    try { if ((window as any).ExitApi?.exit) return true; } catch (e) {}
    try { if ((window as any).dapi?.openStoreUrl) return true; } catch (e) {}
    try { if ((window as any).FbPlayableAd?.onCTAClick) return true; } catch (e) {}
    try { if ((window as any).install) return true; } catch (e) {}
    try { if ((window as any).mraid) return true; } catch (e) {}
    try { if ((window as any).callSDK) return true; } catch (e) {}
    try { if (window.parent && window.parent !== window) return true; } catch (e) {}
    return false;
}

export default function openLinkApp() {
    trackPlayableEvent("CTA_CLICKED");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Mỗi nhánh tách try/catch riêng — 1 SDK bị lỗi/thiếu hàm con không
    // được làm hỏng luôn cả chuỗi fallback phía sau.
    try { if ((window as any).openAppStore) { (window as any).openAppStore(); return; } } catch (e) {}
    try { if ((window as any).ExitApi?.exit) { (window as any).ExitApi.exit(); return; } } catch (e) {}
    try { if ((window as any).dapi?.openStoreUrl) { (window as any).dapi.openStoreUrl(); return; } } catch (e) {}
    try { if ((window as any).FbPlayableAd?.onCTAClick) { (window as any).FbPlayableAd.onCTAClick(); return; } } catch (e) {}
    try {
        if ((window as any).install) {
            (window as any).install();
            (window as any).gameEnd && (window as any).gameEnd();
            return;
        }
    } catch (e) {}
    try {
        if ((window as any).mraid) {
            const mraid = (window as any).mraid;
            mraid.open(isIOS ? storeUrl.IOS : storeUrl.Android);
            return;
        }
    } catch (e) {}
    try { if ((window as any).callSDK) { (window as any).callSDK('download'); return; } } catch (e) {}
    // Chạy trong iframe nhưng không SDK nào khớp — báo ra ngoài cho khung
    // cha (mạng quảng cáo) tự xử lý CTA.
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage("cta_click", "*");
            return;
        }
    } catch (e) {}
    // Không SDK nào khớp VÀ không chạy trong iframe — nghĩa là đang mở file
    // HTML trực tiếp bằng trình duyệt thường để test (không phải trong
    // webview mạng quảng cáo thật), nên tự mở thẳng link store ở tab mới để
    // còn test được CTA, thay vì im lặng không làm gì.
    try {
        window.open(isIOS ? storeUrl.IOS : storeUrl.Android, "_blank", "noopener,noreferrer");
        return;
    } catch (e) {}
    console.warn("[AdController] No ad SDK bridge matched — CTA click had no effect.");
}
