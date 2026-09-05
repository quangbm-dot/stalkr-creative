const storeUrl = {
    Android: "https://play.google.com/store/apps/details?id=com.stalkr.mobile.detective",
    IOS: "https://apps.apple.com/us/app/id6798600853"
}

export default function openLinkApp() {
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
    console.warn("[AdController] No ad SDK bridge matched — CTA click had no effect.");
}
