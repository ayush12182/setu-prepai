import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        '/api/payment/orders': {
          target: 'https://api.cashfree.com/pg/orders', // FIXED: Production endpoint for Prod keys
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/payment\/orders/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('x-client-id', env.VITE_CASHFREE_APP_ID || '');
              proxyReq.setHeader('x-client-secret', env.VITE_CASHFREE_SECRET_KEY || '');
              proxyReq.setHeader('x-api-version', '2023-08-01');
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Accept', 'application/json');
            });
          }
        }
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
