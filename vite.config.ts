import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/power_schedule/",
  plugins: [react()],
});
