import { dirname } from 'path';
import { fileURLToPath } from 'url';

export function getDirname (metaUrl: string): string {
    const filename = fileURLToPath(metaUrl);
    return dirname(filename);
}
