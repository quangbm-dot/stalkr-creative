/**
 * v13: avatar chữ cái đầu có màu theo tên (ổn định giữa các lần render) — không dùng
 * ảnh thật cho liên hệ trong Messages/WhatsApp để các cô gái không bị lộ giữa liên hệ rác.
 */
const PALETTE = ["#e0457b", "#f97316", "#d97706", "#16a34a", "#0d9488", "#9333ea", "#db2777", "#dc2626", "#65a30d", "#c2410c"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
