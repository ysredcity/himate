import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HostPreviewLayout } from "./preview/host-preview-layout";
const standalone =
  new URLSearchParams(window.location.search).get("preview") === "web";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {standalone ? <App /> : <HostPreviewLayout />}
  </React.StrictMode>,
);
