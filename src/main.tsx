import React from "react";
import './styles/index.css'
import { createRoot } from "react-dom/client";
import App from "./app/App";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);