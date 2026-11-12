import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HostPreviewLayout } from "./preview/host-preview-layout";
const standalone =
  new URLSearchParams(window.location.search).get("preview") === "web";
// 产品页面与宿主预览外壳都按 402 基准等比缩放（见 src/lib/design-scale.ts）
document.documentElement.classList.add("design-scale");
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {standalone ? <App /> : <HostPreviewLayout />}
  </React.StrictMode>,
);
