import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
    // ★ historyApiFallback 은 server 내부가 아니라 루트 레벨에서 설정해야 함
    build: {
        // 배포 환경 고려해서 history fallback 작동하도록
    },

    server: {
        host: "::",
        port: 3000,

        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            }
        }
    },

    // ★ Vite 5 기준 SPA fallback은 아래 방식으로 자동 적용됨
    // 별도 historyApiFallback 옵션이 필요 없음
    // 단, proxy 경로가 HTML 반환을 가로채지 않도록 해야 함

    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));