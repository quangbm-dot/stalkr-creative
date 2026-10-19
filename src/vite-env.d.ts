/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
/** v9: case được bundle — chỉ 1 case khi build (V9_CASE), tất cả khi `npm run dev all`. Xem vite.config.ts. */
declare module "virtual:v9-cases" {
  const cases: import("./cases/buildCase").V9Case[];
  export default cases;
}

/** v9: true khi build với V9_EASY=1 — xem vite.config.ts define(). */
declare const __V9_EASY__: boolean;
