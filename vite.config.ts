import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Плагин для копирования manifest.json и иконок, переименования popup.html
const copyManifestPlugin = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const iconsDir = path.resolve(distDir, 'icons');
      
      // Создаем директорию icons если её нет
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }
      
      // Копируем manifest.json
      copyFileSync(
        path.resolve(__dirname, 'manifest.json'),
        path.resolve(distDir, 'manifest.json')
      );
      
      // Копируем иконки если они существуют
      const iconSizes = [16, 48, 128];
      iconSizes.forEach((size) => {
        const iconPath = path.resolve(__dirname, `icons/icon${size}.png`);
        if (existsSync(iconPath)) {
          copyFileSync(iconPath, path.resolve(iconsDir, `icon${size}.png`));
        }
      });
      
      // Переименовываем index.html в popup.html
      const indexHtmlPath = path.resolve(distDir, 'index.html');
      const popupHtmlPath = path.resolve(distDir, 'popup.html');
      if (existsSync(indexHtmlPath)) {
        renameSync(indexHtmlPath, popupHtmlPath);
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.html') {
            return 'popup.html';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
});

