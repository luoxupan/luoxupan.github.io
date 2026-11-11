import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

const bases = {
  test: '//luoxupan.github.io/',
  pre: '//luoxupan.github.io/',
  production: '//luoxupan.github.io/wiki/pages/webapp/',
};

export default defineConfig(({ mode }) => ({
  base: mode in bases ? bases[mode] : '/',
  define: {
    'process.env.WEB_ENV': JSON.stringify(mode),
  },
  plugins: [
    react(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      symbolId: '[name]',
    }),
  ],
  resolve: {
    alias: {
      state: path.resolve(process.cwd(), 'src/state/index'),
      config: path.resolve(process.cwd(), 'src/config/index'),
      services: path.resolve(process.cwd(), 'src/services/index'),
      components: path.resolve(process.cwd(), 'src/components/index'),
      httprequest: path.resolve(process.cwd(), 'src/httprequest/index'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#F76A31',
          'link-color': '#F76A31',
          'border-radius-base': '4px',
        },
      },
    },
  },
  server: {
    host: 'localhost',
    port: 2001,
    open: true,
    proxy: {
      '/demo': 'http://localhost:8090',
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsInlineLimit: 500,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]_[hash].js',
        chunkFileNames: 'chunks/[name]_[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
}));
