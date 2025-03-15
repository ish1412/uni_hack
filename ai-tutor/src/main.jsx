import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Input from "./Input.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Input />
  </StrictMode>
);
