import React from "react";
import { createRoot } from "react-dom/client";
import DoBeeApp from "./task.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DoBeeApp />
  </React.StrictMode>
);
