function mraidFixInstall() {
const storeUrl = {
    Android: "https://play.google.com/store/apps/details?id=com.stalkr.mobile.detective",
    IOS: "https://apps.apple.com/us/app/id6798600853"
}

  if (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX) {
    mraid.open(storeUrl.IOS);
    return;
  }

  mraid.open(storeUrl.Android);
}
