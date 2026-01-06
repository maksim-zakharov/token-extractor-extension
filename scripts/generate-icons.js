import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '../icons');

// Создаем директорию icons если её нет
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 48, 128];

try {
  // Пробуем использовать sharp если установлен
  const sharp = await import('sharp').catch(() => null);
  
  if (sharp?.default) {
    // Создаем простую иконку с текстом "T" (Token)
    for (const size of sizes) {
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" 
                font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">T</text>
        </svg>
      `;
      
      await sharp.default(Buffer.from(svg))
        .png()
        .toFile(resolve(iconsDir, `icon${size}.png`));
      
      console.log(`✓ Создана иконка icon${size}.png`);
    }
    console.log('\n✓ Все иконки успешно созданы!');
  } else {
    // Если sharp не установлен, создадим простые заглушки
    console.log('Sharp не установлен, создаю простые заглушки...');
    createFallbackIcons();
  }
} catch (error) {
  console.log('Ошибка при использовании sharp, создаю заглушки...', error.message);
  createFallbackIcons();
}

function createFallbackIcons() {
  // Создаем простые PNG заглушки используя минимальный валидный PNG
  // Это базовый синий квадрат, который браузер масштабирует
  // Минимальный валидный PNG (синий пиксель 1x1)
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
    0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x5C, 0xC2, 0x8F, 0xA0, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  sizes.forEach(size => {
    writeFileSync(resolve(iconsDir, `icon${size}.png`), minimalPNG);
    console.log(`✓ Создана заглушка icon${size}.png`);
  });
  
  console.log('\n⚠ Внимание: Созданы минимальные заглушки иконок.');
  console.log('Для лучшего качества установите sharp: npm install -D sharp');
  console.log('и перезапустите скрипт: npm run generate-icons');
}

