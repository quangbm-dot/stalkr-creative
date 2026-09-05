import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import "./grid.css";
import "./index.css";
import "./responsive.css";
import App from "./App.tsx";

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
      <App />
    </StrictMode>,
  );

  // Báo Mindworks game đã sẵn sàng (Rất quan trọng để hiển thị đúng layout)
  // @ts-ignore
  if (window.gameReady) window.gameReady();
};

// Chạy luôn nếu script đã ở cuối body
render();