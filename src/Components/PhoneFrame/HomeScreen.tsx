import { useLayoutEffect, useRef, type PointerEvent } from "react";
import type { CaseConfig, AppKey } from "../../types/case";
import TapHint from "../TapHint/TapHint";
import styles from "./HomeScreen.module.scss";

interface HomeScreenProps {
  caseData: CaseConfig;
  onOpenApp: (app: AppKey) => void;
  /** App cần mở cho câu hỏi bằng chứng hiện tại — bàn tay gợi ý trỏ vào đúng
   *  icon này, đổi theo từng câu; undefined thì không hiện gợi ý. */
  hintApp?: AppKey;
  /** Nâng state trang hiện tại lên App — HomeScreen bị unmount mỗi khi mở
   *  app con nên state cục bộ sẽ mất, quay lại Home phải nhớ đúng trang cũ. */
  activePage: number;
  onActivePageChange: (page: number) => void;
}

export default function HomeScreen({
  caseData,
  onOpenApp,
  hintApp,
  activePage,
  onActivePageChange,
}: HomeScreenProps) {
  const pages = caseData.home.pages;
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Khôi phục đúng vị trí cuộn ngang khi HomeScreen mount lại (sau khi đóng
  // app con) — scrollLeft là DOM state, không tự nhớ như React state.
  // Dùng useLayoutEffect (chạy trước khi trình duyệt vẽ frame) thay vì
  // useEffect, tránh chớp 1 frame ở trang đầu (scrollLeft=0 mặc định)
  // trước khi nhảy sang đúng trang đã lưu.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = activePage * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const drag = useRef<{
    startX: number;
    startScroll: number;
    dragging: boolean;
    moved: boolean;
    app: AppKey | null;
    pendingLeft: number | null;
    rafId: number | null;
  } | null>(null);

  const goToPage = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    onActivePageChange(clamped);
  };

  // Swipe/kéo bằng chuột hoặc chạm để chuyển hẳn sang trang kế tiếp/trước,
  // giống thao tác vuốt tab thật thay vì kéo thanh cuộn. setPointerCapture
  // khiến sự kiện click gốc trên nút icon không còn bắn ra được, nên việc
  // "mở app" được xử lý thẳng ở đây (pointerup) thay vì dựa vào onClick.
  // Set scrollLeft trực tiếp trong mỗi pointermove ép trình duyệt reflow đồng
  // bộ liên tục -> giật lag. Gom lại, chỉ ghi 1 lần mỗi frame qua rAF.
  const flushDrag = () => {
    const el = scrollerRef.current;
    const d = drag.current;
    if (!el || !d || d.pendingLeft === null) return;
    el.scrollLeft = d.pendingLeft;
    d.pendingLeft = null;
    d.rafId = null;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-app]");
    drag.current = {
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragging: true,
      moved: false,
      app: (target?.dataset.app as AppKey) ?? null,
      pendingLeft: null,
      rafId: null,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d?.dragging) return;
    const delta = e.clientX - d.startX;
    if (Math.abs(delta) > 4) d.moved = true;
    d.pendingLeft = d.startScroll - delta;
    if (d.rafId === null) d.rafId = requestAnimationFrame(flushDrag);
  };

  const onPointerUp = () => {
    const el = scrollerRef.current;
    const d = drag.current;
    if (!el || !d) return;
    if (d.rafId !== null) cancelAnimationFrame(d.rafId);
    flushDrag();
    const { moved, app } = d;
    d.dragging = false;

    if (!moved && app) {
      onOpenApp(app);
      return;
    }
    const nearest = Math.round(el.scrollLeft / el.clientWidth);
    goToPage(nearest);
  };

  return (
    <div className={styles.home}>
      <img className={styles.wallpaper} src={caseData.wallpaper} alt="" />

      <div
        className={styles.pager}
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {pages.map((icons, pageIndex) => (
          <div className={styles.pgrid} key={pageIndex}>
            {icons.map((item) => (
              <button
                key={item.app}
                type="button"
                className={styles.cell}
                data-app={item.app}
                data-hint={`app-${item.app}`}
              >
                <img className={styles.appicon} src={item.icon} alt={item.label} />
                <span className={styles.label}>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className={styles.dots}>
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1}`}
              className={i === activePage ? styles.dotActive : styles.dot}
              onClick={() => goToPage(i)}
            />
          ))}
        </div>
      )}

      {hintApp && <TapHint key={hintApp} targetSelector={`[data-hint="app-${hintApp}"]`} idleMs={800} />}

      <div
        className={styles.dock}
        onPointerUp={(e) => {
          const target = (e.target as HTMLElement).closest<HTMLElement>("[data-app]");
          const app = target?.dataset.app as AppKey | undefined;
          if (app) onOpenApp(app);
        }}
      >
        {caseData.home.dock.map((item) => (
          <button
            key={item.app}
            type="button"
            className={styles.dockCell}
            data-app={item.app}
            data-hint={`app-${item.app}`}
          >
            <img className={styles.appicon} src={item.icon} alt={item.label} />
          </button>
        ))}
      </div>
    </div>
  );
}
