import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import "./grid.css";
import "./index.css";
import "./responsive.css";
import App from "./App.tsx";
import Gallery from "./Components/Gallery/Gallery.tsx";
import cases from "virtual:v9-cases";

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