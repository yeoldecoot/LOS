import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "/LOS/",
	build: {
		target: "esnext", // <- allows top-level await
	},
	server: {
		port: 8080,
		open: true,
	},
});
