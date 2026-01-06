import { createWriteStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');
const outputPath = resolve(projectRoot, 'token-extractor-extension.zip');

/**
 * Создает zip архив из папки dist
 */
async function createZip() {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Максимальное сжатие
    });

    output.on('close', () => {
      const sizeInBytes = archive.pointer();
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
      console.log(`✓ Архив создан: token-extractor-extension.zip`);
      console.log(`✓ Размер архива: ${sizeInKB} KB (${sizeInMB} MB)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Добавляем все файлы из dist
    addDirectoryToArchive(archive, distDir, distDir)
      .then(() => {
        archive.finalize();
      })
      .catch(reject);
  });
}

/**
 * Рекурсивно добавляет директорию в архив
 */
async function addDirectoryToArchive(archive, dirPath, basePath) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const relativePath = relative(basePath, fullPath);

    if (entry.isDirectory()) {
      await addDirectoryToArchive(archive, fullPath, basePath);
    } else {
      const stats = await stat(fullPath);
      archive.file(fullPath, { name: relativePath });
    }
  }
}

// Запускаем создание архива
createZip()
  .then(() => {
    console.log('\n✓ Расширение упаковано и готово к публикации!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Ошибка при создании архива:', error);
    process.exit(1);
  });

