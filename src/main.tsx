import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import "./grid.css";
import "./index.css";
import "./responsive.css";
import App from "./App.tsx";
import Gallery from "./Components/Gallery/Gallery.tsx";
import cases from "virtual:v9-cases";
import poppins700Url from "./Assets/UI/poppins-700.woff2?url";
import bricolage700Url from "./Assets/UI/bricolage-grotesque-700.woff2?url";

// v20: preload 2 font weight đậm hay dùng nhất (tiêu đề + chữ in đậm trong
// khung chat, vd câu hỏi "Qx/y") ngay từ đầu — @font-face dùng font-display:
// swap nên lần ĐẦU TIÊN 1 đoạn chữ nào đó cần tới weight 700 mà file chưa
// tải xong, chữ hiện tạm bằng font hệ thống rồi mới "nhảy" sang Poppins/
// Bricolage thật khi tải xong (đổi kích thước chữ → nhìn như giật). Preload
// từ lúc mount app, xong trước khi người chơi tới màn câu hỏi (sau cả đoạn
// intro) nên tới lúc đó font chắc chắn đã sẵn, không còn "nhảy" nữa.
[poppins700Url, bricolage700Url].forEach((href) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
});

// v9: ?case=<id> chọn case; `npm run dev all` (nhiều case, không có ?case)
// thì hiện trang Gallery xem tất cả cùng lúc.
const caseParam = new URLSearchParams(location.search).get("case");
const activeCase = cases.find((c) => c.id === caseParam) ?? cases[0];
const showGallery = cases.length > 1 && !caseParam;

// Hàm render an toàn
const render = () => {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element missing - Retrying in 50ms");
    setTimeout(render, 50); // Thử lại nếu vẫn chưa thấy
    return;
  }
  
  createRoot(root).render(
    <StrictMode>
      {showGallery ? <Gallery cases={cases} /> : <App key={activeCase.id} caseData={activeCase.config} />}
    </StrictMode>,
  );

  // Báo Mindworks game đã sẵn sàng (Rất quan trọng để hiển thị đúng layout)
  // @ts-ignore
  if (window.gameReady) window.gameReady();
};

// Chạy luôn nếu script đã ở cuối body
render();