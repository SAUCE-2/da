import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
		}),
		tailwindcss(),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		basicSsl(),
	],
	resolve: {
		alias: {
			"@": new URL("./src", import.meta.url).pathname,
		},
	},
	server: {
		host: true,
		proxy: {
			"/api": "http://localhost:8080",
		},
	},
});
