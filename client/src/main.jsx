// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store";

// --- Global Fetch Interceptor ---
// Automatically appends "Authorization: Bearer <token>" to every fetch request
// if a JWT token exists in localStorage. This avoids manual token injection
// in every component's fetch call.
const { fetch: originalFetch } = window;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.headers instanceof Headers) {
      if (!options.headers.has("Authorization")) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    } else if (Array.isArray(options.headers)) {
      const hasAuth = options.headers.some(
        ([key]) => key.toLowerCase() === "authorization"
      );
      if (!hasAuth) {
        options.headers.push(["Authorization", `Bearer ${token}`]);
      }
    } else {
      if (!options.headers["Authorization"]) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
