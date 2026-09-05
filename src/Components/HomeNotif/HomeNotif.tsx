import { useEffect, useState } from "react";
import type { CaseConfig } from "../../types/case";
import styles from "./HomeNotif.module.scss";

interface HomeNotifProps {
  caseData: CaseConfig;
  onDone: () => void;
}

const iconModules = import.meta.glob("../../Assets/UI/*.webp", { eager: true, import: "default" }) as Record<
  string,
  string
>;

const LABELS: Record<string, string> = {
  hinge: "Hinge",
  gmail: "Gmail",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  paypal: "PayPal",
  googlephotos: "Photos",
  calculator: "Calculator",
  amazon: "Amazon",
  appstore: "App Store",
  photoshop: "Photoshop",
  calendar: "Calendar",
  googledrive: "Drive",
  googlemaps: "Maps",
  chatgpt: "ChatGPT",
  scanner: "Scanner",
  compass: "Compass",
  photos: "Photos",
  health: "Health",
  notes: "Notes",
  safari: "Safari",
  wallet: "Wallet",
  alarm: "Clock",
  settings: "Settings",
  revobank: "RevoBank",
  uber: "Uber",
  translate: "Translate",
  spotify: "Spotify",
  whatsapp: "WhatsApp",
  findmy: "Find My",
  music: "Music",
  messages: "Messages",
  airbnb: "Airbnb",
  phone: "Phone",
  weather: "Weather",
  trainline: "Trainline",
  fitness: "Fitness",
  camera: "Camera",
  instagram: "Instagram",
};

/** Icon nào là app nguồn của noti (hiện badge + banner) — khớp caseData.notif.appName. */
const NOTIF_ICON_KEY = "instagram";

/** Chỉ hiện đúng bộ app này trên Home (theo yêu cầu), giữ nguyên thứ tự. */
const HOME_ICON_KEYS = [
  "hinge",
  "photos",
  "notes",
  "calendar",
  "weather",
  "instagram",
  "airbnb",
  "revobank",
  "wallet",
];

const iconByKey = Object.fromEntries(
  Object.entries(iconModules).map(([path, url]) => [path.split("/").pop()!.replace(/\.webp$/, ""), url])
);

const ICONS = HOME_ICON_KEYS.map((key) => ({ key, label: LABELS[key] ?? key, url: iconByKey[key] })).filter(
  (i) => i.url
);

/**
 * Màn Home ngắn trước khi vào post: lưới icon app thật (trang trí cho giống
 * điện thoại thật), icon nguồn noti hiện badge số, rồi 1 banner noti tụt
 * xuống từ trên, tự "được bấm vào" sau vài giây rồi chuyển sang PostScene.
 */
export default function HomeNotif({ caseData, onDone }: HomeNotifProps) {
  const [showBadge, setShowBadge] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowBadge(true), 500);
    const t2 = setTimeout(() => setShowBanner(true), 1200);
    const t3 = setTimeout(() => setTapped(true), 2900);
    const t4 = setTimeout(onDone, 3300);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifIcon = ICONS.find((i) => i.key === NOTIF_ICON_KEY);

  return (
    <div className={styles.home}>
      <img className={styles.wallpaper} src={caseData.homeWallpaper} alt="" />
      <div className={styles.grid}>
        {ICONS.map((icon) => (
          <div className={styles.cell} key={icon.key}>
            <div className={`${styles.icon} ${icon.key === NOTIF_ICON_KEY && showBadge ? styles.jiggle : ""}`}>
              <img className={styles.iconImg} src={icon.url} alt="" />
              {icon.key === NOTIF_ICON_KEY && showBadge && (
                <span className={styles.badge}>{caseData.notifBadgeCount}</span>
              )}
            </div>
            <span className={styles.label}>{icon.label}</span>
          </div>
        ))}
      </div>

      {showBanner && (
        <div className={`${styles.banner} ${tapped ? styles.tapped : ""}`}>
          {notifIcon && <img className={styles.bannerIcon} src={notifIcon.url} alt="" />}
          <div className={styles.bannerBody}>
            <div className={styles.bannerHead}>
              <span className={styles.bannerApp}>{caseData.notif.appName}</span>
              <span className={styles.bannerLikes}>♥ +{caseData.notif.newLikes}</span>
              <span className={styles.bannerTime}>now</span>
            </div>
            <div className={styles.bannerText}>{caseData.notif.preview}</div>
          </div>
        </div>
      )}
    </div>
  );
}
