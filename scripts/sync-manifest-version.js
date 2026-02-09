import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const packagePath = resolve(projectRoot, 'package.json');
const manifestPath = resolve(projectRoot, 'manifest.json');

/**
 * Синхронизирует версию из package.json в manifest.json
 */
function syncManifestVersion() {
  const { version } = JSON.parse(readFileSync(packagePath, 'utf-8'));
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  manifest.version = version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`✓ Версия в manifest.json обновлена: ${version}`);
  return version;
}

syncManifestVersion();
