import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 開発サーバー設定
  server: {
    port: 3000,
    host: true, // Docker対応
    hmr: {
      port: 3001, // HMR用ポート
    },
    proxy: {
      // バックエンドAPIプロキシ
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // WebSocketプロキシ
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  // プレビューサーバー設定
  preview: {
    port: 3000,
    host: true,
  },

  // ビルド設定
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // ベンダーチャンク分割
          vendor: ['react', 'react-dom'],
          webrtc: ['simple-peer', 'socket.io-client'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    // チャンクサイズ警告しきい値
    chunkSizeWarningLimit: 1000,
  },

  // パス解決設定
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },

  // 環境変数設定
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // 依存関係の最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'socket.io-client',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: [
      // WebWorkerで使用するモジュールは除外
      'audio-worklet-processor',
    ],
  },

  // CSS設定
  css: {
    devSourcemap: true,
    modules: {
      // CSS Modules設定
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./styles/variables.scss";`,
      },
    },
  },

  // WebWorker設定
  worker: {
    format: 'es',
    plugins: [
      // WebWorker用プラグイン
    ],
  },

  // テスト設定 (Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e'],
  },

  // 型チェック
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});