import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "./providers/QueryClientProvider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider>
    <App />
  </QueryClientProvider>
);
