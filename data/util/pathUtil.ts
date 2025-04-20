import { existsSync, mkdirSync, rmSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export function getDirname (metaUrl: string): string {
    const filename = fileURLToPath(metaUrl);
    return dirname(filename);
}

export function ensureEmptyDir (dir: string): void {
    if (existsSync(dir)) {
        rmSync(dir, { 'force': true, 'recursive': true });
    }

    if (!existsSync(dir)) {
        mkdirSync(dir, { 'recursive': true });
    }
}
