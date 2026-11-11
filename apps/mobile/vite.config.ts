import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

/**
 * 402 基准等比缩放：把 CSS 声明值里的 px 换成 rem（16px = 1rem），配合 html.design-scale 的根字号随屏宽变化。
 * 绝对值 ≤ 1px 的细线保持物理像素；只改声明值，不改媒体查询等 at-rule 参数。详见 src/lib/design-scale.ts。
 */
const pxToRem = {
  postcssPlugin: "himate-px-to-rem",
  Declaration(decl: { value: string }) {
    if (!decl.value.includes("px")) return;
    decl.value = decl.value.replace(/(?<![\w.#-])(-?\d*\.?\d+)px\b/g, (match, value: string) => {
      const px = Number(value);
      return Math.abs(px) <= 1 ? match : `${Number((px / 16).toFixed(5))}rem`;
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: { postcss: { plugins: [pxToRem] } },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
